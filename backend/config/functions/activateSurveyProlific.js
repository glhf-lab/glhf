const { setupQualtricsSurvey } = require("./survey-platforms/qualtrics");

module.exports = async () => {
  const users = await strapi.entityService.findMany(
    "plugin::users-permissions.user",
    {
      fields: ["id", "surveySendDate", "emailHashed"],
      filters: {
        surveyActivationDate: { $null: true },
        surveySendDate: { $lte: Date.now() },
        consentedToResearch: true,
        provider: { $eq: "prolific" },
      },
    }
  );
  console.log("Number of prolific user that should receive surveys:", users.length);

  if (users.length > 0) {
    const prolificIds = users.map((d) => d.emailHashed.split("@")[0]);
    try {
      await strapi.entityService.create(
        "api::prolific-invite.prolific-invite",
        {
          data: {
            prolificIds: prolificIds.join(","),
            addedToProlific: false,
          },
        }
      );
    } catch (error) {
      console.log(error);
    }

    await Promise.all(
      users.map(async (user) => {
        const surveyLinkExpirationDate = new Date(user.surveySendDate);
        // Survey expires x days after it's distributed
        surveyLinkExpirationDate.setDate(
          surveyLinkExpirationDate.getDate() +
            Number(process.env.STUDY_SURVEY_EXPIRATION_DAYS)
        );
        // Study ends x days after the survey expires
        const studyEndDate = new Date(surveyLinkExpirationDate);
        studyEndDate.setDate(
          studyEndDate.getDate() +
            Number(process.env.STUDY_END_DAYS_AFTER_SURVEY)
        );
        strapi.entityService.update("plugin::users-permissions.user", user.id, {
          data: {
            surveyActivationDate: Date.now(),
            surveyLinkExpirationDate: surveyLinkExpirationDate,
            studyEndDate,
          },
        });
      })
    );
  }
};
