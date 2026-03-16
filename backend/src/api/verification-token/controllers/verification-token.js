'use strict';
const sendVerificationRequest = require("../sendVerificationRequest")
/**
 * verification-token controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const crypto = require("crypto");
const secret = process.env.NEXTAUTH_SECRET

function randomString(size) {
  const i2hex = (i) => ("0" + i.toString(16)).slice(-2)
  const r = (a, i) => a + i2hex(i)
  const bytes = crypto.getRandomValues(new Uint8Array(size))
  return Array.from(bytes).reduce(r, "")
}


module.exports = createCoreController('api::verification-token.verification-token', {
  async create(ctx, next) {
    const { identifier, type } = ctx.request.body
    const provider = await strapi.service('api::crypto.crypto').getProvider(identifier)

    const advancedSettings = await strapi
      .store({ type: 'plugin', name: 'users-permissions', key: 'advanced' })
      .get();
    const emailHashed = strapi.service('api::crypto.crypto').hashEmail(identifier)
    const user = await strapi.query("plugin::users-permissions.user").findOne({
      where: { emailHashed },
    });
    // don't send verification tokens if new user and sign up is disabled
    if (!user && advancedSettings.allow_register === false) return ctx.badRequest("signUpDisabled")
    // don't send if user is blocked
    if (user?.blocked) return ctx.unauthorized()
    let expires
    if (provider === "qualtrics") {
      // create verification token, valid 1 month
      expires = new Date(
        Date.now() + (3600 * 24 * 30) * 1000
      )
    } else {
      // create verification token, valid 1 hour
      expires = new Date(
        Date.now() + (3600) * 1000
      )
    }

    const token = randomString(32)
    // createHash must match NextAuth's createHash
    const tokenHashed = await strapi.service('api::crypto.crypto').createHash(`${token}${secret}`)
    try {
      await strapi.entityService.create("api::verification-token.verification-token", {
        data: {
          identifier: identifier,
          token: tokenHashed,
          expires: expires
        }
      })
    } catch (error) {
      console.error(error)
      ctx.send({ ok: false })
    }
    // Send verificationEmail
    const baseUrl = process.env.NEXTAUTH_URL
    const callbackUrl = `${baseUrl}/profile`
    const url = `${baseUrl}/api/auth/callback/email?${new URLSearchParams({
      callbackUrl,
      token,
      email: identifier,
    })}`
    const params = {
      identifier,
      token,
      url,
      provider: {
        server: {
          host: process.env.EMAIL_SERVER_HOST,
          port: process.env.EMAIL_SERVER_PORT,
          auth: {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD,
          },
        },
        from: process.env.EMAIL_FROM,
      }
    }
    if (type == "email") {
      const res = await sendVerificationRequest(params)
      return ctx.send(res)
    } else if (type == "external" && provider == "qualtrics") {
      // Custom logic to show sign in URL directly in a qualtrics survey
      // requires a Qualtrics Web Service
      return ctx.send({ url })
    } else return ctx.badRequest()


  },
  async verify(ctx, next) {
    // verify token
    const { identifier, token } = ctx.request.body
    const verificationToken = await strapi.entityService.findMany(
      "api::verification-token.verification-token",
      {
        filters: {
          identifier: { $eq: identifier },
          token: { $eq: token },
          expires: { $gte: Date.now() },
        },
      }
    );
    if (verificationToken.length > 0) {
      return ctx.send(verificationToken[0])
    } else return ctx.send(false)
  }
});
