import { getToken } from "next-auth/jwt"
import { getStrapiURL } from "src/utils/api"
import getProgress from "@/lib/profile/getProgress"

// eslint-disable-next-line import/no-anonymous-default-export
export default async (req, res) => {
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
    let provider
    switch (user?.provider) {
      case "prolific":
      case "qualtrics":
        provider = user.provider
        break
      default:
        provider = "public"
    }
    const gqlEndpoint = getStrapiURL("/graphql")
    const pagesRes = await fetch(gqlEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
        query GetProfile($provider: String!) {
          profile {
            data {
              id
              attributes {
                feedback(filters: { provider: { eq: $provider } }) {
                  id
                  provider
                  notLinked
                  linkedNotActive
                  active
                  surveySent
                  studyCompleted
                  progress {
                    showLinkStep
                    showCheckPrivacyStep
                    showSurveyStep
                    showStudyCompletedStep
                    linkStepCompletedLabel
                    linkStepNotCompletedLabel
                    checkPrivacyStepCompletedLabel
                    checkPrivacyStepNotCompletedLabel
                    surveyStepCompletedLabel
                    surveyStepNotCompletedLabel
                    studyCompletedLabel
                  }
                }
                FAQ {
                  title
                  accordionItems(filters: { showTo: { in: [$provider, "everyone"] } }) {
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
          provider: provider,
          publicationState: "LIVE",
        },
      }),
    })

    const pageData = await pagesRes.json()

    const { FAQ, feedback } = pageData.data.profile.data.attributes

    const progress = getProgress(user)

    let studyStatusContent
    let stepperContent
    if (feedback.length > 0) {
      studyStatusContent = feedback[0][progress.status]
      stepperContent = feedback[0].progress
    } else {
      studyStatusContent = false
      stepperContent = false
    }
    res.status(200).json({
      ...user,
      isLoggedIn: true,
      FAQ,
      progress,
      stepper: stepperContent,
      studyStatusContent,
    })
  } else {
    res.status(200).json({ isLoggedIn: false })
  }
}
