const axios = require("axios");
const path = require("path");
const fs = require("fs");

const THIRTY_DAYS_IN_MILLISECONDS = (30 * 24 * 60 * 60 * 1000);

module.exports = async () => {
  const users = await strapi.entityService.findMany(
    "plugin::users-permissions.user",
    {
      //fields: ["id", "studyEndDate", "studyCompleted", "provider", "emailHashed"],
      filters: {
        createdAt: { $lte: Date.now() - THIRTY_DAYS_IN_MILLISECONDS },
        activationDate: { $null: true },
        $or: [
          { steamHasPlaytimePublic: { $null: true } },
          { steamHasPlaytimePublic: false },
        ],
      },
    }
  );
  console.log(`Found ${users.length} lingering users that should be pruned`);
  if (users.length > 0) {
    const pruneTimestamp = Date.now();
    const dryRun = process.env.PURGE_USERS_CRON_DRY_RUN === 'true';

    let directory = path.resolve("./.tmp/data/pruned-users");
    if (dryRun) {
      console.log("DRY RUN ENABLED: Operations will be logged, and data will be written to a dry-run directory. No actual data will be deleted from the database or external services.");
      directory = path.resolve("./.tmp/data/pruned-users-dry-run");
    }

    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    await Promise.all(
      users.map(async (user) => {
        console.log("Pruning user:", user.id);

        // Remove Steam Id
        const steamProfiles = await strapi.entityService.findMany(
          "api::steam-user.steam-user",
          { filters: { user: user.id } }
        );

        let steamProfileDataForFile;

        if (steamProfiles.length > 0) {
          try {
            const steamProfile = steamProfiles[0];
            if (dryRun) {
              console.log(`[DRY RUN] Would delete Steam user entity ${steamProfile.id} for User ID: ${user.id}`);
              const dryRunSteamProfile = { ...steamProfile };
              delete dryRunSteamProfile.steamid;
              steamProfileDataForFile = {
                ...dryRunSteamProfile,
                userId: user.id,
                pruneTimestamp
              };
            } else {
              await strapi.entityService.delete(
                "api::steam-user.steam-user",
                steamProfile.id
              );
              delete steamProfile.steamid; // Delete from the object that will be saved
              steamProfileDataForFile = {
                ...steamProfile,
                userId: user.id,
                pruneTimestamp
              };
              console.log(
                `Deleted Steam user for User ID: ${user.id} (User pruned)`
              );
            }

            fs.writeFile(
              path.resolve(directory, `steam-user-${user.id}.json`),
              JSON.stringify(steamProfileDataForFile),
              function (err) {
                if (err) console.error(err);
              }
            );
            console.log(
              `Deleted Steam user for User ID: ${user.id} (User pruned)`
            );
          } catch (error) {
            console.error(error);
          }
        }
        // Kick from discord server
        // Fetch the discord profile
        const discordProfiles = await strapi.entityService.findMany(
          "api::discord-user.discord-user",
          {
            filters: { user: { id: user.id } },
            populate: { user: { fields: ["id"] } },
          }
        );
        // Kick user from Discord server
        if (
          discordProfiles.length > 0 &&
          discordProfiles[0]?.discordId !== null
        ) {
          const discordIdEncrypted = discordProfiles[0]?.discordId;
          const discordId = strapi
            .service("api::crypto.crypto")
            .decryptSym(discordIdEncrypted);
          const discordUrl = `https://discord.com/api/guilds/${process.env.DISCORD_GUILD}/members/${discordId}`;
          try {
            if (dryRun) {
              console.log(`[DRY RUN] Would kick user ID ${user.id} (Discord ID: ${discordId}) from Discord server.`);
            } else {
              const guildKickRes = await axios.delete(discordUrl, {
                headers: {
                  Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                },
              });
              if (guildKickRes?.status === 204)
                console.log(
                  `Kicked user ID ${user.id} from Discord server (study completed)`
                );
            }
          } catch (error) {
            console.error(error);
          }
          try {
            if (dryRun) {
              console.log(`[DRY RUN] Would delete Discord user entity ${discordProfiles[0]?.id} for User ID: ${user.id}`);
            } else {
              await strapi.entityService.delete(
                "api::discord-user.discord-user",
                discordProfiles[0]?.id
              );
              console.log(
                `Deleted Discord user for User ID: ${user.id} (User pruned)`
              );
            }
          } catch (error) {
            console.error(error);
          }
        }
        // Store user ID and hashed Discord ID
        // we need to this to join the stored Discord activity data
        const data = {
          ...user,
          discordIdHashed: discordProfiles[0]?.discordIdHashed ?? null,
          pruneTimestamp,
        };

        if (dryRun) {
          console.log(`[DRY RUN] Would delete user entity ${user.id}.`);
        } else {
          // delete user
          try {
            await strapi.entityService.delete(
              "plugin::users-permissions.user",
              user.id
            );
          } catch (error) {
            console.error(error);
          }
        }

        fs.writeFile(
          path.resolve(directory, `user-${user.id}.json`),
          JSON.stringify(data),
          function (err) {
            if (err) console.error(err);
          }
        );
      })
    );
  }
};
