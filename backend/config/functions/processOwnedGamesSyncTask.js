"use strict";

const saveUserOwnedGamesToFile = require("./saveUserOwnedGamesToFile");
const JOB_LIMIT = parseInt(process.env.STEAM_OWNED_GAMES_SYNC_JOB_LIMIT, 10) || 5;
const JOB_DELAY = parseInt(process.env.STEAM_OWNED_GAMES_SYNC_JOB_DELAY_MS, 10) || 30000; // Default to 30 seconds
const MAX_RETRIES = parseInt(process.env.STEAM_OWNED_GAMES_SYNC_MAX_RETRIES, 10) || 3;
const processOwnedGamesSyncTask = async ({ strapi }) => {

  console.log(`[Cron - Steam Owned Games] Starting. Limit: ${JOB_LIMIT}. Delay: ${JOB_DELAY / 1000}s. Max Retries: ${MAX_RETRIES}`);

  const determineNextStatus = (attempts, maxRetriesVal) => {
    return attempts >= maxRetriesVal ? "failed" : "retry";
  };

  try {
    const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000);
    const pendingJobs = await strapi.entityService.findMany(
      "api::steam-owned-games-sync-job.steam-owned-games-sync-job",
      {
        filters: {
          $or: [
            { status: "pending" },
            {
              status: "retry",
              attempts: {
                $lt: MAX_RETRIES,
              },
            },
            {
              status: "processing",
              lastAttemptAt: { $lt: sixtyMinutesAgo },
            },
          ],
        },
        populate: { 
          steamUser: {
            fields: ["id", "steamid"],
            populate: { user: { fields: ["id", "steamHasOwnedGames"] } }
          }
        },
        limit: JOB_LIMIT,
        sort: { createdAt: "asc" },
      }
    );

    if (!pendingJobs || pendingJobs.length === 0) {
      console.log("[Cron - Steam Owned Games] No pending jobs.");
      return;
    }

    console.log(
      `[Cron - Steam Owned Games] Found ${pendingJobs.length} job(s).`
    );

    for (const job of pendingJobs) {
      let currentAttempts = job.attempts || 0;
      const attemptNumberForThisTry = currentAttempts + 1;
      console.log(
        `[Cron - Steam Owned Games] Processing job ID: ${job.id}, User: ${job.steamUser?.user?.id}, SteamUser: ${job.steamUser?.id}, Attempts: ${attemptNumberForThisTry}`
      );

      try {
        // Increment attempt count immediately. The number of attempts in the DB will be the current attempt number.
        await strapi.entityService.update(
          "api::steam-owned-games-sync-job.steam-owned-games-sync-job",
          job.id,
          {
            data: {
              status: "processing",
              lastAttemptAt: new Date(),
              attempts: attemptNumberForThisTry,
            },
          }
        );

        // Decrypt the steamId from the related steamUser entity for API use
        const encryptedSteamIdFromJob = job.steamUser?.steamid;
        let steamIdForApiCall;

        if (!encryptedSteamIdFromJob) {
          console.error(
            `[Cron - Steam Owned Games] Failed to find encrypted SteamID for job ${job.id} on related steamUser ${job.steamUser?.id}.`
          );
          await strapi.entityService.update(
            "api::steam-owned-games-sync-job.steam-owned-games-sync-job",
            job.id,
            {
              data: {
                status: "failed",
                errorMessage: "Missing encrypted SteamID from related steamUser.",
              },
            }
          );
          continue; 
        }

        steamIdForApiCall = strapi
            .service("api::crypto.crypto")
            .decryptSym(encryptedSteamIdFromJob);

        if (!steamIdForApiCall) {
          console.error(
            `[Cron - Steam Owned Games] Decryption of SteamID returned null for job ${job.id} (SteamUser: ${job.steamUser?.id}). This might be due to an invalid key or corrupted data.`
          );
          await strapi.entityService.update(
            "api::steam-owned-games-sync-job.steam-owned-games-sync-job",
            job.id,
            {
              data: {
                status: "failed",
                errorMessage: "Decryption of SteamID failed (returned null).",
              },
            }
          );
          continue;
        }

        const userId = job.steamUser?.user?.id;

        if (!userId) {
          console.error(
            `[Cron - Steam Owned Games] Job ID: ${job.id} missing user information on related steamUser ${job.steamUser?.id}. Skipping.`
          );
          await strapi.entityService.update(
            "api::steam-owned-games-sync-job.steam-owned-games-sync-job",
            job.id,
            {
              data: {
                status: "failed",
                errorMessage: "Missing user information on related steamUser.",
              },
            }
          );
          continue;
        }

        const steamData = await strapi
          .service("api::steam-user.steam-user")
          .fetchOwnedGamesDataForSync(steamIdForApiCall);

        if (steamData.error) {
          console.error(
            `[Cron - Steam Owned Games] API fetch error for job ${job.id}. Error: ${steamData.error}`
          );
          // job.attempts has been incremented already by the 'processing' update.
          // So we check against job.attempts (which is now current attempt number)
          const nextStatus = determineNextStatus(attemptNumberForThisTry, MAX_RETRIES);
          await strapi.entityService.update(
            "api::steam-owned-games-sync-job.steam-owned-games-sync-job",
            job.id,
            {
              data: {
                status: nextStatus,
                errorMessage: `Steam API error: ${
                  steamData.error || "Unknown API error"
                }`,
              },
            }
          );
          continue;
        }

        const saveSuccess = await saveUserOwnedGamesToFile({
          strapi,
          userId,
          ownedGamesData: steamData.allOwnedGames,
          jobId: job.id,
        });

        if (saveSuccess) {
          await strapi.entityService.update(
            "api::steam-owned-games-sync-job.steam-owned-games-sync-job",
            job.id,
            { data: { status: "completed", errorMessage: null } }
          );
          console.log(`[Cron - Steam Owned Games] Successfully processed job ID: ${job.id}.`);
        } else {
          // job.attempts already reflects the current attempt number.
          const nextStatus = determineNextStatus(attemptNumberForThisTry, MAX_RETRIES);
          await strapi.entityService.update(
            "api::steam-owned-games-sync-job.steam-owned-games-sync-job",
            job.id,
            {
              data: {
                status: nextStatus,
                errorMessage:
                  job.errorMessage || "Saving games to file failed.",
              },
            }
          );
          console.error(
            `[Cron - Steam Owned Games] Failed to save games for job ${job.id}. Marked as ${nextStatus}.`
          );
        }
      } catch (error) {
        console.error(
          `[Cron - Steam Owned Games] Critical error processing job ${job.id}:`,
          error
        );

        let finalAttemptCountForError = attemptNumberForThisTry;
        try {
            const currentJobState = await strapi.entityService.findOne(
              "api::steam-owned-games-sync-job.steam-owned-games-sync-job",
              job.id,
              { fields: ["attempts"] }
            );
            if (currentJobState && typeof currentJobState.attempts === 'number') {
                finalAttemptCountForError = currentJobState.attempts;
            }
        } catch (fetchError) {
            console.error(`[Cron - Steam Owned Games] Failed to fetch job state for job ${job.id} during error handling:`, fetchError);
            // Stick with attemptNumberForThisTry as the best guess for current attempts
        }

        const nextStatus = determineNextStatus(finalAttemptCountForError, MAX_RETRIES);

        await strapi.entityService.update(
          "api::steam-owned-games-sync-job.steam-owned-games-sync-job",
          job.id,
          {
            data: {
              status: nextStatus,
              attempts: finalAttemptCountForError,
              errorMessage: `Cron task critical error: ${error.message}`,
            },
          }
        );
      }
      // Add delay after processing each job, but not after the last one.
      if (pendingJobs.indexOf(job) < pendingJobs.length - 1) {
        await new Promise(resolve => setTimeout(resolve, JOB_DELAY));
      }
    }
  } catch (error) {
    console.error(
      "[Cron - Steam Owned Games] General error in task execution:",
      error
    );
  }
  console.log("[Cron - Steam Owned Games] Finished processing cycle.");
};

module.exports = processOwnedGamesSyncTask;
