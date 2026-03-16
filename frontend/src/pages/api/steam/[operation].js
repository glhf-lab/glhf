import { getToken } from "next-auth/jwt"
import SteamSignIn from "steam-signin"
import { createRouter } from "next-connect"
const secret = process.env.NEXTAUTH_SECRET
const router = createRouter()
const signIn = new SteamSignIn(process.env.NEXT_PUBLIC_API_URL)

// Simple Retry configuration
const MAX_RETRIES = 5
const INITIAL_RETRY_DELAY = 200 // 1 second

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const verifySteamLoginWithRetry = async (url, retryCount = 0) => {
  try {
    return await signIn.verifyLogin(url)
  } catch (error) {
    // Check if it's a rate limit error (HTTP 429)
    if (error.message.includes("HTTP error 429") && retryCount < MAX_RETRIES) {
      const delay = INITIAL_RETRY_DELAY * Math.pow(2, retryCount) // Exponential backoff
      console.log(
        `Steam rate limited, retrying in ${delay}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`
      )
      await sleep(delay)
      return verifySteamLoginWithRetry(url, retryCount + 1)
    }
    throw error
  }
}

// passport.use(
//   new SteamStrategy(
//     {
//       returnURL: `${process.env.NEXT_PUBLIC_API_URL}/api/steam/callback`,
//       realm: `${process.env.NEXT_PUBLIC_API_URL}`,
//       apiKey: `${process.env.STEAM_API_KEY}`,
//     },
//     (_, profile, done) => {
//       // Fetch any more information to populate
//       return done(null, profile)
//     }
//   )
// )

router.get((req, res, next) => {
  if (req.query.operation === "login") {
    return res
      .status(500)
      .redirect(
        signIn.getUrl(`${process.env.NEXT_PUBLIC_API_URL}/api/steam/callback`)
      )
  } else if (req.query.operation === "callback") {
    ;(async () => {
      try {
        let steamId = await verifySteamLoginWithRetry(req.url)
        // Convert the BigInt to a string before storing it in the session
        const steamIdString = steamId.getBigIntID().toString()
        //res.redirect("/");
        let strapiToken
        try {
          const tokenData = await getToken({ req, secret })
          if (!tokenData?.jwt) {
            console.error("Failed to get JWT token after Steam callback.")
            res
              .status(500)
              .redirect(
                "/profile?accountLinkError=true&provider=steam&error=token_retrieval_failed"
              )
            return
          }
          strapiToken = tokenData.jwt
        } catch (tokenError) {
          console.error(
            "Error retrieving JWT token after Steam callback:",
            tokenError
          )
          res
            .status(500)
            .redirect(
              "/profile?accountLinkError=true&provider=steam&error=token_retrieval_error"
            )
          return
        }

        // Save Steam user in backend
        try {
          const postRes = await fetch(
            `${process.env.NEXT_INTERNAL_STRAPI_API_URL}/api/steam-users`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${strapiToken}`,
              },
              body: JSON.stringify({
                data: { steamid: steamIdString },
              }),
            }
          )
          if (postRes.ok) {
            return res.redirect("/profile")
          } else {
            const responseBody = await postRes.json()
            console.error("Strapi API error when saving Steam user:", {
              status: postRes.status,
              statusText: postRes.statusText,
              body: responseBody,
            })
            const steamLinkError =
              responseBody?.error?.message ===
                "accountAlreadyConnectedToOtherUser" &&
              "accountAlreadyConnectedToOtherUser"

            return res
              .status(postRes.status)
              .redirect(
                `/profile?accountLinkError=${steamLinkError || true}&provider=steam&error=backend_error`
              )
          }
        } catch (error) {
          console.error("Steam link error during Strapi API call:", error)
          return res
            .status(500)
            .redirect(
              "/profile?accountLinkError=true&provider=steam&error=backend_exception"
            )
        }
      } catch (ex) {
        console.error(
          `[Steam Link - Callback] Failed to validate your login: ${ex.message}`
        )

        // Handle specific HTTP status code errors
        if (ex.message.includes("HTTP error")) {
          const statusCode = parseInt(ex.message.match(/HTTP error (\d+)/)[1])
          return res
            .status(statusCode)
            .redirect(
              `/profile?accountLinkError=steamHttp${statusCode}&provider=steam`
            )
        }

        return res
          .status(500)
          .redirect(
            "/profile?accountLinkError=true&provider=steam&error=auth_failed"
          )
      }
    })()
  }
})

export default router.handler({
  onError: (err, req, res) => {
    console.error(err.stack)
    res.status(err.statusCode || 500).end(err.message)
  },
})
export const config = {
  api: {
    externalResolver: true,
  },
}
