import NextAuth from "next-auth"
import GoogleProvider from "next-auth/providers/google"
import EmailProvider from "next-auth/providers/email"
import DiscordProvider from "next-auth/providers/discord"
import { getToken } from "next-auth/jwt"
import { getIpAddress, redactForLog } from "@/lib/get-ip-address"
import { createRequestRateLimiter } from "@/lib/rate-limiter"

const generalLimiter = createRequestRateLimiter({ limit: 30, window: 60_000 })
const emailIpLimiter = createRequestRateLimiter({
  limit: 10,
  window: 15 * 60_000,
})
const emailAddrLimiter = createRequestRateLimiter({
  limit: 3,
  window: 15 * 60_000,
})

/** Web compatible method to create a hash, using SHA256 */
export async function createHash(message) {
  const data = new TextEncoder().encode(message)
  const hash = await crypto.subtle.digest("SHA-256", data)
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toString()
}

const StrapiAdapter = () => {
  return {
    createUser: (data) => data,
    getUser: (id) => null,
    getUserByEmail: (email) => null,
    getUserByAccount: (provider_providerAccountId) => null,
    updateUser: ({ id, ...data }) => null,
    deleteUser: (id) => null,
    linkAccount: (data) => data,
    unlinkAccount: (provider_providerAccountId) => true,
    getSessionAndUser: (sessionToken) => null,
    createSession: (data) => data,
    updateSession: (data) => data,
    deleteSession: (sessionToken) => null,
    async createVerificationToken(data) {
      // not used
      return data
    },
    async useVerificationToken({ identifier, token }) {
      // verify token against backend
      try {
        const res = await fetch(
          `${process.env.NEXT_INTERNAL_STRAPI_API_URL}/api/verification-tokens/verify`,
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${process.env.STRAPI_PASSWORDLESS_TOKEN}`,
            },
            method: "POST",
            body: JSON.stringify({
              identifier,
              token,
            }),
          }
        )
        if (!res.ok) {
          const errorBody = await res.text() // Use text() in case of non-JSON response
          console.error(
            "StrapiAdapter.useVerificationToken: Strapi API error during token verification",
            {
              status: res.status,
              statusText: res.statusText,
              identifier,
              errorBody,
            }
          )
          return null
        }
        const verificationToken = await res.json()
        return verificationToken
          ? { identifier, expires: new Date(verificationToken.expires) }
          : null
      } catch (error) {
        console.error(
          "StrapiAdapter.useVerificationToken: Error during token verification request:",
          { error, identifier }
        )
        return null
      }
    },
  }
}
const GOOGLE_SIGNIN_ENABLED = process.env.GOOGLE_SIGNIN_ENABLED === "true"
const EMAIL_SIGNIN_ENABLED = process.env.EMAIL_SIGNIN_ENABLED === "true"
const DISCORD_SIGNIN_ENABLED = process.env.DISCORD_SIGNIN_ENABLED === "true"
const providers = [
  GOOGLE_SIGNIN_ENABLED &&
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      authorization: { params: { scope: "openid email" } },
      profile(profile) {
        return {
          id: profile.sub,
          email: profile.email,
        }
      },
    }),
  EMAIL_SIGNIN_ENABLED &&
    EmailProvider({
      async sendVerificationRequest(data) {
        // create and send verification requests using our backend
        const { identifier, url, provider, theme, token } = data
        try {
          const res = await fetch(
            `${process.env.NEXT_INTERNAL_STRAPI_API_URL}/api/verification-tokens`,
            {
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${process.env.STRAPI_PASSWORDLESS_TOKEN}`,
              },
              method: "POST",
              body: JSON.stringify({
                identifier: identifier,
                type: "email",
              }),
            }
          )

          if (!res.ok) {
            const errorBody = await res.text()
            console.error(
              "EmailProvider.sendVerificationRequest: Strapi API error during email send",
              {
                status: res.status,
                statusText: res.statusText,
                identifier,
                errorBody,
              }
            )
            throw new Error(`Email send error: ${res.statusText}`)
          }
          const status = await res.json()
          if (!status.ok) {
            // redundant check?
            console.error(
              "EmailProvider.sendVerificationRequest: Strapi API returned not ok status",
              { status, identifier }
            )
            throw new Error(
              "Email send error from Strapi: " +
                (status.message || "Unknown error")
            )
          }
        } catch (error) {
          console.error(
            "EmailProvider.sendVerificationRequest: Error sending verification email:",
            { error, identifier }
          )
          // Re-throw the error so NextAuth can handle it or display a message
          throw error
        }
      },
      async generateVerificationToken() {
        // not used
        // tokens are created by our backend
        return
      },
    }),
  DISCORD_SIGNIN_ENABLED &&
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      authorization: {
        params: { scope: "identify email" },
      },
    }),
  DiscordProvider({
    id: "discord-link",
    name: "DiscordLink",
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
    authorization: {
      params: { scope: "identify guilds.join" },
    },
  }),
].filter((d) => d !== false)
const Auth = (req, res) => NextAuth(req, res, options)

