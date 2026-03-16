const { sendSlackWebhook } = require("../../../../lib/sendSlackWebhook");

module.exports = {
  async afterCreate(event) {
    const { result } = event;
    const requestUrl = `${process.env.BACKEND_URL}/admin/content-manager/collectionType/api::prolific-invite.prolific-invite/${result?.id}`;
    const slackBlockMessage = {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `Good morning! There are new participants that should be whitelisted on Prolific\n\n<${requestUrl}|View the request>`,
          },
        },
      ],
    };

    sendSlackWebhook(slackBlockMessage);
  },
};
