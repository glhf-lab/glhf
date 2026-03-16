import { getToken } from "next-auth/jwt"

/**
 * Unlink Discord user
 *
 */

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  const token = await getToken({ req })
  if (token?.jwt) {
    const response = await fetch(
      `${process.env.NEXT_INTERNAL_STRAPI_API_URL}/api/discord-users/unlink`,
      {
        headers: {
          Authorization: `Bearer ${token.jwt}`,
        },
      }
    )
    if (response?.status === 200) res.status(200).send("OK")
    else
      res
        .status(500)
        .json({ status: response?.status, message: response?.statusText })
  } else {
    res.status(401).send("Not authorized")
  }
}
