const axios = require("axios");
const path = require("path");
const fs = require("fs")
module.exports = async () => {
  const users = await strapi.entityService.findMany(
    "plugin::users-permissions.user",
    {
      fields: ["id", "studyEndDate", "studyCompleted", "provider", "emailHashed"],
      filters: {
        studyEndDate: { $lte: Date.now() },
        studyCompleted: { $ne: true },
      },
    }
  );
  if (users.length > 0) {
    const directory = path.resolve("./.tmp/data/study-completions")
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }
    await Promise.all(
      users.map(async (user) => {
        console.log("Study completed for user:", user.id);
        // Remove Steam Id
        const steamProfile = await strapi.entityService.findMany(
          "api::steam-user.steam-user",
          { filters: { user: user.id } }
        );
        if (steamProfile.length > 0) {
          try {
            await strapi.entityService.delete(
              "api::steam-user.steam-user",
              steamProfile[0].id
            );
            console.log(`Deleted Steam user for User ID: ${user.id} (Study completed)`)
          } catch (error) {
            console.error(error)
          }
        }
        // Kick from discord server
        // Fetch the discord profile
        const discordProfiles = await strapi.entityService.findMany(
          "api::discord-user.discord-user",
          {
            filters: { user: { id: user.id } },
            populate: { user: { fields: ["id"] } },
          }
        );
        // Kick user from Discord server
        if (
          discordProfiles.length > 0 &&
          discordProfiles[0]?.discordId !== null
        ) {
          const discordIdEncrypted = discordProfiles[0]?.discordId;
          const discordId = strapi.service('api::crypto.crypto').decryptSym(discordIdEncrypted)
          const discordUrl = `https://discord.com/api/guilds/${process.env.DISCORD_GUILD}/members/${discordId}`;
          try {
            const guildKickRes = await axios.delete(discordUrl, {
              headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
              },
            });
            if (guildKickRes?.status === 204)
              console.log(
                `Kicked user ID ${user.id} from Discord server (study completed)`
              );
          } catch (error) {
            console.error(error);
          }
          try {
            await strapi.entityService.delete(
              "api::discord-user.discord-user",
              discordProfiles[0]?.id
            );
            console.log(`Deleted Discord user for User ID: ${user.id} (Study completed)`)
          } catch (error) {
            console.error(error)
          }
        }
        // Store user ID and hashed Discord ID
          // we need to this to join the stored Discord activity data
          const data = {
            "userId": user.id,
            "discordIdHashed": discordProfiles[0]?.discordIdHashed ?? null,
            "timestamp": Date.now()
          }
          if(user?.provider === "qualtrics") {
            data.qualtricsPid = user?.emailHashed
          }
          fs.writeFile(
            path.resolve(directory, `user-${user.id}.json`),
            JSON.stringify(data),
            function (err) {
              if (err) console.error(err);
            })
          // delete discord user
        const updatedUserData = {
          studyCompleted: true,
          discordLinked: false,
          steamLinked: false,
        };
        strapi.entityService.update("plugin::users-permissions.user", user.id, {
          data: updatedUserData,
        });
      })
    );
  }
};
