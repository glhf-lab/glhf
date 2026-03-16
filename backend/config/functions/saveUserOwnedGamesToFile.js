"use strict";

const path = require("path");
const fs = require("fs");

const saveUserOwnedGamesToFile = async ({
  strapi,
  userId,
  ownedGamesData,
  jobId,
}) => {
  const getYMD =
    strapi.service("api::steam-user.steam-user")?.getYMD ||
    (() => new Date().toISOString().slice(0, 10));
  let calculatedSteamHasOwnedGamesPlaytime = false;

  try {
    // steamHasOwnedGames will be set to true because the sync process for owned games ran.
    // The presence of games or playtime determines steamHasOwnedGamesPlaytime.
    const userUpdateData = {
      steamHasOwnedGames: true,
      steamHasOwnedGamesPlaytime: false,
    };

    if (
      ownedGamesData &&
      ownedGamesData.response &&
      Array.isArray(ownedGamesData.response.games) &&
      ownedGamesData.response.games.length > 0
    ) {
      console.log(
        `[Cron - Steam Owned Games] Received ${ownedGamesData.response.games.length} owned games for user ${userId}.`
      );

      const ownedGamesWithPlaytimeFiltered =
        ownedGamesData.response.games.filter((d) => d.playtime_forever > 0);
      if (ownedGamesWithPlaytimeFiltered.length > 0) {
        calculatedSteamHasOwnedGamesPlaytime = true;
      }
      userUpdateData.steamHasOwnedGamesPlaytime =
        calculatedSteamHasOwnedGamesPlaytime;

      // Proceed to save games to file only if there are games.
      const dataDir = path.resolve("./.tmp/data/owned-games/");
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      const ws = fs.createWriteStream(
        path.resolve(dataDir, `${getYMD()}-user-${userId}.json`),
        { flags: "w" }
      );
      const timestamp = Date.now();

      console.log(
        `[Cron - Steam Owned Games] Saving ${ownedGamesData.response.games.length} games for user ${userId} to file.`
      );
      ownedGamesData.response.games.forEach((game) => {
        ws.write(JSON.stringify({ userId: userId, ...game, timestamp }) + "\n");
      });

      await new Promise((resolve, reject) => {
        ws.on("finish", resolve);
        ws.on("error", reject);
        ws.end();
      });
    } else {
      console.log(
        `[Cron - Steam Owned Games] No owned games data (or empty games list) for user ${userId}. Playtime flag set to false.`
      );
      // userUpdateData.steamHasOwnedGames is already true, steamHasOwnedGamesPlaytime is false by default.
    }

    // Update the main user profile with determined flags
    await strapi.entityService.update(
      "plugin::users-permissions.user",
      userId,
      { data: userUpdateData }
    );
    console.log(
      `[Cron - Steam Owned Games] User ${userId} flags updated: steamHasOwnedGames: ${userUpdateData.steamHasOwnedGames}, steamHasOwnedGamesPlaytime: ${userUpdateData.steamHasOwnedGamesPlaytime}`
    );
    return true; // Success
  } catch (error) {
    console.error(
      `[Cron - Steam Owned Games] Error for user ${userId}, JobID ${jobId}:`,
      error
    );
    if (jobId) {
      await strapi.entityService.update(
        "api::steam-owned-games-sync-job.steam-owned-games-sync-job",
        jobId,
        {
          data: {
            errorMessage: `File save error or user update error: ${error.message}`,
          },
        }
      );
    }
    return false; // Failure
  }
};

module.exports = saveUserOwnedGamesToFile;
