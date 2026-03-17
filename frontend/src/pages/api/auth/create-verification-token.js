import { timingSafeEqual } from "crypto"
import { getIpAddress, redactForLog } from "@/lib/get-ip-address"
import { createFailedAttemptLimiter } from "@/lib/rate-limiter"

const AUTH_VERIFICATION_SECRET =
  process.env.NEXT_INTERNAL_AUTH_VERIFICATION_SECRET

const failedAuthLimiter = createFailedAttemptLimiter({
  limit: 5,
  interval: 60_000,
  blockDuration: 15 * 60_000,
})

const verificationToken = async (req, res) => {
  if (!AUTH_VERIFICATION_SECRET) {
    return res.status(405).send("Method not allowed")
  }
  if (req.method === "POST") {
    const ip = getIpAddress(req)

    // Require identifiable IP for M2M endpoint
    if (!ip) {
      return res.status(403).json({ error: "Forbidden" })
    }

    // Check if IP is blocked from failed auth attempts
    if (failedAuthLimiter.isBlocked(ip)) {
      console.warn("Rate limit: create-verification-token IP blocked", {
        key: redactForLog(ip),
      })
      return res.status(401).json({ error: "Unauthorized" })
    }

    const authToken = (req.headers.authorization || "").split("Bearer ").at(1)
    const { identifier } = req.body

    if (
      typeof identifier !== "string" ||
      identifier.length === 0 ||
      identifier.length > 256
    ) {
      return res.status(400).json({ error: "Invalid identifier" })
    }

    const providedBuf = Buffer.from(authToken || "")
    const secretBuf = Buffer.from(AUTH_VERIFICATION_SECRET)

    let isAuthorized = false
    if (providedBuf.length === secretBuf.length) {
      isAuthorized = timingSafeEqual(providedBuf, secretBuf)
    } else {
      timingSafeEqual(secretBuf, secretBuf)
    }

    if (isAuthorized) {
      const tokenRes = await fetch(
        `${process.env.NEXT_INTERNAL_STRAPI_API_URL}/api/verification-tokens`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.STRAPI_PASSWORDLESS_TOKEN}`,
          },
          method: "POST",
          body: JSON.stringify({
            identifier: identifier,
            type: "external",
          }),
        }
      )
      if (!tokenRes.ok) {
        return res
          .status(tokenRes.status)
          .json({ error: "Token creation failed" })
      }
      return res.status(tokenRes.status).json(await tokenRes.json())
    }
    // Record failed auth attempt
    failedAuthLimiter.increment(ip)
    return res.status(401).json({ error: "Unauthorized" })
  } else {
    return res.status(405).send("Method not allowed")
  }
}

export default verificationToken
