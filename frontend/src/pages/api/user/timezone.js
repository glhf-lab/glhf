import { getToken } from "next-auth/jwt"

/**
 * Add user's timezone to backend user object
 *
 */

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  const token = await getToken({ req })
  if (token?.jwt) {
    const response = await fetch(
      `${process.env.NEXT_INTERNAL_STRAPI_API_URL}/api/users-permissions/timezone`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token.jwt}`,
        },
        body: req.body,
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
