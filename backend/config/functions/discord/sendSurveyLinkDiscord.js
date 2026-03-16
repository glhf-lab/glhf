const sendDiscordDm = require("./sendDiscordDm");

module.exports = async ({ user, qualtricsDistributionLink }) => {
  const discordProfiles = await strapi.entityService.findMany(
    "api::discord-user.discord-user",
    {
      filters: { user: { id: user.id } },
      populate: { user: { fields: ["id"] } },
    }
  );
  const discordId = strapi.service('api::crypto.crypto').decryptSym(discordProfiles[0]?.discordId)

  if (discordId !== null) {
    const publicUrl = process.env.PUBLIC_URL || "the study website";
    const message = {
      content:
        `Hey, two weeks ago you signed up to a research study on <${publicUrl}>. It's now time to answer a short survey.\n\n` +
        `Use this link to take the survey: <${qualtricsDistributionLink}>\n\n` +
        "In this survey, we ask you to answer some quick questions about your well-being. Of course, participation is voluntary, and all questions are optional!\n\n" +
        "Thanks again for making science happen! 👾",
      tts: false,
    };
    sendDiscordDm({ recipient_id: discordId, message });
  }
};
