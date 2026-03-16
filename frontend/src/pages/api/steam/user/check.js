import { getToken } from "next-auth/jwt"

/**
 * Recheck Steam privacy settings
 *
 */

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  try {
    const token = await getToken({ req })
    if (token?.jwt) {
      const response = await fetch(
        `${process.env.NEXT_INTERNAL_STRAPI_API_URL}/api/steam-users/check`,
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
  } catch (error) {
    console.error("Error in /api/steam/user/check:", error)
    res.status(500).json({ message: "Internal Server Error" })
  }
}
