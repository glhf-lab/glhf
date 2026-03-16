"use strict";

/**
 *  discord-user controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const axios = require("axios");
const axiosRetry = require("axios-retry").default;

const serviceAxiosInstance = axios.create();

axiosRetry(serviceAxiosInstance, {
  retries: 5,
  retryCondition: (e) => {
    return (
      axiosRetry.isNetworkOrIdempotentRequestError(e) ||
      (e.response && e.response.status === 429)
    );
  },
  retryDelay: (retryCount, error) => {
    let errorReason = "Unknown error";
    let additionalInfo = "";
    if (error.response?.status === 429) {
      errorReason = "Rate limit (429)";
      additionalInfo += ` Path: ${error.config?.url || "N/A"}`;
      if (error.response.headers) {
        const retryAfter = error.response.headers["retry-after"];
        const rateLimitReset = error.response.headers["x-ratelimit-reset"];
        const rateLimitRemaining =
          error.response.headers["x-ratelimit-remaining"];
        if (retryAfter) {
          additionalInfo += ` | Retry-After: ${retryAfter}`;
        }
        if (rateLimitReset) {
          additionalInfo += ` | X-RateLimit-Reset: ${rateLimitReset}`;
        }
        if (rateLimitRemaining) {
          additionalInfo += ` | X-RateLimit-Remaining: ${rateLimitRemaining}`;
        }
      }
    } else if (error.code) {
      errorReason = `Network error (${error.code})`;
      additionalInfo += ` Path: ${error.config?.url || "N/A"}`;
    } else if (error.message) {
      errorReason = `Error: ${error.message}`;
      additionalInfo += ` Path: ${error.config?.url || "N/A"}`;
    }
    console.log(
      `[Discord User (General) - Retry] Discord API attempt: ${retryCount} - Reason: ${errorReason}${additionalInfo}`
    );
    return axiosRetry.exponentialDelay(retryCount, error, 100);
  },
});

const addToDiscordServer = async ({ discordId, accessToken, userId, ctx }) => {
  // Add to Discord server
  const discordUrl = `https://discord.com/api/guilds/${process.env.DISCORD_GUILD}/members/${discordId}`;
  try {
    //Test condition - uncomment to simulate server limit error
    // if (userId === 153) {
    //   throw { response: { data: { code: 30001, message: "You are at the 100 server limit." }, status: 400 }};
    // }

    const guildJoinRes = await serviceAxiosInstance.put(
      discordUrl,
      { access_token: accessToken },
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      }
    );
    if (guildJoinRes?.statusText === "Created")
      console.log(`[Discord User - Add to Server] Added user ID ${userId} to Discord server`);
  } catch (error) {
    const errorDetails = {
      message: error?.response?.data?.message || error?.message || 'Unknown error',
      userId
    };

    if (error?.response) {
      const { message, ...responseData } = error.response.data;
      errorDetails.response = responseData;
      errorDetails.status = error.response.status;
      errorDetails.statusText = error.response.statusText;
    }

    console.error('[Discord - Add to Server] Discord API Error:', errorDetails);
    
    throw error;
  }
};

module.exports = createCoreController(
  "api::discord-user.discord-user",
  ({ strapi }) => ({
    unlink: async (ctx) => {
      const user = ctx.state.user;
      // User has to be logged in to update themselves
      if (!user) {
        return ctx.unauthorized();
      }
      // Fetch the discord profile
      const discordProfiles = await strapi.entityService.findMany(
        "api::discord-user.discord-user",
        {
          filters: { user: { id: user.id } },
          populate: { user: { fields: ["id"] } },
        }
      );
      // Kick user from Discord server
      const discordId = strapi.service('api::crypto.crypto').decryptSym(discordProfiles[0]?.discordId);
      const discordUrl = `https://discord.com/api/guilds/${process.env.DISCORD_GUILD}/members/${discordId}`;
      try {
        const guildKickRes = await serviceAxiosInstance.delete(discordUrl, {
          headers: {
            Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
          },
        });
        if (guildKickRes?.status === 204)
          console.log(`[Discord User - Unlink] Kicked user ID ${user.id} from Discord server`);
          strapi.service('api::profile.profile').auditLogger({
            userId: user.id,
            emailHashed: user?.emailHashed,
            accountId: discordProfiles[0]?.discordIdHashed,
            platform: "discord",
            event: "accountUnlinked"
          })
      } catch (error) {
        const errorDetails = {
          message: error?.response?.data?.message || error?.message || 'Unknown error',
          userId: user.id
        };
        if (error?.response) {
          const { message, ...responseData } = error.response.data;
          errorDetails.response = responseData;
          errorDetails.status = error.response.status;
          errorDetails.statusText = error.response.statusText;
        }
    
        console.error('[Discord User - Unlink kick from server] Discord API Error:', JSON.stringify(errorDetails));
        throw error;
      }
      // Update user
      return await strapi.entityService.update(
        "plugin::users-permissions.user",
        user.id,
        {
          data: {
            discordLinked: false,
          },
        }
      );
    },
    async create(ctx, next) {
      // get user from context
      const user = ctx.state.user;
      // get request body data from context
      const discordId = ctx.request.body.discordId;
      const discordIdHashed = strapi.service('api::crypto.crypto').createKeyedHash(discordId)
      const accessToken = ctx.request.body.accessToken;
      // check if current user is already linked to a discord user
      const discordProfiles = await strapi.entityService.findMany(
        "api::discord-user.discord-user",
        {
          filters: {
            $or: [{ discordIdHashed: discordIdHashed }, { user: { id: user.id } }],
          },
          populate: { user: { fields: ["id"] } },
        }
      );

      // Check if this user is already connected to a discord id
      // or if this Discord profile is linked to another user
      if (
        discordProfiles.filter(
          (d) => {
            if (d?.discordId) d.discordId = strapi.service('api::crypto.crypto').decryptSym(d.discordId);
            return (d?.user?.id === user.id && d?.discordId !== discordId) ||
              (d?.user?.id && d?.user?.id !== user.id)
          }

        ).length > 0
      ) {
        return ctx.badRequest("accountAlreadyConnectedToOtherUser");
      }
      const discordIdEncrypted = strapi.service('api::crypto.crypto').encryptSym(discordId)
      // Check if we have any matching Discord profiles stored
      if (discordProfiles.length > 0) {
        // if there is a "discord-user" linked to the current user
        // or linked to no user, then we link this "discord-user" id to the current user
        if (
          discordProfiles[0].user === null ||
          user.id === discordProfiles[0]?.user?.id
        ) {
          try {
            await strapi.entityService.update(
              "api::discord-user.discord-user",
              discordProfiles[0].id,
              {
                data: {
                  discordId: discordIdEncrypted,
                  discordIdHashed,
                  user: user.id,
                },
              }
            );
            console.log(`[Discord User - Create] Updated Discord ID ${discordProfiles[0].id} and linked it to user ${user.id}`)
            strapi.service('api::profile.profile').auditLogger({
              userId: user.id,
              emailHashed: user?.emailHashed,
              accountId: discordIdHashed,
              platform: "discord",
              event: "accountLinked"
            })
          } catch (error) {
            console.error(error)
          }
        }
      } else {
        //create discord-user
        try {
          await strapi.entityService.create(
            "api::discord-user.discord-user",
            {
              data: {
                discordId: discordIdEncrypted,
                discordIdHashed,
                user: user.id,
              },
            }
          );
          console.log(`[Discord User - Create] Created Discord user for user ${user.id}`);
          strapi.service('api::profile.profile').auditLogger({
            userId: user.id,
            emailHashed: user?.emailHashed,
            accountId: discordIdHashed,
            platform: "discord",
            event: "accountLinked"
          })
        } catch (error) {
          console.error(error)
        }
      }
      try {
        await addToDiscordServer({ discordId, accessToken, userId: user.id, ctx });
      } catch (error) {
 
        if (error?.response?.data?.code === 30001) {
          return ctx.badRequest("discordServerLimit");
        }
        throw error; 
      }
      // Check if study should activate
      const shouldActivate = strapi.service('api::profile.profile').shouldActivateDiscord({ user });
      const requiredAccountsLinked = strapi
        .service('api::profile.profile')
        .checkRequiredAccountsLinked({ user: { ...user, discordLinked: true } });
      let newUserData;
      if (shouldActivate) {
        const { activationDate, surveySendDate, studyEndDate } = strapi.service('api::profile.profile').calculateActivationDates()
        newUserData = {
          discordLinked: true,
          activationDate,
          surveySendDate,
          requiredAccountsLinked,
          studyEndDate
        }
      } else {
        newUserData = {
          discordLinked: true,
          requiredAccountsLinked
        }
      }
      await strapi.entityService.update(
        "plugin::users-permissions.user",
        user.id,
        {
          data: newUserData,
        }
      );
      return ctx.send({ ok: true });
    },
  })
);
