// Regenerates the demo content fixtures from a running Strapi instance.
//
//   NEXT_INTERNAL_STRAPI_API_URL=http://localhost:1337 \
//     node frontend/scripts/snapshot-demo-fixtures.mjs
//
// Writes global.json, login.json, profile.json and pages.json under
// src/demo/fixtures/. It does NOT touch user.json — the authenticated
// /api/user/profile response cannot be fetched without a session, so that
// fixture is hand-maintained.
import { writeFileSync } from "node:fs"
import { dirname, join } from "node:path"
import { fileURLToPath } from "node:url"

const STRAPI = process.env.NEXT_INTERNAL_STRAPI_API_URL || "http://localhost:1337"
const GRAPHQL = `${STRAPI}/graphql`
const fixturesDir = join(
  dirname(fileURLToPath(import.meta.url)),
  "..",
  "src",
  "demo",
  "fixtures"
)

async function gql(query, variables) {
  const res = await fetch(GRAPHQL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ query, variables }),
  })
  const json = await res.json()
  if (json.errors) {
    throw new Error(JSON.stringify(json.errors, null, 2))
  }
  return json.data
}

const FILE_PARTS = `
  fragment FileParts on UploadFileEntityResponse {
    data { id attributes { alternativeText width height mime url formats } }
  }
`

const PAGE_FIELDS = `
  id
  attributes {
    locale
    localizations { data { id attributes { locale } } }
    slug
    metadata {
      metaTitle metaDescription
      shareImage { ...FileParts }
      twitterCardType twitterUsername
    }
    contentSections {
      __typename
      ... on ComponentSectionsBottomActions { id title buttons { id newTab text type url } }
      ... on ComponentSectionsHero { id buttons { id newTab text type url } title description smallTextWithLink label picture { ...FileParts } pictureCredit }
      ... on ComponentSectionsFeatureColumnsGroup { id features { id description icon { ...FileParts } title } }
      ... on ComponentSectionsFeatureRowsGroup { id features { id description link { id newTab text url } media { ...FileParts } title } }
      ... on ComponentSectionsLargeVideo { id description title poster { ...FileParts } video { ...FileParts } }
      ... on ComponentSectionsRichText { id content }
      ... on ComponentSectionsLeadForm { id emailPlaceholder location submitButton { id text type } title }
      ... on ComponentSectionsTeam { id title description teamMember { id name title links { id url icon } picture { ...FileParts } } }
      ... on ComponentSectionsLogos { id title description logos { title logo { ...FileParts } } }
    }
  }
`

function write(name, data) {
  writeFileSync(join(fixturesDir, name), JSON.stringify(data, null, 2) + "\n")
  console.log(`wrote ${name}`)
}

async function main() {
  // Global
  const globalData = await gql(
    `${FILE_PARTS}
     query GetGlobal($locale: I18NLocaleCode!) {
       global(locale: $locale) {
         data { id attributes {
           studyName
           metadata { metaTitle metaDescription shareImage { ...FileParts } twitterCardType twitterUsername }
           metaTitleSuffix
           notificationBanner { enabled text }
           navbar { logo { logoImg { ...FileParts } textTop textBottom } links { id url newTab text } button { id url newTab text type } }
           footer { smallText columns { id title links { id url newTab text } } }
         } }
       }
     }`,
    { locale: "en" }
  )
  write("global.json", globalData.global)

  // Login page
  const loginData = await gql(
    `query GetLogin {
       loginPage { data { id attributes {
         metadata { metaTitle metaDescription twitterCardType twitterUsername }
         title description showLoginSection
         closeSignUp { signUpEnabled description }
         FAQ { title accordionItems { id title content showTo } }
       } } }
     }`,
    {}
  )
  write("login.json", loginData.loginPage.data)

  // Profile page (CMS content, not the per-user data)
  const profileData = await gql(
    `query GetProfile {
       profile { data { id attributes {
         title
         metadata { metaTitle metaDescription twitterCardType twitterUsername }
         researchConsent
         accounts {
           __typename
           ... on ComponentIntegrationsSteam { show notConnected { titleNotConnected descriptionNotConnected buttonLabelNotConnected } connectedSuccess { title chip description } connectedFail { title chip description feedbackFoundOwnedGames feedbackNoOwnedGames feedbackHasPlaytimePublic feedbackHasPlaytimePrivate feedbackFoundRecentlyPlayedGames feedbackNoRecentlyPlayedGames buttonLabelRecheck } }
           ... on ComponentIntegrationsDiscord { show notConnected { titleNotConnected descriptionNotConnected buttonLabelNotConnected } connectedSuccess { title chip description } connectedFail { title chip description } }
         }
         deleteAccount { header withdrawHeader withdrawDescription withdrawButtonLabel deleteDataHeader deleteDataDescription deleteDataButtonLabel deleteDataModal deleteDataModalHeader deleteDataModalButtonCancelLabel deleteDataModalButtonDeleteLabel }
       } } }
     }`,
    {}
  )
  write("profile.json", profileData.profile.data)

  // All published pages
  const pagesData = await gql(
    `${FILE_PARTS}
     query GetAllPages($publicationState: PublicationState!, $locale: I18NLocaleCode!) {
       pages(publicationState: $publicationState, locale: $locale, pagination: { limit: 100 }) {
         data { ${PAGE_FIELDS} }
       }
     }`,
    { publicationState: "LIVE", locale: "en" }
  )
  write("pages.json", pagesData.pages.data)

  console.log("\nDone. Review the fixtures and adjust user.json by hand if needed.")
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
