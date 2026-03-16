const { setupQualtricsSurvey } = require("./survey-platforms/qualtrics");
const sendSurveyLinkDiscord = require("./discord/sendSurveyLinkDiscord");

module.exports = async () => {
  const users = await strapi.entityService.findMany(
    "plugin::users-permissions.user",
    {
      fields: [
        "id",
        "surveySendDate",
        "qualtricsContactLookupId",
        "qualtricsId",
        "discordLinked",
      ],
      filters: {
        surveyActivationDate: { $null: true },
        surveySendDate: { $lte: Date.now() },
        consentedToResearch: true,
        provider: { $notIn: ["prolific", "qualtrics"] },
      },
    }
  );
  console.log("Activating", users.length, "surveys");
  for (let index = 0; index < users.length; index++) {
    const user = users[index];
    surveyLinkExpirationDate = new Date(user.surveySendDate);
    // Link expires after x days
    surveyLinkExpirationDate.setDate(
      surveyLinkExpirationDate.getDate() +
        Number(process.env.STUDY_SURVEY_EXPIRATION_DAYS)
    );
    if(surveyLinkExpirationDate.getTime() < Date.now()) {
      // Should only happen in dev mode
      console.log("Skipping survey activation, expiration date already passed for user:", user.id)
      return
    }
    console.log("Activating survey for user:", user.id);

    const qualtricsData = await setupQualtricsSurvey({ user });
    if (qualtricsData) {
      const surveyLinkExpirationDate = qualtricsData?.linkExpiration;
      const studyEndDate = new Date(surveyLinkExpirationDate);
      studyEndDate.setDate(
        studyEndDate.getDate() + Number(process.env.STUDY_END_DAYS_AFTER_SURVEY)
      );
      const qualtricsDistributionLink = qualtricsData?.link;
      // don't send DMs to users
      // if (user?.discordLinked) {
      //   console.log(`Sending Qualtrics survey link as Discord DM to User ID: ${user.id}`)
      //   sendSurveyLinkDiscord({ user, qualtricsDistributionLink });
      // }

      strapi.entityService.update("plugin::users-permissions.user", user.id, {
        data: {
          surveyActivationDate: Date.now(),
          qualtricsDistributionLink,
          surveyLinkExpirationDate,
          studyEndDate,
        },
      });
    }
  }
};
