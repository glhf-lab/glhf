import qs from "qs"

export function getStrapiURL(path) {
  return `${
    process.env.NEXT_INTERNAL_STRAPI_API_URL || "http://localhost:1337"
  }${path}`
}

/**
 * Helper to make GET requests to Strapi API endpoints
 * @param {string} path Path of the API route
 * @param {Object} urlParamsObject URL params object, will be stringified
 * @param {RequestInit} options Options passed to fetch
 * @returns Parsed API call response
 */
export async function fetchAPI(path, urlParamsObject = {}, options = {}) {
  // Merge default and user options
  const mergedOptions = {
    headers: {
      "Content-Type": "application/json",
    },
    ...options,
  }

  // Build request URL
  const queryString = qs.stringify(urlParamsObject)
  const requestUrl = `${getStrapiURL(
    `/api${path}${queryString ? `?${queryString}` : ""}`
  )}`

  // Trigger API call
  const response = await fetch(requestUrl, mergedOptions)

  // Handle response
  if (!response.ok) {
    console.error(response.statusText)
    throw new Error(`An error occured please try again`)
  }
  const data = await response.json()
  return data
}

/**
 *
 * @param {Object} options
 * @param {string} options.slug The page's slug
 * @param {string} options.locale The current locale specified in router.locale
 * @param {boolean} options.preview router isPreview value
 */
export async function getPageData({ slug, locale, preview }) {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  try {
    const pagesRes = await fetch(gqlEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
        fragment FileParts on UploadFileEntityResponse {
          data {
            id
            attributes {
              alternativeText
              width
              height
              mime
              url
              formats
            }
          }
        }
        query GetPages(
          $slug: String!
          $publicationState: PublicationState!
          $locale: I18NLocaleCode!
        ) {        
          pages(
            filters: { slug: { eq: $slug } }
            publicationState: $publicationState
            locale: $locale
          ) {
            data {
              id
              attributes {
                locale
                localizations {
                  data {
                    id
                    attributes {
                      locale
                    }
                  }
                }
                slug
                metadata {
                  metaTitle
                  metaDescription
                  shareImage {
                    ...FileParts
                  }
                  twitterCardType
                  twitterUsername
                }
                contentSections {
                  __typename
                  ... on ComponentSectionsBottomActions {
                    id
                    title
                    buttons {
                      id
                      newTab
                      text
                      type
                      url
                    }
                  }
                  ... on ComponentSectionsHero {
                    id
                    buttons {
                      id
                      newTab
                      text
                      type
                      url
                    }
                    title
                    description
                    smallTextWithLink
                    label
                    picture {
                      ...FileParts
                    }
                    pictureCredit
                  }
                  ... on ComponentSectionsFeatureColumnsGroup {
                    id
                    features {
                      id
                      description
                      icon {
                        ...FileParts
                      }
                      title
                    }
                  }
                  ... on ComponentSectionsFeatureRowsGroup {
                    id
                    features {
                      id
                      description
                      link {
                        id
                        newTab
                        text
                        url
                      }
                      media {
                        ...FileParts
                      }
                      title
                    }
                  }
                  ... on ComponentSectionsLargeVideo {
                    id
                    description
                    title
                    poster {
                      ...FileParts
                    }
                    video {
                      ...FileParts
                    }
                  }
                  ... on ComponentSectionsRichText {
                    id
                    content
                  }
                  ... on ComponentSectionsLeadForm {
                    id
                    emailPlaceholder
                    location
                    submitButton {
                      id
                      text
                      type
                    }
                    title
                  }
                  ... on ComponentSectionsTeam {
                    id
                    title
                    description
                    teamMember {
                      id
                      name
                      title
                      links {
                        id
                        url
                        icon
                      }
                      picture {
                          ...FileParts
                      }
                    }
                  }
                  ... on ComponentSectionsLogos {
                    id
                    title
                    description
                    logos {
                      title
                      logo {  ...FileParts}
                    }
                  }
                }
              }
            }
          }
        }      
      `,
        variables: {
          // prevent annoying problem where Strapi + postgres save
          // empty slug as null instead of an empty string
          slug: slug === "" ? "/" : slug,
          publicationState: preview ? "PREVIEW" : "LIVE",
          locale,
        },
      }),
    })

    const pagesData = await pagesRes.json()

    if (pagesData?.errors) console.log(JSON.stringify(pagesData, null, 2))

    // Make sure we found something, otherwise return null
    if (pagesData.data?.pages == null || pagesData.data.pages.length === 0) {
      return null
    }
    // Return the first item since there should only be one result per slug
    return pagesData.data.pages.data[0]
  } catch (error) {
    console.log(error)
    return null
  }
}

/**
 *
 * @param {Object} options
 * @param {string} options.slug The page's slug
 * @param {string} options.locale The current locale specified in router.locale
 * @param {boolean} options.preview router isPreview value
 */
export async function getProfilePageData({ locale, preview }) {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const pagesRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
      query GetProfile {
      profile {
        data {
          id
          attributes {
            title
            metadata {
              metaTitle
              metaDescription
              twitterCardType
              twitterUsername
            }
            researchConsent
            accounts {
              __typename
              ... on ComponentIntegrationsSteam {
                show
                notConnected {
                  titleNotConnected
                  descriptionNotConnected
                  buttonLabelNotConnected
                }
                connectedSuccess {
                  title
                  chip
                  description
                }
                connectedFail {
                  title
                  chip
                  description
                  feedbackFoundOwnedGames
                  feedbackNoOwnedGames
                  feedbackHasPlaytimePublic
                  feedbackHasPlaytimePrivate
                  feedbackFoundRecentlyPlayedGames
                  feedbackFoundRecentlyPlayedGames
                  feedbackNoRecentlyPlayedGames
                  buttonLabelRecheck
                }
              }
              ... on ComponentIntegrationsDiscord {
                show
                notConnected {
                  titleNotConnected
                  descriptionNotConnected
                  buttonLabelNotConnected
                }
                connectedSuccess {
                  title
                  chip
                  description
                }
                connectedFail {
                  title
                  chip
                  description
                }
              }
            }
            deleteAccount {
              header
              withdrawHeader
              withdrawDescription
              withdrawButtonLabel
              deleteDataHeader
              deleteDataDescription
              deleteDataButtonLabel
              deleteDataModal
              deleteDataModalHeader
              deleteDataModalButtonCancelLabel
              deleteDataModalButtonDeleteLabel
            }
          }
        }
      }
    }
      `,
      variables: {
        publicationState: preview ? "PREVIEW" : "LIVE",
      },
    }),
  })

  const pagesData = await pagesRes.json()
  return pagesData.data.profile.data
}

