// Fixture accessors used by the data-fetching helpers when isDemoMode is on.
// These mirror the return shapes of the corresponding api.js functions so the
// pages render identically without any backend. Regenerate the JSON with
// scripts/snapshot-demo-fixtures.mjs against a running Strapi instance.
import globalData from "./fixtures/global.json"
import loginData from "./fixtures/login.json"
import profileData from "./fixtures/profile.json"
import userData from "./fixtures/user.json"
import pages from "./fixtures/pages.json"

const pageBySlug = Object.fromEntries(
  pages.map((page) => [page.attributes.slug, page])
)

export function demoGlobal() {
  return globalData
}

export function demoLogin() {
  return loginData
}

export function demoProfile() {
  return profileData
}

export function demoUser() {
  return userData
}

export function demoPageSlugs() {
  return pages.map((page) => ({ slug: page.attributes.slug }))
}

export function demoPage(slug) {
  return pageBySlug[slug] ?? null
}
