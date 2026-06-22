// Drop-in replacement for `next-auth/react`, used only in demo mode (wired up
// via the webpack alias in next.config.js). The "session" is a dummy email kept
// in localStorage; signing in never contacts a backend and no real account is
// ever touched. Exposes the four symbols the app imports: SessionProvider,
// useSession, signIn, signOut.
import { createContext, useContext, useEffect, useState } from "react"
import Router from "next/router"

const STORAGE_KEY = "glhs-demo-session"
const CHANGE_EVENT = "glhs-demo-session-change"

const SessionContext = createContext({ data: null, status: "unauthenticated" })

function readSession() {
  if (typeof window === "undefined") return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function writeSession(session) {
  if (typeof window === "undefined") return
  if (session) {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
  } else {
    window.localStorage.removeItem(STORAGE_KEY)
  }
  window.dispatchEvent(new Event(CHANGE_EVENT))
}

export function SessionProvider({ children }) {
  // Start in "loading" so server-rendered markup matches the first client
  // render, then hydrate from localStorage (same pattern as real NextAuth).
  // The `loaded` flag lets consumers tell "still hydrating" apart from
  // "definitely signed out".
  const [session, setSession] = useState(null)
  const [loaded, setLoaded] = useState(false)

  useEffect(() => {
    const sync = () => {
      setSession(readSession())
      setLoaded(true)
    }
    sync()
    window.addEventListener(CHANGE_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(CHANGE_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  const value = {
    data: session,
    status: !loaded ? "loading" : session ? "authenticated" : "unauthenticated",
  }
  return (
    <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
  )
}

export function useSession() {
  return useContext(SessionContext)
}

export async function signIn(provider, options = {}) {
  const email =
    options.email ||
    (provider === "google" ? "demo@gmail.com" : "demo@example.com")
  writeSession({ user: { email } })
  // The email form passes redirect:false and navigates itself; OAuth buttons
  // expect signIn to perform the redirect.
  if (options.redirect !== false) {
    Router.push(options.callbackUrl || "/profile")
  }
  return { ok: true, error: null, url: options.callbackUrl || "/profile" }
}

export async function signOut(options = {}) {
  writeSession(null)
  Router.push(options.callbackUrl || "/login")
  return { url: options.callbackUrl || "/login" }
}
