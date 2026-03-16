const axios = require("axios");
const webhookURL = process.env.SLACK_WEBHOOK_URL;

const sendSlackWebhook = async (data) => {
  if (!webhookURL) return;

  try {
    const response = await axios.post(webhookURL, data, {
      headers: {
        "content-type": "application/json",
      },
    });
    return `${response.status} - ${response.statusText}`;
  } catch (err) {
    console.log(err);
    return err;
  }
};

module.exports = {
  sendSlackWebhook,
};
