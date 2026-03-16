import { timingSafeEqual } from "crypto"

const AUTH_VERIFICATION_SECRET =
  process.env.NEXT_INTERNAL_AUTH_VERIFICATION_SECRET

const verificationToken = async (req, res) => {
  if (AUTH_VERIFICATION_SECRET === "") {
    return res.status(405).send("Method not allowed")
  }
  if (req.method === "POST") {
    const authToken = (req.headers.authorization || "").split("Bearer ").at(1)
    const { identifier } = req.body

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
      return res.status(tokenRes.status).json(await tokenRes.json())
    }
    return res.status(401).json({ error: "Invalid Auth Verification Secret" })
  } else {
    return res.status(405).send("Method not allowed")
  }
}

export default verificationToken
