"use strict";

/**
 * steam-user service.
 */
const axios = require("axios");
const { createCoreService } = require("@strapi/strapi").factories;
const axiosRetry = require("axios-retry").default;
const rateLimit = require("axios-rate-limit");
const serviceAxiosInstance = axios.create();

axiosRetry(serviceAxiosInstance, {
  retries: 5,
  retryCondition: (e) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(e) ||
      (e.response && e.response.status === 429)
    );
  },
  retryDelay: (retryCount, error) => {
    let errorReason = "Unknown error";
    let additionalInfo = "";
    if (error.response?.status === 429) {
      errorReason = "Rate limit (429)";
      additionalInfo += ` Path: ${error.config?.url || "N/A"}`;
      if (error.response.headers) {
        const retryAfter = error.response.headers["retry-after"];
        const rateLimitReset = error.response.headers["x-ratelimit-reset"];
        const rateLimitRemaining =
          error.response.headers["x-ratelimit-remaining"];
        if (retryAfter) {
          additionalInfo += ` | Retry-After: ${retryAfter}`;
        }
        if (rateLimitReset) {
          additionalInfo += ` | X-RateLimit-Reset: ${rateLimitReset}`;
        }
        if (rateLimitRemaining) {
          additionalInfo += ` | X-RateLimit-Remaining: ${rateLimitRemaining}`;
        }
      }
    } else if (error.code) {
      errorReason = `Network error (${error.code})`;
      additionalInfo += ` Path: ${error.config?.url || "N/A"}`;
    } else if (error.message) {
      errorReason = `Error: ${error.message}`;
      additionalInfo += ` Path: ${error.config?.url || "N/A"}`;
    }
    console.log(
      `[Steam User (General) - Retry] Steam API attempt: ${retryCount} - Reason: ${errorReason}${additionalInfo}`
    );
    return axiosRetry.exponentialDelay(retryCount, error, 500);
  },
});

const http = rateLimit(serviceAxiosInstance, {
  maxRequests: 10,
  perMilliseconds: 100,
});

// New Axios instance and configuration for Owned Games Sync
const ownedGamesSyncAxiosInstance = axios.create();
axiosRetry(ownedGamesSyncAxiosInstance, {
  retries: 3,
  retryCondition: (e) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(e) ||
      (e.response && e.response.status === 429)
    );
  },
  retryDelay: (retryCount, error) => {
    let errorReason = "Unknown error";
    let additionalInfo = "";
    if (error.response?.status === 429) {
      errorReason = "Rate limit (429)";
      additionalInfo += ` Path: ${error.config?.url || "N/A"}`;
      if (error.response.headers) {
        const retryAfter = error.response.headers["retry-after"];
        const rateLimitReset = error.response.headers["x-ratelimit-reset"];
        const rateLimitRemaining =
          error.response.headers["x-ratelimit-remaining"];
        if (retryAfter) {
          additionalInfo += ` | Retry-After: ${retryAfter}`;
        }
        if (rateLimitReset) {
          additionalInfo += ` | X-RateLimit-Reset: ${rateLimitReset}`;
        }
        if (rateLimitRemaining) {
          additionalInfo += ` | X-RateLimit-Remaining: ${rateLimitRemaining}`;
        }
      }
    } else if (error.code) {
      errorReason = `Network error (${error.code})`;
      additionalInfo += ` Path: ${error.config?.url || "N/A"}`;
    } else if (error.message) {
      errorReason = `Error: ${error.message}`;
      additionalInfo += ` Path: ${error.config?.url || "N/A"}`;
    }
    console.log(
      `[${new Date().toISOString()}] [Cron - Steam Owned Games] Steam API retry attempt: ${retryCount} - Reason: ${errorReason}${additionalInfo}`
    );
    return retryCount * 1000;
  },
});