/**
 *
 * @param {Object} options
 * @param {string} options.slug The page's slug
 * @param {string} options.locale The current locale specified in router.locale
 * @param {boolean} options.preview router isPreview value
 */
export async function getLoginPageData({ locale, preview }) {
  // Find the pages that match this slug
  const gqlEndpoint = getStrapiURL("/graphql")
  const pagesRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
      query GetLogin {
        loginPage {
          data {
            id
            attributes {
              metadata {
                metaTitle
                metaDescription
                twitterCardType
                twitterUsername
              }
              title
              description
              showLoginSection
              closeSignUp {
                signUpEnabled
                description
              }
              FAQ {
                title
                accordionItems {
                  id
                  title
                  content
                  showTo
                }
              }
            }
          }
        }
      }
      `,
      variables: {
        publicationState: preview ? "PREVIEW" : "LIVE",
      },
    }),
  })

  const pagesData = await pagesRes.json()
  return pagesData.data.loginPage.data
}

// Get site data from Strapi (metadata, navbar, footer...)
export async function getGlobalData(locale) {
  const gqlEndpoint = getStrapiURL("/graphql")
  const globalRes = await fetch(gqlEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `
        fragment FileParts on UploadFileEntityResponse {
          data {
            id
            attributes {
              alternativeText
              width
              height
              mime
              url
              formats
            }
          }
        }
        query GetGlobal($locale: I18NLocaleCode!) {
          global(locale: $locale) {
            data {
              id
              attributes {
                studyName
                metadata {
                  metaTitle
                  metaDescription
                  shareImage {
                    ...FileParts
                  }
                  twitterCardType
                  twitterUsername
                }
                metaTitleSuffix
                notificationBanner {
                  enabled
                  text
                }
                navbar {
                  logo {
                    logoImg {
                      ...FileParts
                    }
                    textTop
                    textBottom
                  }
                  links {
                    id
                    url
                    newTab
                    text
                  }
                  button {
                    id
                    url
                    newTab
                    text
                    type
                  }
                }
                footer {
                  smallText
                  columns {
                    id
                    title
                    links {
                      id
                      url
                      newTab
                      text
                    }
                  }
                }
              }
            }
          }
        }      
      `,
      variables: {
        locale,
      },
    }),
  })

  const global = await globalRes.json()
  return global.data.global
}
