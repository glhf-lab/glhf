"use strict";

/**
 *  steam-user controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
// const path = require("path"); // No longer needed here
// const fs = require("fs"); // No longer needed here

// saveOwnedGames function is removed as its logic is now in the cron job helper

module.exports = createCoreController(
  "api::steam-user.steam-user",
  ({ strapi }) => {
    // Helper function to ensure an owned games sync job is created if needed
    // steamUserEntityId is the ID of the 'api::steam-user.steam-user' entity
    const _ensureOwnedGamesSyncJob = async (steamUserEntityId) => {
      if (!steamUserEntityId) {
        console.error(
          `[Steam User - Queue Owned Games] steamUserEntityId not provided. Cannot create sync job.`
        );
        return false;
      }

      // Fetch the steam-user entity to get its related user and their steamHasOwnedGames status
      const steamUserWithRelatedUser = await strapi.entityService.findOne(
        "api::steam-user.steam-user",
        steamUserEntityId,
        {
          populate: { user: { fields: ["id", "steamHasOwnedGames"] } },
        }
      );

      if (!steamUserWithRelatedUser || !steamUserWithRelatedUser.user) {
        console.error(
          `[Steam User - Queue Owned Games] Failed to find user associated with Steam User Profile ${steamUserEntityId}.`
        );
        return false;
      }
      const user = steamUserWithRelatedUser.user; // This is the 'plugin::users-permissions.user'
      const userId = user.id; // for logging clarity

      if (user.steamHasOwnedGames === false) {
        // 'steam-owned-games-sync-job' now has a 'steam_user' relation to 'api::steam-user.steam-user'
        const existingJob = await strapi.entityService.findMany(
          "api::steam-owned-games-sync-job.steam-owned-games-sync-job",
          {
            filters: {
              steamUser: steamUserEntityId, // Filter by the steam_user relation ID
              status: { $in: ["pending", "processing", "retry"] },
            },
          }
        );
        if (existingJob.length === 0) {
          await strapi.entityService.create(
            "api::steam-owned-games-sync-job.steam-owned-games-sync-job",
            {
              data: {
                steamUser: steamUserEntityId, // Link to the steam-user entity
                status: "pending",
                attempts: 0,
              },
            }
          );
          console.log(
            `[Steam User - Queue Owned Games] Created owned games sync job for user ${userId}.`
          );
          return true; // Job created
        } else {
          console.log(
            `[Steam User - Queue Owned Games] Owned games sync job already pending/processing for user ${userId}`
          );
          return false; // Job already exists
        }
      } else if (user.steamHasOwnedGames === true) {
        console.log(
          `[Steam User - Queue Owned Games] User ${userId} already has owned games synced. No job created.`
        );
        return false; // No job needed
      } else {
        console.error(
          `[Steam User - Queue Owned Games] User ${userId} has an invalid steamHasOwnedGames status or was not found.`
        );
        return false;
      }
    };

    const _ensureProfileSyncJob = async (steamUserEntityId) => {
      if (!steamUserEntityId) {
        console.error(
          `[Steam User - Queue Profile Sync] steamUserEntityId not provided. Cannot create sync job.`
        );
        return false;
      }

      // Check for existing pending/processing/retry jobs for this steamUser
      const existingJob = await strapi.entityService.findMany(
        "api::steam-profile-sync-job.steam-profile-sync-job",
        {
          filters: {
            steamUser: steamUserEntityId,
            status: { $in: ["pending", "processing", "retry"] },
          },
        }
      );

      if (existingJob.length === 0) {
        await strapi.entityService.create(
          "api::steam-profile-sync-job.steam-profile-sync-job",
          {
            data: {
              steamUser: steamUserEntityId,
              status: "pending",
              attempts: 0,
            },
          }
        );
        console.log(
          `[Steam User - Queue Profile Sync] Created profile sync job for Steam User ${steamUserEntityId}.`
        );
        return true; // Job created
      } else {
        console.log(
          `[Steam User - Queue Profile Sync] Profile sync job already pending/processing for Steam User ${steamUserEntityId}.`
        );
        return false; // Job already exists
      }
    };

    return {
      unlink: async (ctx) => {
        const user = ctx.state.user;
        if (!user) {
          return ctx.unauthorized();
        }

        try {
          const steamProfileEntries = await strapi.entityService.findMany(
            "api::steam-user.steam-user",
            { filters: { user: user.id } }
          );

          // Update user flags
          const profile = await strapi.entityService.update(
            "plugin::users-permissions.user",
            user.id,
            {
              data: {
                steamLinked: false,
                steamActivated: false,
              },
            }
          );

          // Remove user relationship from all associated steam profiles
          for (const steamProfile of steamProfileEntries) {
            await strapi.entityService.update(
              "api::steam-user.steam-user",
              steamProfile.id,
              {
                data: {
                  user: null,
                },
              }
            );
            strapi.service("api::profile.profile").auditLogger({
              userId: user.id,
              emailHashed: user?.emailHashed,
              accountId: steamProfile?.steamidHashed,
              platform: "steam",
              event: "accountUnlinked",
            });
          }

          return profile;
        } catch (error) {
          const steamProfileEntries = await strapi.entityService.findMany(
            "api::steam-user.steam-user",
            { filters: { user: user.id } }
          );
          const errorCode =
            error.response?.status || error.code || "UNKNOWN_ERROR";
          console.error(
            `Steam API (steam-user.js unlink) error for Steam user ${steamProfileEntries[0]?.id}. Code: ${errorCode}. Message: ${error.message}.`
          );
          return ctx.internalServerError();
        }
      },
      check: async (ctx) => {
        const user = ctx.state.user;
        if (!user) {
          return ctx.unauthorized();
        }
        if (user.steamActivated === true) {
          return ctx.badRequest("User already activated");
        }
        const steamProfileEntries = await strapi.entityService.findMany(
          "api::steam-user.steam-user",
          { filters: { user: user.id } }
        );
        if (!steamProfileEntries || steamProfileEntries.length === 0) {
          return ctx.notFound("Steam profile not found for this user.");
        }
        const steamProfile = steamProfileEntries[0];
        const rawSteamIdForApiCall = strapi
          .service("api::crypto.crypto")
          .decryptSym(steamProfile.steamid);

        // Fetch only recently played games for immediate update and profile status check
        const steamData = await strapi
          .service("api::steam-user.steam-user")
          .fetchSteamGameData(rawSteamIdForApiCall, "recentlyPlayed");

        if (steamData.error) {
          console.error(
            `Steam API fetch error during check for user ${user.id}: ${steamData.error}`
          );
        }

        await strapi.service("api::steam-user.steam-user").updateUser({
          user,
          steamProfile,
          data: {
            recentlyPlayedGames: steamData.recentlyPlayedGames,
            allOwnedGames: user.steamHasOwnedGames
              ? { response: { games: [] } }
              : undefined,
          },
        });

        // Pass the ID of the steamProfile entity (which is an 'api::steam-user.steam-user' entity)
        await _ensureOwnedGamesSyncJob(steamProfile.id);
        await _ensureProfileSyncJob(steamProfile.id);
        ctx.body = "ok";
      },
      async create(ctx, next) {
        const user = ctx.state.user;
        if (!user) return ctx.unauthorized();

        const requestSteamProfile = ctx.request.body.data;
        const steamId = requestSteamProfile.steamid;
        const hashedId = strapi
          .service("api::crypto.crypto")
          .createKeyedHash(steamId);

        const encryptedSteamId = strapi
          .service("api::crypto.crypto")
          .encryptSym(steamId);
        const steamProfileDataToStore = {
          ...requestSteamProfile,
          steamid: encryptedSteamId,
          steamidHashed: hashedId,
        };

        const existingSteamProfiles = await strapi.entityService.findMany(
          "api::steam-user.steam-user",
          {
            filters: { steamidHashed: hashedId },
            populate: { user: { fields: ["id"] } },
          }
        );

        let currentSteamProfileEntity;

        if (existingSteamProfiles.length > 0) {
          const profileWithUser = existingSteamProfiles.find(
            (p) => p.user && p.user.id === user.id
          );
          const unlinkedProfile = existingSteamProfiles.find((p) => !p.user);
          const profileWithDifferentUser = existingSteamProfiles.find(
            (p) => p.user && p.user.id !== user.id
          );

          if (profileWithDifferentUser) {
            console.log(
              `[Steam User - Create] Steam account ${hashedId} already connected to a different user.`
            );
            return ctx.badRequest("accountAlreadyConnectedToOtherUser");
          }

          currentSteamProfileEntity = profileWithUser || unlinkedProfile;

          if (currentSteamProfileEntity) {
            console.log(
              `[Steam User - Create] Updating existing Steam profile ${currentSteamProfileEntity.id} for user ${user.id}`
            );
            await strapi.entityService.update(
              "api::steam-user.steam-user",
              currentSteamProfileEntity.id,
              { data: { ...steamProfileDataToStore, user: user.id } }
            );
          } else {
            // This case should ideally not be reached if logic above is correct
            console.log(
              `[Steam User - Create] Creating new Steam profile for user ${user.id} as no exact match found.`
            );
            currentSteamProfileEntity = await strapi.entityService.create(
              "api::steam-user.steam-user",
              {
                data: { ...steamProfileDataToStore, user: user.id },
              }
            );
          }
        } else {
          console.log(
            `[Steam User - Create] Creating new Steam profile for user ${user.id}`
          );
          currentSteamProfileEntity = await strapi.entityService.create(
            "api::steam-user.steam-user",
            {
              data: { ...steamProfileDataToStore, user: user.id },
            }
          );
        }

        // Log account linking
        strapi.service("api::profile.profile").auditLogger({
          userId: user.id,
          emailHashed: user?.emailHashed,
          accountId: hashedId,
          platform: "steam",
          event: "accountLinked",
        });

        // Fetch recently played games for immediate update
        const steamData = await strapi
          .service("api::steam-user.steam-user")
          .fetchSteamGameData(steamId, "recentlyPlayed");
        if (steamData.error) {
          console.error(
            `[Steam User - Create] Steam API fetch error during create for user ${user.id}, SteamID ${steamId}: ${steamData.error}`
          );
        }

        await strapi.service("api::steam-user.steam-user").updateUser({
          user,
          steamProfile: requestSteamProfile,
          data: {
            recentlyPlayedGames: steamData.recentlyPlayedGames,
            allOwnedGames: undefined, // Owned games will be synced by cron
          },
        });

        // Pass the ID of the currentSteamProfileEntity
        await _ensureOwnedGamesSyncJob(currentSteamProfileEntity.id);
        await _ensureProfileSyncJob(currentSteamProfileEntity.id);

        return ctx.send({ ok: true, profileId: currentSteamProfileEntity.id });
      },
    };
  }
);
