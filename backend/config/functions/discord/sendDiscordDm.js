const axios = require("axios");
const axiosRetry = require("axios-retry").default;

// API Client
const discord = axios.create({
  baseURL: `https://discord.com/api/`,
});

axiosRetry(discord, {
  retries: 3,
  retryCondition: (e) => {
    console.log("retryCondition", e);
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(e) ||
      e?.response?.status === 429
    );
  },
  retryDelay: (retryCount) => {
    console.log(`Discord API retry attempt: ${retryCount}`);
    return retryCount * 60 * 1000;
  },
});

const getDmChannel = async ({ recipient_id }) => {
  try {
    const res = await discord.post(
      "/users/@me/channels",
      { recipient_id },
      {
        headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
      }
    );
    return res;
  } catch (error) {
    console.log(error);
    return error;
  }
};

module.exports = async ({ recipient_id, message }) => {
  const dmChannel = await getDmChannel({ recipient_id });
  const channelId = dmChannel?.data?.id;
  if (channelId !== null) {
    try {
      const res = await discord.post(
        `/channels/${channelId}/messages`,
        message,
        {
          headers: { Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}` },
        }
      );
    } catch (error) {
      console.log(error);
      return error;
    }
  }
};