export default async function auth(req, res) {
  const ip = getIpAddress(req)

  // General rate limit: 30 req/min per IP
  if (ip && generalLimiter.check(ip)) {
    console.warn("Rate limit: NextAuth general limit exceeded", {
      key: redactForLog(ip),
    })
    return res.status(429).json({ error: "Too many requests" })
  }

  // Email sign-in rate limits
  const nextauth = req.query.nextauth || []
  const isEmailSignIn =
    req.method === "POST" &&
    nextauth.includes("signin") &&
    nextauth.includes("email")

  if (isEmailSignIn) {
    const email = req.body?.email?.toLowerCase?.()
    const fakeSuccess = {
      url: `${process.env.NEXTAUTH_URL}/login?verifyRequest=true#sign-up`,
    }

    // Per-IP limit: 10 email sign-ins per 15 min
    if (ip && emailIpLimiter.check(ip)) {
      console.warn("Rate limit: email sign-in per-IP limit exceeded", {
        key: redactForLog(ip),
      })
      return res.status(200).json(fakeSuccess)
    }

    // Per-email limit: 3 per 15 min
    if (email && emailAddrLimiter.check(email)) {
      console.warn("Rate limit: email sign-in per-email limit exceeded", {
        key: redactForLog(email),
      })
      return res.status(200).json(fakeSuccess)
    }
  }

  let signedInToken
  if (req.query.nextauth.includes("discord-link") && req.method === "GET") {
    signedInToken = await getToken({ req })
  }

  return await NextAuth(req, res, {
    providers: providers,
    adapter: StrapiAdapter(),
    session: {
      strategy: "jwt",
    },
    pages: {
      signIn: "/login",
      error: "/login",
      verifyRequest: "/login?verifyRequest=true#sign-up",
    },
    callbacks: {
      async signIn({ user, account, profile, email, credentials }) {
        // check if this is a new user and if sign up is closed
        // we also check that the user is not trying to link their discord account
        if (account?.type == "oauth" && account?.provider !== "discord-link") {
          try {
            // Return redirect with error if new user and sign up is disabled
            const response = await fetch(
              `${process.env.NEXT_INTERNAL_STRAPI_API_URL}/api/users-permissions/auth/passwordless?access_token=${account.access_token}`,
              {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${process.env.STRAPI_PASSWORDLESS_TOKEN}`,
                },
                method: "POST",
                body: JSON.stringify({
                  provider: account?.provider,
                  type: "oauth",
                }),
              }
            )
            if (!response.ok) {
              const errorBody = await response.text()
              console.error(
                "signIn callback: Strapi API error during OAuth sign-in check",
                {
                  status: response.status,
                  statusText: response.statusText,
                  provider: account?.provider,
                  errorBody,
                }
              )
              // Deny sign-in if Strapi request fails
              return `${process.env.NEXTAUTH_URL}/api/auth/error?error=StrapiRequestFailed`
            }
            const signInRes = await response.json()
            const signInAllowed = signInRes?.jwt ? true : false
            // Silently deny sign in
            if (signInAllowed === false) {
              console.warn(
                "signIn callback: OAuth sign-in denied by Strapi (no JWT returned)",
                { provider: account?.provider, signInRes }
              )
              return `${process.env.NEXTAUTH_URL}/api/auth/verify-request?provider=email&type=email` // Consider a more specific error page/message
            }
          } catch (error) {
            console.error(
              "signIn callback: Error during OAuth sign-in check with Strapi:",
              { error, provider: account?.provider }
            )
            return `${process.env.NEXTAUTH_URL}/api/auth/error?error=OAuthSignInCheckError`
          }
        }

        // We handle linking gaming accounts here and use NextAuth to get OAuth access tokens.
        // We then create an account in the backend and redirect the user back to their profile page.
        // This will also cancel firing the JWT callback, which we do not need, since the user is already signed in
        // A bit hacky, but probably better than building a separate OAuth client just to add a custom callback
        if (account?.provider === "discord-link") {
          try {
            // Create user
            const discordUserResponse = await fetch(
              `${process.env.NEXT_INTERNAL_STRAPI_API_URL}/api/discord-users`,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${signedInToken?.jwt}`,
                },
                body: JSON.stringify({
                  discordId: account.providerAccountId,
                  accessToken: account.access_token,
                }),
              }
            )
            if (discordUserResponse.ok) {
              return "/profile"
            } else {
              const apiError = await discordUserResponse.json()
              console.error(
                "signIn callback: Strapi API error during Discord link",
                {
                  status: discordUserResponse.status,
                  statusText: discordUserResponse.statusText,
                  providerAccountId: account.providerAccountId,
                  apiError,
                }
              )
              const linkError =
                (apiError?.error?.message === "accountAlreadyConnected" &&
                  "accountAlreadyConnected") ||
                (apiError?.error?.message ===
                  "accountAlreadyConnectedToOtherUser" &&
                  "accountAlreadyConnectedToOtherUser") ||
                (apiError?.error?.message === "discordServerLimit" &&
                  "discordServerLimit")
              return `/profile?accountLinkError=${linkError || true}&provider=discord` // Added || true
            }
          } catch (error) {
            console.error(
              "signIn callback: Error during Discord link with Strapi:",
              { error, providerAccountId: account.providerAccountId }
            )
            return `/profile?accountLinkError=true&provider=discord&error=DiscordLinkStrapiError`
          }
        }
        return true
      },
      async session({ session, token, user }) {
        session.jwt = token.jwt
        return session
      },
      async jwt({ token, user, account }) {
        if (user) {
          if (account?.type === "oauth") {
            try {
              // send token to backend for verification and JWT creation
              const response = await fetch(
                `${process.env.NEXT_INTERNAL_STRAPI_API_URL}/api/users-permissions/auth/passwordless?access_token=${account.access_token}`,
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.STRAPI_PASSWORDLESS_TOKEN}`,
                  },
                  method: "POST",
                  body: JSON.stringify({
                    provider: account?.provider,
                    type: "oauth",
                  }),
                }
              )
              if (!response.ok) {
                const errorBody = await response.text()
                console.error(
                  "jwt callback (OAuth): Strapi API error during token exchange",
                  {
                    status: response.status,
                    statusText: response.statusText,
                    provider: account?.provider,
                    errorBody,
                  }
                )
                return { ...token, error: "OAuthStrapiError" }
              }
              const data = await response.json()
              if (!data.jwt) {
                console.error(
                  "jwt callback (OAuth): Strapi did not return JWT after token exchange",
                  { provider: account?.provider, responseData: data }
                )
                return { ...token, error: "OAuthStrapiNoJWT" }
              }
              token.jwt = data.jwt
              // token.user = data.user; // You might want to attach the user object from Strapi to the token
            } catch (error) {
              console.error(
                "jwt callback (OAuth): Error during Strapi token exchange:",
                { error, provider: account?.provider }
              )
              return { ...token, error: "OAuthStrapiRequestError" }
            }
          }
          if (account?.type === "email") {
            try {
              // send token and email to backend for verification and JWT creation
              const response = await fetch(
                `${process.env.NEXT_INTERNAL_STRAPI_API_URL}/api/users-permissions/auth/passwordless`,
                {
                  headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.STRAPI_PASSWORDLESS_TOKEN}`,
                  },
                  method: "POST",
                  body: JSON.stringify({
                    email: user.email,
                    verificationToken: req.query.token, // Ensure req is available here or passed appropriately
                    type: "email",
                  }),
                }
              )
              if (!response.ok) {
                const errorBody = await response.text()
                console.error(
                  "jwt callback (Email): Strapi API error during email verification",
                  {
                    status: response.status,
                    statusText: response.statusText,
                    email: user.email,
                    errorBody,
                  }
                )
                return { ...token, error: "EmailStrapiError" }
              }
              const data = await response.json()
              if (!data.jwt) {
                console.error(
                  "jwt callback (Email): Strapi did not return JWT after email verification",
                  { email: user.email, responseData: data }
                )
                return { ...token, error: "EmailStrapiNoJWT" }
              }
              token.jwt = data.jwt
            } catch (error) {
              console.error(
                "jwt callback (Email): Error during Strapi email verification:",
                { error, email: user.email }
              )
              return { ...token, error: "EmailStrapiRequestError" }
            }
          }
        }
        return token
      },
    },
  })
}
