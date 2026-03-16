import { useEffect } from "react"
import Router from "next/router"
import useSWR from "swr"
import { useSession } from "next-auth/react"

// Got from https://usehooks.com/useLockBodyScroll/
export function useLockBodyScroll() {
  useEffect(() => {
    // Get original body overflow
    const originalStyle = window.getComputedStyle(document.body).overflow

    // Prevent scrolling on mount
    document.body.style.overflow = "hidden"

    // Re-enable scrolling when component unmounts
    return () => (document.body.style.overflow = originalStyle)
  }, []) // Empty array ensures effect is only run on mount and unmount
}

export function useOnClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      // Do nothing if clicking ref's element or descendent elements
      if (!ref.current || ref.current.contains(event.target)) {
        return
      }

      handler(event)
    }

    document.addEventListener("mousedown", listener)
    document.addEventListener("touchstart", listener)

    return () => {
      document.removeEventListener("mousedown", listener)
      document.removeEventListener("touchstart", listener)
    }
  }, [ref, handler])
}

export function useUser({
  redirectTo = "",
  redirectIfFound = false,
  fallback = false,
} = {}) {
  const { data: user, mutate: mutateUser } = useSWR(
    "/api/user/profile",
    (url) => fetch(url).then((res) => res.json()),
    { fallback }
  )
  useEffect(() => {
    // if no redirect needed, just return (example: already on /dashboard)
    // if user data not yet there (fetch in progress, logged in or not) then don't do anything yet
    if (!redirectTo || !user) return

    if (
      // If redirectTo is set, redirect if the user was not found.
      (redirectTo && !redirectIfFound && !user?.isLoggedIn) ||
      // If redirectIfFound is also set, redirect if the user was found
      (redirectIfFound && user?.isLoggedIn)
    ) {
      Router.push(redirectTo)
    }
  }, [user, redirectIfFound, redirectTo])

  return { user, mutateUser }
}
