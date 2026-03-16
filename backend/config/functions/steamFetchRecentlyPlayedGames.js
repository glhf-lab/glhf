const axios = require("axios");
const hash = require("crypto").createHash;
const axiosRetry = require("axios-retry").default;
const rateLimit = require("axios-rate-limit");
const path = require("path");
const fs = require("fs");

const jobAxiosInstance = axios.create();

axiosRetry(jobAxiosInstance, {
  retries: 3,
  retryCondition: (e) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(e) ||
      e.response.status === 429
    );
  },
  retryDelay: (retryCount, error) => {
    let errorReason = "Unknown error";
    if (error.response?.status === 429) {
      errorReason = "Rate limit (429)";
    } else if (error.code) {
      errorReason = `Network error (${error.code})`;
    } else if (error.message) {
      errorReason = `Error: ${error.message}`;
    }
    console.log(
      `[Cron - Steam Recently Played Games] Steam API retry attempt: ${retryCount} - Reason: ${errorReason}`
    );
    return retryCount * 30 * 1000;
  },
});
const FIVE_MINUTES_IN_MS = 60 * 5 * 1000;
const http = rateLimit(jobAxiosInstance, {
  maxRequests: 400,
  perMilliseconds: FIVE_MINUTES_IN_MS,
});

const saveSteamGames = ({ data, userId, steamUserId }) => {
  const dataDir = path.resolve(
    "./.tmp/data/recently-played-games",
    `user-${userId}`
  );
  const getYMD = strapi.service("api::steam-user.steam-user").getYMD;
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  const ws = fs.createWriteStream(
    path.resolve(dataDir, `${getYMD()}-games.json`),
    { flags: "a" }
  );
  const timestamp = Date.now();
  data.map((game) => {
    ws.write(JSON.stringify({ userId, steamUserId, ...game, timestamp }) + "\n");
  });
  ws.end();
};
const checkSteamPrivacy = async ({ steamId, steamProfile }) => {
  const data = await strapi
    .service("api::steam-user.steam-user")
    .fetchSteamGameData(steamId, "recentlyPlayed");

  const userBeforeUpdate = await strapi.entityService.findOne(
    "plugin::users-permissions.user",
    steamProfile.user.id,
    {
      fields: [
        "id",
        "emailHashed",
        "steamActivated",
        "steamHasPlaytimePublic",
        "steamHasOwnedGames",
        "steamHasOwnedGamesPlaytime",
        "consentedToResearch",
        "steamLinked",
        "surveyActivationDate", 
        "requiredAccountsLinked", 
      ],
    }
  );

  if (!userBeforeUpdate) {
    console.error(
      `[steamFetchRecentlyPlayedGames - checkSteamPrivacy] User ${steamProfile.user.id} not found.`
    );
    return;
  }

  const updatedUser = await strapi
    .service("api::steam-user.steam-user")
    .updateUser({ user: userBeforeUpdate, steamProfile, data });

  if (
    updatedUser.steamHasPlaytimePublic === true &&
    userBeforeUpdate.steamHasPlaytimePublic === false &&
    userBeforeUpdate.steamHasOwnedGamesPlaytime === false
  ) {
    console.log(
      `[Cron - Steam Recently Played Games] Playtime for user ${userBeforeUpdate.id} became public, and owned games playtime was not previously synced. Enqueuing owned games re-sync.`
    );

    const existingJob = await strapi.entityService.findMany(
      "api::steam-owned-games-sync-job.steam-owned-games-sync-job",
      {
        filters: {
          user: userBeforeUpdate.id,
          status: { $in: ["pending", "processing", "retry"] },
        },
      }
    );

    if (existingJob.length === 0) {
      await strapi.entityService.create(
        "api::steam-owned-games-sync-job.steam-owned-games-sync-job",
        {
          data: {
            user: userBeforeUpdate.id,
            steamid: steamProfile.steamid,
            status: "pending",
            attempts: 0,
          },
        }
      );
    } else {
      console.log(
        `[Cron - Steam Recently Played Games] Owned games sync job already pending/processing for user ${userBeforeUpdate.id}. Skipped re-enqueuing.`
      );
    }
  }

  if (
    updatedUser.steamHasPlaytimePublic !==
    userBeforeUpdate.steamHasPlaytimePublic
  ) {
    strapi.service("api::profile.profile").auditLogger({
      userId: userBeforeUpdate.id,
      emailHashed: userBeforeUpdate.emailHashed,
      accountId: steamProfile.steamidHashed,
      platform: "steam",
      event:
        updatedUser.steamHasPlaytimePublic === false
          ? "steamDataPrivate"
          : "steamDataPublic",
    });
  }
};
module.exports = async () => {
  const steamProfiles = await strapi.entityService.findMany(
    "api::steam-user.steam-user",
    {
      filters: {
        steamid: { $null: false },
        user: { consentedToResearch: true, steamLinked: true },
      },
      populate: {
        user: { fields: ["consentedToResearch", "steamLinked"] },
      },
    }
  );
  console.log(
    `[Cron - Steam Recently Played Games] Starting job: ${steamProfiles.length} profiles found`
  );
  const startTime = Date.now();
  let usersPlayingGames = 0;
  let totalGamesPlayed = 0;
  let totalPrivacyChecks = 0;
  for (let index = 0; index < steamProfiles.length; index++) {
    const steamProfile = steamProfiles[index];
    const oldEntityTag = steamProfile.entityTag;
    const steamId = strapi
      .service("api::crypto.crypto")
      .decryptSym(steamProfile.steamid);

    if (!steamId) {
      console.error(
        `[Cron - Steam Recently Played Games] Failed to decrypt steamid for steamProfile ${steamProfile.id}. Skipping this profile.`
      );
      continue;
    }

    let fetchOutcome;
    try {
      const steamResponse = await http.get(
        "https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/",
        {
          headers: {
            "content-type": "application/json",
          },
          params: {
            key: process.env.STEAM_API_KEY,
            format: "json",
            steamid: steamId,
          },
        }
      );
      fetchOutcome = steamResponse.data;
    } catch (error) {
      const errorCode = error.response?.status || error.code || "UNKNOWN_ERROR";
      console.error(
        `[Cron - Steam Recently Played Games] Steam API retry fetch failed for Steam user ${
          steamProfile.id
        }. Code: ${errorCode}. Message: ${error.message}. Details: ${
          error.response?.data
            ? JSON.stringify(error.response.data)
            : "No response data"
        }`
      );
      fetchOutcome = {
        _fetchError: true,
        errorCode: errorCode,
        errorMessage: error.message,
        response: {
          _errorMarker: true,
          errorCode: errorCode,
          errorMessage: error.message,
        },
      };
    }

    const newEntityTag = hash("md5")
      .update(JSON.stringify(fetchOutcome))
      .digest("hex");

    if (oldEntityTag !== newEntityTag) {
      const firstFetch =
        oldEntityTag === null ||
        oldEntityTag === "" ||
        steamProfile.steamApiCache === null ||
        typeof steamProfile.steamApiCache?.games === "undefined";

      // Only perform privacy check if the current fetch was successful
      if (
        !fetchOutcome._fetchError &&
        ((typeof steamProfile.steamApiCache?.total_count !== "undefined" &&
          typeof fetchOutcome.response?.total_count === "undefined") ||
          (typeof steamProfile.steamApiCache?.total_count === "undefined" &&
            typeof fetchOutcome.response?.total_count !== "undefined"))
      ) {
        console.log(
          `[Cron - Steam Recently Played Games] Checking privacy settings for Steam user ${steamProfile.id}`
        );
        totalPrivacyChecks++;
        checkSteamPrivacy({ steamId, steamProfile });
      }

      const gamesFromLastApiCall =
        firstFetch || !steamProfile.steamApiCache?.games
          ? []
          : steamProfile.steamApiCache.games;

      let newGames = [];

      if (fetchOutcome._fetchError) {
        newGames = [
          {
            name: "FETCH_ERROR",
            appid: null,
            errorCode: fetchOutcome.errorCode,
            errorMessage: fetchOutcome.errorMessage,
            playtime_2weeks: null,
            playtime_forever: null,
            playtime_mac_forever: null,
            playtime_linux_forever: null,
            playtime_windows_forever: null,
          },
        ];
      } else if (typeof fetchOutcome.response?.games !== "undefined") {
        if (gamesFromLastApiCall.length === 0) {
          newGames = fetchOutcome.response.games;
        } else {
          newGames = fetchOutcome.response.games.filter((game) => {
            const matchFromLastApiCall = gamesFromLastApiCall.filter(
              (d) => d.appid == game.appid
            );
            if (matchFromLastApiCall.length === 0) return true;
            return (
              game.playtime_forever >
                matchFromLastApiCall[0].playtime_forever ||
              game.playtime_2weeks > matchFromLastApiCall[0].playtime_2weeks ||
              game.playtime_windows_forever >
                matchFromLastApiCall[0].playtime_windows_forever ||
              game.playtime_mac_forever >
                matchFromLastApiCall[0].playtime_mac_forever ||
              game.playtime_linux_forever >
                matchFromLastApiCall[0].playtime_linux_forever
            );
          });
        }
      } else {
        newGames = [
          {
            name: "NO_DATA",
            appid: null,
            playtime_2weeks: null,
            playtime_forever: null,
            playtime_mac_forever: null,
            playtime_linux_forever: null,
            playtime_windows_forever: null,
          },
        ];
      }

      if (newGames.length > 0) {
        usersPlayingGames++;
        totalGamesPlayed += newGames.length;
        saveSteamGames({ data: newGames, userId: steamProfile.user.id, steamUserId: steamProfile.id });
      }

      const dataToUpdate = {
        entityTag: newEntityTag,
        steamApiCache: undefined,
      };

      let newSteamApiCache;
      if (fetchOutcome._fetchError) {
        const currentSteamApiCache = steamProfile.steamApiCache || {};
        newSteamApiCache = {
          ...currentSteamApiCache,
          _lastFetchAttemptStatus: "error",
          _lastFetchErrorCode: fetchOutcome.errorCode,
          _lastFetchErrorMessage: fetchOutcome.errorMessage,
          _lastFetchTimestamp: Date.now(),
        };
      } else {
        newSteamApiCache = {
          ...(fetchOutcome.response || {}),
          _lastFetchAttemptStatus: "success",
          _lastFetchTimestamp: Date.now(),
          _lastFetchErrorCode: undefined,
          _lastFetchErrorMessage: undefined,
        };
      }
      dataToUpdate.steamApiCache = newSteamApiCache;

      await strapi.entityService.update(
        "api::steam-user.steam-user",
        steamProfile.id,
        {
          data: dataToUpdate,
        }
      );
    }
  }
  const endTime = Date.now();
  const durationInSeconds = (endTime - startTime) / 1000;
  console.log(
    `[Cron - Steam Recently Played Games] Job finished in ${durationInSeconds.toFixed(
      2
    )} seconds`
  );
  console.log(
    `[Cron - Steam Recently Played Games]   Total users playing Steam games this run: ${usersPlayingGames}`
  );
  console.log(
    `[Cron - Steam Recently Played Games]   Total Steam games played this run: ${totalGamesPlayed}`
  );
  console.log(
    `[Cron - Steam Recently Played Games]   Total privacy checks performed: ${totalPrivacyChecks}`
  );
};
