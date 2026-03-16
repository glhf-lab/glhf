"use strict";

// Number of jobs to fetch and process in this cron run. This will be the size of the single API batch.
// Capped at 100 due to Steam API GetPlayerSummaries limit.
const PROFILE_SYNC_BATCH_LIMIT = Math.min(
  parseInt(process.env.STEAM_PROFILE_SYNC_BATCH_LIMIT, 10) || 100,
  100
);
const MAX_RETRIES =
  parseInt(process.env.STEAM_PROFILE_SYNC_MAX_RETRIES, 10) || 5;

const processProfileSyncTask = async ({ strapi }) => {
  console.log(
    `[Cron - Steam Profile Sync] Starting. Batch Limit: ${PROFILE_SYNC_BATCH_LIMIT}. Max Retries: ${MAX_RETRIES}`
  );

  const determineNextStatus = (attempts, maxRetriesVal) => {
    return attempts >= maxRetriesVal ? "failed" : "retry";
  };

  const updateJobStatus = async (
    jobId,
    status,
    errorMessage = null,
    attempts
  ) => {
    try {
      await strapi.entityService.update(
        "api::steam-profile-sync-job.steam-profile-sync-job",
        jobId,
        {
          data: { status, errorMessage, attempts, lastAttemptAt: new Date() },
        }
      );
    } catch (e) {
      console.error(
        `[Cron - Steam Profile Sync] FATAL: Could not update job ${jobId} status to ${status}. Error:`,
        e
      );
    }
  };

  try {
    const sixtyMinutesAgo = new Date(Date.now() - 60 * 60 * 1000);
    const pendingJobs = await strapi.entityService.findMany(
      "api::steam-profile-sync-job.steam-profile-sync-job",
      {
        filters: {
          $or: [
            { status: "pending" },
            { status: "retry", attempts: { $lt: MAX_RETRIES } },
            { status: "processing", lastAttemptAt: { $lt: sixtyMinutesAgo } },
          ],
        },
        populate: { steamUser: { fields: ["id", "steamid"] } },
        limit: PROFILE_SYNC_BATCH_LIMIT, // Fetch up to the batch limit
        sort: { createdAt: "asc" },
      }
    );

    if (!pendingJobs || pendingJobs.length === 0) {
      console.log("[Cron - Steam Profile Sync] No pending jobs.");
      return;
    }

    console.log(
      `[Cron - Steam Profile Sync] Found ${pendingJobs.length} job(s) to process.`
    );

    const steamIdsToFetch = [];
    const steamIdToJobsMap = new Map(); // steamId (decrypted) -> array of job objects

    for (const job of pendingJobs) {
      const currentAttempts = job.attempts || 0;
      const attemptNumberForThisTry = currentAttempts + 1;

      await updateJobStatus(
        job.id,
        "processing",
        null,
        attemptNumberForThisTry
      );

      const encryptedSteamId = job.steamUser?.steamid;
      if (!encryptedSteamId) {
        console.error(
          `[Cron - Steam Profile Sync] Job ID ${job.id}: Missing encrypted SteamID. Marking as failed.`
        );
        await updateJobStatus(
          job.id,
          "failed",
          "Missing encrypted SteamID from related steamUser.",
          attemptNumberForThisTry
        );
        continue;
      }

      const steamId = strapi
        .service("api::crypto.crypto")
        .decryptSym(encryptedSteamId);
      if (!steamId) {
        console.error(
          `[Cron - Steam Profile Sync] Job ID ${job.id}: Decryption of SteamID returned null. Marking as failed.`
        );
        await updateJobStatus(
          job.id,
          "failed",
          "Decryption of SteamID failed (returned null).",
          attemptNumberForThisTry
        );
        continue;
      }

      job.decryptedSteamId = steamId;
      job.currentAttemptNumberForThisTry = attemptNumberForThisTry;

      if (!steamIdToJobsMap.has(steamId)) {
        steamIdToJobsMap.set(steamId, []);
        steamIdsToFetch.push(steamId); // Collect unique SteamIDs for the single API call
      }
      steamIdToJobsMap.get(steamId).push(job);
    }

    if (steamIdsToFetch.length === 0) {
      console.log(
        "[Cron - Steam Profile Sync] No valid SteamIDs to fetch after initial processing of fetched jobs."
      );
      return;
    }

    console.log(
      `[Cron - Steam Profile Sync] Preparing to fetch profiles for ${steamIdsToFetch.length} unique SteamIDs in a single batch.`
    );

    const { profilesMap, error: batchFetchError } = await strapi
      .service("api::steam-user.steam-user")
      .fetchSteamProfileSummary(steamIdsToFetch); // API call with all collected SteamIDs

    if (batchFetchError) {
      console.error(
        `[Cron - Steam Profile Sync] API fetch error for batch of ${steamIdsToFetch.length} SteamIDs. Error: ${batchFetchError}`
      );
      for (const steamIdInBatch of steamIdsToFetch) {
        const affectedJobs = steamIdToJobsMap.get(steamIdInBatch) || [];
        for (const job of affectedJobs) {
          const nextStatus = determineNextStatus(
            job.currentAttemptNumberForThisTry,
            MAX_RETRIES
          );
          await updateJobStatus(
            job.id,
            nextStatus,
            `Steam API batch error: ${batchFetchError}`,
            job.currentAttemptNumberForThisTry
          );
        }
      }
    } else {
      // Successfully fetched some data, process profilesMap
      for (const steamIdStr in profilesMap) {
        const fetchedProfileData = profilesMap[steamIdStr];
        const jobsForThisSteamId = steamIdToJobsMap.get(steamIdStr) || [];

        if (
          !fetchedProfileData ||
          typeof fetchedProfileData.timecreated === "undefined"
        ) {
          console.warn(
            `[Cron - Steam Profile Sync] No profile data or timecreated missing for Steam profile entity ID: ${jobsForThisSteamId[0]?.steamUser?.id} in API response.`
          );
          for (const job of jobsForThisSteamId) {
            const nextStatus = determineNextStatus(
              job.currentAttemptNumberForThisTry,
              MAX_RETRIES
            );
            await updateJobStatus(
              job.id,
              nextStatus,
              "No profile data or timecreated field missing from Steam API response.",
              job.currentAttemptNumberForThisTry
            );
          }
          continue;
        }

        for (const job of jobsForThisSteamId) {
          try {
            await strapi.entityService.update(
              "api::steam-user.steam-user",
              job.steamUser.id,
              {
                data: {
                  timecreated: fetchedProfileData.timecreated,
                  lastProfileSyncAt: new Date(),
                },
              }
            );
            await updateJobStatus(
              job.id,
              "completed",
              null,
              job.currentAttemptNumberForThisTry
            );
            console.log(
              `[Cron - Steam Profile Sync] Successfully processed job ID: ${job.id} for Steam profile entity ID: ${job.steamUser.id}.`
            );
          } catch (updateError) {
            console.error(
              `[Cron - Steam Profile Sync] Error updating SteamUser entity for job ${job.id} (Steam profile entity ID: ${job.steamUser.id}):`,
              updateError
            );
            const nextStatus = determineNextStatus(
              job.currentAttemptNumberForThisTry,
              MAX_RETRIES
            );
            await updateJobStatus(
              job.id,
              nextStatus,
              `Failed to update SteamUser entity: ${updateError.message}`,
              job.currentAttemptNumberForThisTry
            );
          }
        }
      }

      // Handle SteamIDs that were in the batch but not in profilesMap
      for (const steamIdInBatch of steamIdsToFetch) {
        if (!profilesMap.hasOwnProperty(String(steamIdInBatch))) {
          console.warn(
            `[Cron - Steam Profile Sync] Steam profile entity ID: ${
              steamIdToJobsMap.get(steamIdInBatch)[0]?.steamUser?.id
            } was in the request but not found in the API response's profilesMap.`
          );
          const affectedJobs = steamIdToJobsMap.get(steamIdInBatch) || [];
          for (const job of affectedJobs) {
            if (job.status === "processing") {
              const nextStatus = determineNextStatus(
                job.currentAttemptNumberForThisTry,
                MAX_RETRIES
              );
              await updateJobStatus(
                job.id,
                nextStatus,
                "SteamID not found in API response batch.",
                job.currentAttemptNumberForThisTry
              );
            }
          }
        }
      }
    }
  } catch (error) {
    console.error(
      "[Cron - Steam Profile Sync] General error in task execution:",
      error
    );
  }
  console.log("[Cron - Steam Profile Sync] Finished processing cycle.");
};

module.exports = processProfileSyncTask;
