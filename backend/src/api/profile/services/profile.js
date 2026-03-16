"use strict";

/**
 * profile service
 */

const { createCoreService } = require("@strapi/strapi").factories;
const fs = require("fs");
const path = require("path");
const {
  STEAM_REQUIRE_OWNED_GAMES,
  STEAM_REQUIRE_PLAYTIME_PUBLIC,
  STEAM_REQUIRE_RECENT_PLAYTIME,
} = process.env;
const STEAM_REQUIRED = process.env.STEAM_REQUIRED || "";
const DISCORD_REQUIRED = process.env.DISCORD_REQUIRED || "";

const checkSteamRequirements = ({
  steamHasOwnedGames,
  steamHasRecentPlayedGames,
  steamHasPlaytimePublic,
  steamHasOwnedGamesPlaytime,
}) => {
  const ownGamesRequired = STEAM_REQUIRE_OWNED_GAMES === "true";
  const playtimePublicRequired = STEAM_REQUIRE_PLAYTIME_PUBLIC === "true";
  const recentPlaytimeRequired = STEAM_REQUIRE_RECENT_PLAYTIME === "true";

  if (!ownGamesRequired && !playtimePublicRequired && !recentPlaytimeRequired) {
    return true;
  }

  let meetsAllSpecificRequirements = true;
  if (ownGamesRequired) {
    meetsAllSpecificRequirements =
      meetsAllSpecificRequirements && steamHasOwnedGames;
  }
  if (playtimePublicRequired) {
    meetsAllSpecificRequirements =
      meetsAllSpecificRequirements && steamHasPlaytimePublic;
  }
  if (recentPlaytimeRequired) {
    meetsAllSpecificRequirements =
      meetsAllSpecificRequirements && steamHasRecentPlayedGames;
  }
  return meetsAllSpecificRequirements;
};

module.exports = createCoreService("api::profile.profile", ({ strapi }) => ({
  shouldActivateSteam({
    user,
    steamHasRecentPlayedGames,
    steamHasOwnedGames,
    steamHasOwnedGamesPlaytime,
    steamHasPlaytimePublic,
  }) {
    const steamRequireOwnedGamesEnv = STEAM_REQUIRE_OWNED_GAMES === "true";

    if (
      steamRequireOwnedGamesEnv &&
      steamHasOwnedGames === false &&
      typeof user.steamActivated === "boolean"
    ) {
      console.log(
        `[Steam User - Should Activate] Deferring activation change for user ${user.id}: owned games required but not yet confirmed synced (steamHasOwnedGames: ${steamHasOwnedGames}). Returning existing status: ${user.steamActivated}`
      );
      return user.steamActivated;
    }

    const meetsSteamCriteria = checkSteamRequirements({
      steamHasOwnedGames,
      steamHasRecentPlayedGames,
      steamHasPlaytimePublic,
      steamHasOwnedGamesPlaytime,
    });

    console.log(
      `[Steam User - Should Activate] Proceeding with full activation check for user ${user.id}. Deferral skipped. steamRequireOwnedGamesEnv: ${steamRequireOwnedGamesEnv}, steamHasOwnedGames: ${steamHasOwnedGames}, initial user.steamActivated: ${user.steamActivated}`
    );
    if(user.steamActivated !== true && meetsSteamCriteria === true) {
      console.log(`[Steam User - Should Activate] User ${user.id} is not activated but meetsSteamCriteria is true. Setting steamActivated to true.`);
    }
    console.log(
      `[Steam User - Should Activate] checkSteamRequirements result: ${meetsSteamCriteria}`
    );

    return meetsSteamCriteria;
  },
  shouldActivateDiscord({ user }) {
    let meetsRequirements = true;
    const surveyAlreadyActivated = user.surveyActivationDate !== null;
    if (surveyAlreadyActivated) return false;
    if (STEAM_REQUIRED === "true") {
      const steamHasOwnedGames = user?.steamHasOwnedGames;
      const steamHasRecentPlayedGames = user?.steamHasRecentPlayedGames;
      const steamLinked = user?.steamLinked;
      meetsRequirements =
        steamLinked &&
        checkSteamRequirements({
          steamHasOwnedGames,
          steamHasRecentPlayedGames,
        });
    }
    if (DISCORD_REQUIRED === "true") {
      meetsRequirements = meetsRequirements;
    }
    return meetsRequirements;
  },
  checkRequiredAccountsLinked({ user }) {
    let requiredAccountsLinked = true;
    if (STEAM_REQUIRED === "true") {
      requiredAccountsLinked = user?.steamLinked;
    }
    if (DISCORD_REQUIRED === "true") {
      requiredAccountsLinked = requiredAccountsLinked && user?.discordLinked;
    }
    return requiredAccountsLinked;
  },
  calculateActivationDates() {
    const now = Date.now();
    const activationDate = new Date(now);
    const surveySendDate = new Date(now);
    surveySendDate.setDate(
      surveySendDate.getDate() + Number(process.env.STUDY_DAYS_BEFORE_SURVEY)
    );
    const studyEndDate = new Date(now);
    studyEndDate.setDate(
      studyEndDate.getDate() + Number(process.env.STUDY_END_DAYS_AFTER_SURVEY)
    );

    return {
      surveySendDate,
      activationDate,
      studyEndDate,
    };
  },
  auditLogger({ userId, emailHashed, accountId, platform, event }) {
    const dataDir = path.resolve("./.tmp/data/account-linking");
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    const getYMD = strapi.service("api::steam-user.steam-user").getYMD;
    const ws = fs.createWriteStream(
      path.resolve(dataDir, `${getYMD()}-audit.json`),
      { flags: "a" }
    );
    const timestamp = Date.now();
    ws.write(
      JSON.stringify({
        userId,
        emailHashed,
        accountId,
        platform,
        event,
        timestamp,
      }) + "\n"
    );
    ws.end();
  },
}));
