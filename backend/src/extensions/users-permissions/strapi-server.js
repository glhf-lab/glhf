//const { sanitize } = utils;
const { v4: uuid } = require("uuid");

// const sanitizeUser = (user, ctx) => {
//   const { auth } = ctx.state;
//   const userSchema = strapi.getModel("plugin::users-permissions.user");

//   return sanitize.contentAPI.output(user, userSchema, { auth });
// };
const secret = process.env.NEXTAUTH_SECRET

function isValidTimeZone(tz) {
  if (!Intl || !Intl.DateTimeFormat().resolvedOptions().timeZone) {
    throw new Error("Time zones are not available in this environment");
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone: tz });
    return true;
  } catch (ex) {
    return false;
  }
}
const getProfile = async (provider, query) => {
  const accessToken = query.access_token || query.code || query.oauth_token;

  const providers = await strapi
    .store({ type: 'plugin', name: 'users-permissions', key: 'grant' })
    .get();

  return strapi.plugin('users-permissions').service('providers-registry').run({
    provider,
    query,
    accessToken,
    providers,
  });
};

module.exports = (plugin) => {
  plugin.controllers.user.recordResearchConsent = async (ctx) => {
    try {
      const user = ctx.state.user;
      // User has to be logged in to update themselves
      if (!user) {
        return ctx.unauthorized();
      }
      // get recorded consent
      const { consentedToResearch } = await strapi.entityService.findOne(
        "plugin::users-permissions.user",
        user.id,
        { fields: ["consentedToResearch"] }
      );
      // Update user
      await strapi.entityService.update(
        "plugin::users-permissions.user",
        user.id,
        {
          data: {
            consentedToResearch: consentedToResearch === true ? false : true,
          },
        }
      );
      return ctx.send({ ok: true });
    } catch (error) {
      ctx.throw(500, error);
    }
  };
  plugin.controllers.user.dataDeletionRequest = async (ctx) => {
    try {
      const user = ctx.state.user;
      // User has to be logged in to update themselves
      if (!user) {
        return ctx.unauthorized();
      }
      // Update user
      await strapi.entityService.update(
        "plugin::users-permissions.user",
        user.id,
        {
          data: {
            consentedToResearch: false,
            dataDeletionRequest: true,
          },
        }
      );
      const discordProfiles = await strapi.entityService.findMany(
        "api::discord-user.discord-user",
        {
          filters: { user: { id: user.id } },
          fields: ["discordId"],
        }
      );
      const steamProfiles = await strapi.entityService.findMany(
        "api::steam-user.steam-user",
        {
          filters: { user: { id: user.id } },
          fields: ["id"],
        }
      );
      await strapi.entityService.create(
        "api::data-deletion-request.data-deletion-request",
        {
          data: {
            userId: user.id,
            users_user: user.id,
            steam_user: steamProfiles[0],
            discord_user: discordProfiles[0],
          },
        }
      );
      return ctx.send({ ok: true });
    } catch (error) {
      ctx.throw(500, error);
    }
  };
  plugin.controllers.user.setTimezone = async (ctx) => {
    const { body } = ctx.request;
    try {
      const user = ctx.state.user;
      // User has to be logged in to update themselves
      if (!user) {
        return ctx.unauthorized();
      }
      // timezone has to be valid
      if (!isValidTimeZone(body.tz)) return ctx.badRequest("Invalid timezone");

      // Update user
      await strapi.entityService.update(
        "plugin::users-permissions.user",
        user.id,
        {
          data: {
            timezone: body.tz,
            utcOffset: body.offset,
          },
        }
      );
      ctx.body = body;
    } catch (error) {
      ctx.throw(500, error);
    }
  };
  plugin.controllers.auth.getJwtFromEmail = async (ctx) => {
    // create JWT based on email address
    // both passwordless and oauth provider
    const { body } = ctx.request;
    const { jwt: jwtService } = strapi.plugins["users-permissions"].services;
    const provider = body?.provider
    const accountType = body.type
    let email
    if (accountType === "oauth") {
      const query = ctx.query
      // verify OAuth profile using access token
      const profile = await getProfile(provider, query)
      email = profile?.email
    } else if (accountType === "email") {
      // Verify email token again
      const verificationToken = body?.verificationToken;
      // NB. need to match hash function used by NextAuth
      const hashedToken = await strapi.service('api::crypto.crypto').createHash(`${verificationToken}${secret}`)
      const verifiedTokens = await strapi.entityService.findMany(
        "api::verification-token.verification-token",
        {
          filters: {
            identifier: { $eq: body?.email },
            token: { $eq: hashedToken },
            expires: { $gte: Date.now() },
          },
        }
      );
      if (verifiedTokens.length === 0) return ctx.unauthorized();
      // Delete used token
      if(await strapi.service('api::crypto.crypto').getProvider(body?.email) !== "qualtrics") {
        await strapi.entityService.delete(
          "api::verification-token.verification-token",
          verifiedTokens[0].id
        );
      }
 
      email = body?.email;
    }
    const emailHashed = await strapi.service('api::crypto.crypto').hashEmail(email)
    let user = await strapi.query("plugin::users-permissions.user").findOne({
      where: { emailHashed },
    });
    // create the user if it doesn't exist
    if (!user) {
      // check if sign up is disabled
      const advancedSettings = await strapi
        .store({ type: 'plugin', name: 'users-permissions', key: 'advanced' })
        .get();
      if (advancedSettings.allow_register === false)
        return ctx.badRequest("signUpDisabled");
      console.log("Creating user");
      function getUserSettings() {
        const pluginStore = strapi.store({
          environment: "",
          type: "plugin",
          name: "users-permissions",
        });
        return pluginStore.get({ key: "advanced" });
      }
      const userSettings = await getUserSettings();
      const role = await strapi
        .query("plugin::users-permissions.role")
        .findOne({
          where: { type: userSettings.default_role },
        });
      const provider = await strapi.service('api::crypto.crypto').getProvider(email)
      const newUser = {
        // we need to keep the Prolific ID
        email,
        emailHashed: emailHashed,
        uuid: uuid(),
        confirmed: true,
        provider,
        role: { id: role.id },
      };
      user = await strapi
        .query("plugin::users-permissions.user")
        .create({ data: newUser, populate: ["role"] });
    } else {
      // check if user is blocked
      if (user.blocked) return ctx.unauthorized();
    }
    // return JWT
    ctx.send({
      jwt: jwtService.issue({ id: user.id }),
      email: body.email,
    });
  };
  // Routes
  plugin.routes["content-api"].routes.push({
    method: "PUT",
    path: "/timezone",
    handler: "user.setTimezone",
  });
  plugin.routes["content-api"].routes.push({
    method: "GET",
    path: "/consent",
    handler: "user.recordResearchConsent",
  });
  plugin.routes["content-api"].routes.push({
    method: "GET",
    path: "/data-deletion-request",
    handler: "user.dataDeletionRequest",
  });
  // Policies
  // Only allow requests using API tokens with the `getJwtFromEmail` permission
  plugin.policies["hasTokenPermission"] = async (policyContext) => {
    const { strategy, credentials } = policyContext.state.auth;
    if (
      strategy?.name == "api-token" &&
      credentials?.permissions.includes(
        "plugin::users-permissions.auth.getJwtFromEmail"
      )
    ) {
      return true;
    }

    return false;
  };
  plugin.routes["content-api"].routes.push({
    method: "POST",
    path: "/auth/passwordless",
    handler: "auth.getJwtFromEmail",
    config: {
      policies: ["plugin::users-permissions.hasTokenPermission"],
    },
  });
  return plugin;
};
