const steamFetchRecentlyPlayedGames = require("./functions/steamFetchRecentlyPlayedGames");
const activateSurvey = require("./functions/activateSurvey");
const activateSurveyProlific = require("./functions/activateSurveyProlific");
const checkStudyCompletion = require("./functions/checkStudyCompletion");
const pruneLingeringUsers = require("./functions/pruneLingeringUsers");
const {
  createQualtricsMalinglistContact,
} = require("./functions/survey-platforms/qualtrics");
const processOwnedGamesSyncTask = require("./functions/processOwnedGamesSyncTask");
const processProfileSyncTask = require("./functions/processProfileSyncTask");

module.exports = {
  qualtricsEmailImport: {
    task: async ({ strapi }) => {
      if (process.env.SURVEY_EMAIL_IMPORT_CRON_SCHEDULE_ENABLED === 'false') return;

      const users = await strapi.entityService.findMany(
        "plugin::users-permissions.user",
        {
          fields: [
            "id",
            "email",
            "emailHashed",
            "surveySendDate",
            "qualtricsContactLookupId",
            "qualtricsId",
            "discordLinked",
          ],
          filters: {
            surveyActivationDate: { $null: true },
            qualtricsContactLookupId: { $null: true },
            consentedToResearch: true,
            provider: { $notIn: ["prolific", "qualtrics"] },
          },
        }
      );
      // Import email as Qualtrics Contact
      Promise.all(
        users.map(async (user) => {
          const email = user.email
          const emailHashed = user.emailHashed
          try {
            const qualtricsData = await createQualtricsMalinglistContact({
              email,
              userId: user.id,
            });
            const qualtricsContactLookupId =
              qualtricsData?.data?.result?.contactLookupId;
            const qualtricsId = qualtricsData?.data?.result?.id;

            await strapi.entityService.update(
              "plugin::users-permissions.user",
              user.id,
              {
                data: {
                  email: `${emailHashed}@${process.env.EMAIL_DOMAIN || "example.com"}`,
                  qualtricsContactLookupId,
                  qualtricsId,
                },
              }
            );
          } catch (error) {
            console.log(`[Cron - Qualtrics Email Import] Could not import email: ${email} into Qualtrics`);
            console.error(error);
          }
        })
      )
    },
    options: {
      rule: process.env.SURVEY_EMAIL_IMPORT_CRON_SCHEDULE
    }
  },
  removeTokens: {
    task: async ({ strapi }) => {
      console.log("[Cron - Remove Tokens] Cleaning up expired verification tokens");
      const deleted = await strapi.db.query("api::verification-token.verification-token").deleteMany({
        where: {
          expires: {
            $lt: Date.now(),
          },
        },
      });
      console.log(`[Cron - Remove Tokens] Removed ${deleted.count} expired verfication tokens`)
    },
    options: {
      rule: process.env.REMOVE_TOKENS_CRON_SCHEDULE
    }
  },
  activateSurveys: {
    task: ({ strapi }) => {
      if (process.env.SURVEY_ACTIVATE_CRON_SCHEDULE_ENABLED === 'false') return;
      const now = new Date().toISOString();
      console.log("[Cron - Checking surveys]");
      activateSurvey();
      checkStudyCompletion();
    },
    options: {
      rule: process.env.SURVEY_ACTIVATE_CRON_SCHEDULE
    }
  },
  purgeUsers: {
    task: ({ strapi }) => {
      if (process.env.PURGE_USERS_CRON_SCHEDULE_ENABLED !== 'true') return;
      pruneLingeringUsers();
    },
    options: {
      rule: process.env.PURGE_USERS_CRON_SCHEDULE
    }
  },
  prolificDigest: {
    task: ({ strapi }) => {
      if (process.env.PROLIFIC_DIGEST_CRON_SCHEDULE_ENABLED === 'false') return;
      activateSurveyProlific();
    },
    options: {
      rule: process.env.PROLIFIC_DIGEST_CRON_SCHEDULE
    }
  },
  steamFetch: {
    task: ({ strapi }) => {
      const now = new Date().toISOString();
      steamFetchRecentlyPlayedGames();
    },
    options: {
      rule: process.env.STEAM_FETCH_CRON_SCHEDULE
    }
  },
  ownedGamesSync: {
    task: processOwnedGamesSyncTask,
    options: {
      rule: process.env.STEAM_OWNED_GAMES_SYNC_CRON_SCHEDULE || "*/10 * * * *",
      tz: 'Etc/UTC',
    }
  },
  steamProfileSync: {
    task: processProfileSyncTask,
    options: {
      rule: process.env.STEAM_PROFILE_SYNC_CRON_SCHEDULE || "*/15 * * * *",
      tz: 'Etc/UTC',
    }
  }
};
