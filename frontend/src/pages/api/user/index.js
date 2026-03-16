import { getToken } from "next-auth/jwt"

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
  // TODO: better error handling
  const token = await getToken({ req })
  if (token?.jwt) {
    const user = await fetch(
      `${process.env.NEXT_INTERNAL_STRAPI_API_URL}/api/users/me`,
      {
        headers: {
          Authorization: `Bearer ${token.jwt}`,
        },
      }
    ).then(async (res) => await res.json())
    res.status(200).json({ ...user, isLoggedIn: true })
  } else {
    res.status(200).json({ isLoggedIn: false })
  }
}