module.exports = createCoreService(
  "api::steam-user.steam-user",
  ({ strapi }) => ({
    async updateUser({ user, steamProfile, data }) {
      const { allOwnedGames, recentlyPlayedGames } = data;

      let currentSteamHasOwnedGames = user.steamHasOwnedGames || false;
      let currentSteamHasOwnedGamesPlaytime =
        user.steamHasOwnedGamesPlaytime || false;

      // Only update owned games flags if allOwnedGames data is explicitly provided in this call
      if (
        allOwnedGames &&
        allOwnedGames.response &&
        Array.isArray(allOwnedGames.response.games)
      ) {
        currentSteamHasOwnedGames = true; // Data is present
        const ownedGamesWithPlaytimeFiltered =
          allOwnedGames.response.games.filter((d) => d.playtime_forever > 0);
        currentSteamHasOwnedGamesPlaytime =
          ownedGamesWithPlaytimeFiltered.length > 0;
      }

      const hasRecentGamesData =
        recentlyPlayedGames && recentlyPlayedGames.response;
      const steamHasRecentPlayedGames =
        hasRecentGamesData && Array.isArray(recentlyPlayedGames.response.games)
          ? recentlyPlayedGames.response.games.length > 0
          : false;
      const steamHasPlaytimePublic = hasRecentGamesData
        ? recentlyPlayedGames.response.total_count !== undefined
        : false;

      const shouldActivate = strapi
        .service("api::profile.profile")
        .shouldActivateSteam({
          user,
          steamHasRecentPlayedGames,
          steamHasOwnedGames: currentSteamHasOwnedGames,
          steamHasOwnedGamesPlaytime: currentSteamHasOwnedGamesPlaytime,
          steamHasPlaytimePublic,
        });

      let newUserData = {
        steamLinked: true,
        steamActivated: shouldActivate,
        steamPrivate: steamProfile.communityvisibilitystate !== 3,
        steamHasRecentPlayedGames,
        steamHasOwnedGames: currentSteamHasOwnedGames,
        steamHasOwnedGamesPlaytime: currentSteamHasOwnedGamesPlaytime,
        steamHasPlaytimePublic,
        requiredAccountsLinked: strapi
          .service("api::profile.profile")
          .checkRequiredAccountsLinked({
            user: { ...user, steamLinked: true },
          }),
      };

      if (shouldActivate && !user.activationDate) {
        // Only set activation dates if newly activating

        const { activationDate, surveySendDate, studyEndDate } = strapi
          .service("api::profile.profile")
          .calculateActivationDates();
        newUserData = {
          ...newUserData,
          activationDate,
          surveySendDate,
          studyEndDate,
        };
      }

      return strapi.entityService.update(
        "plugin::users-permissions.user",
        user.id,
        {
          data: newUserData,
        }
      );
    },
    async fetchSteamGameData(steamid, fetchType = "all") {
      try {
        let allOwnedGames = null;
        let recentlyPlayedGames = null;

        if (fetchType === "all" || fetchType === "ownedGames") {
          const { data: ownedGamesData } = await http.get(
            "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/",
            {
              headers: {
                "content-type": "application/json",
              },
              params: {
                key: process.env.STEAM_API_KEY,
                format: "json",
                steamid: steamid,
                include_played_free_games: "true",
                include_appinfo: "true",
              },
            }
          );
          allOwnedGames = ownedGamesData;
        }

        // Fetch last 2 weeks
        if (fetchType === "all" || fetchType === "recentlyPlayed") {
          const { data: recentlyPlayedData } = await http.get(
            "https://api.steampowered.com/IPlayerService/GetRecentlyPlayedGames/v0001/",
            {
              headers: {
                "content-type": "application/json",
              },
              params: {
                key: process.env.STEAM_API_KEY,
                format: "json",
                steamid: steamid,
              },
            }
          );
          recentlyPlayedGames = recentlyPlayedData;
        }

        const result = {};
        if (allOwnedGames) {
          result.allOwnedGames = allOwnedGames;
        }
        if (recentlyPlayedGames) {
          result.recentlyPlayedGames = recentlyPlayedGames;
        }
        return result;
      } catch (error) {
        console.log(error.toJSON());
        return {
          error: error.message,
          details: error.toJSON(),
          allOwnedGames: null,
          recentlyPlayedGames: null,
        };
      }
    },
    async fetchOwnedGamesDataForSync(steamid) {
      try {
        const { data: ownedGamesData } = await ownedGamesSyncAxiosInstance.get(
          "https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/",
          {
            headers: { "content-type": "application/json" },
            params: {
              key: process.env.STEAM_API_KEY,
              format: "json",
              steamid: steamid,
              include_played_free_games: "true",
              include_appinfo: "true",
            },
          }
        );
        return { allOwnedGames: ownedGamesData, error: null };
      } catch (error) {
        const errorMessage =
          error.message || "Unknown error during owned games sync fetch.";
        const errorDetails = error.toJSON
          ? error.toJSON()
          : error.response && error.response.data
          ? error.response.data
          : error.code || "No additional details";
        const errorCode =
          error.response?.status || error.code || "UNKNOWN_ERROR";

        console.error(
          `[Cron - Steam Owned Games] Steam API retry fetch failed. Code: ${errorCode}. Message: ${
            error.message
          }. Details: ${
            error.response?.data
              ? JSON.stringify(error.response.data)
              : "No response data"
          }`
        );

        return {
          error: errorMessage,
          details: errorDetails,
          allOwnedGames: null,
        };
      }
    },
    async fetchSteamProfileSummary(steamids) {
      if (!steamids || !Array.isArray(steamids) || steamids.length === 0) {
        console.error(
          "[Steam User Service - fetchSteamProfileSummary] Array of SteamIDs is required."
        );
        return { error: "Array of SteamIDs is required.", profilesMap: null };
      }
      if (steamids.length > 100) {
        // Steam API limits to 100 steamids per call for GetPlayerSummaries
        console.warn(
          "[Steam User Service - fetchSteamProfileSummary] More than 100 SteamIDs provided. Only the first 100 will be processed in this call by the API."
        );
        // The API itself will likely only process the first 100. The cron job should handle batching.
      }

      const steamidsString = steamids.join(",");

      try {
        const response = await http.get(
          "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/",
          {
            headers: {
              "content-type": "application/json",
            },
            params: {
              key: process.env.STEAM_API_KEY,
              steamids: steamidsString, // Use comma-separated string
              format: "json",
            },
          }
        );

        const profilesMap = {};
        if (
          response.data &&
          response.data.response &&
          Array.isArray(response.data.response.players)
        ) {
          response.data.response.players.forEach((player) => {
            // Ensure steamid is a string for consistent map keying, as API returns it as string.
            profilesMap[String(player.steamid)] = player;
          });
          return { error: null, profilesMap: profilesMap };
        } else {
          console.warn(
            `[Steam User Service - fetchSteamProfileSummary] No player data array found or unexpected API response format. Response:`,
            response.data
          );
          return {
            error:
              "No player data array found or unexpected API response format.",
            profilesMap: null,
          };
        }
      } catch (error) {
        const errorMessage =
          error.message || "Unknown error during owned games sync fetch.";
        const errorDetails = error.toJSON
          ? error.toJSON()
          : error.response && error.response.data
          ? error.response.data
          : error.code || "No additional details";
        const errorCode =
          error.response?.status || error.code || "UNKNOWN_ERROR";
        console.error(
          `[Steam User Service - fetchSteamProfileSummary] API error. Code: ${errorCode}. Message: ${errorMessage}. Details: ${
            error.response?.data
              ? JSON.stringify(error.response.data)
              : "No response data"
          }`
        );
        return {
          error: errorMessage,
          profilesMap: null,
          details: errorDetails,
        };
      }
    },
    getYMD() {
      const dateObj = new Date();
      const day = ("0" + dateObj.getDate()).slice(-2);
      const month = ("0" + (dateObj.getMonth() + 1)).slice(-2);
      const year = dateObj.getFullYear();
      return `${year}-${month}-${day}`;
    },
  })
);
