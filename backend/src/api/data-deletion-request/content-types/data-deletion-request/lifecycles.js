const { sendSlackWebhook } = require("../../../../lib/sendSlackWebhook");
const BACKEND_URL = process.env.BACKEND_URL || "http://localhost:1337"
module.exports = {
  async afterCreate(event) {
    const { result } = event;
    const requestUrl = `${BACKEND_URL}/admin/content-manager/collectionType/api::data-deletion-request.data-deletion-request/${result?.id}`;
    const slackBlockMessage = {
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `New data deletion request :skull:, <${requestUrl}|view the request.>`,
          },
        },
      ],
    };

    sendSlackWebhook(slackBlockMessage);
  },
};
