import { useEffect, useState } from "react"
import { getProfilePageData, getGlobalData } from "src/utils/api"
import Seo from "src/components/elements/seo"
import { useRouter } from "next/router"
import Layout from "src/components/layout"
import { useSession } from "next-auth/react"
import { useUser } from "src/utils/hooks"
import Accordion from "@/components/sections/accordion"
import Accounts from "@/components/sections/accounts"
import LoadingSkeleton from "@/components/profile/LoadingSkeleton"
import getProgress from "@/lib/profile/getProgress"
import StudyStatus from "@/components/login/StudyStatus"
import InformedConsent from "@/components/login/InformedConsent"
import DeleteAccount from "@/components/profile/DeleteAccount"
import { isDemoMode } from "src/utils/demo"

const ProfilePage = ({
  title,
  metadata,
  researchConsent,
  deleteAccount,
  accounts,
  preview,
  global,
  pageContext,
  fallback,
}) => {
  // In the static demo there is no middleware to gate /profile, so redirect
  // signed-out visitors to /login (the redirect waits until the demo session
  // has finished hydrating).
  const { user } = useUser({
    fallback,
    redirectTo: isDemoMode ? "/login" : "",
  })
  const { FAQ, progress, studyStatusContent } = user || {}
  // In the demo there is no backend to record consent, so track it in component
  // state instead. It starts unconsented (showing the consent screen) and is
  // not persisted across reloads.
  const [demoConsented, setDemoConsented] = useState(false)
  const hasConsented = isDemoMode ? demoConsented : user?.consentedToResearch
  const { data: session } = useSession()
  const router = useRouter()
  const { accountLinkError } = router.query
  useEffect(() => {
    if (user?.timezone === null && typeof session !== "undefined") {
      const postTzInfo = async ({ tz, offset }) => {
        try {
          const res = await fetch("/api/user/timezone", {
            method: "PUT",
            body: JSON.stringify({
              tz: tz,
              offset: offset,
            }),
          })
          if (!res.ok) {
            throw await res.json()
          }
          return res
        } catch (error) {
          console.log("Error updating timezone")
        }
      }
      const utcOffset = new Date().getTimezoneOffset()
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone
      const res = postTzInfo({
        tz: tz,
        offset: utcOffset,
      })
    }
  }, [session, user?.timezone])

  // Merge default site SEO settings with page specific SEO settings
  if (metadata.shareImage?.data == null) {
    delete metadata.shareImage
  }
  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  // Server-render loading state
  if (!user || user.isLoggedIn === false) {
    return (
      <Layout global={global} pageContext={pageContext}>
        <LoadingSkeleton accounts={accounts} />
      </Layout>
    )
  }
  const provider = user.provider
  user.sessionId = session?.user?.email
  let activationDate
  let surveySendDate
  if (user.activationDate) {
    activationDate = new Date(user.activationDate)
    surveySendDate = new Date(user.surveySendDate)
  } else {
    activationDate = false
    surveySendDate = false
  }
  const surveyActivationDate =
    user.surveyActivationDate === null
      ? "Not activated"
      : new Date(user.surveyActivationDate).toLocaleString()
  return (
    <Layout global={global} pageContext={pageContext}>
      {/* Add meta tags for SEO*/}
      <Seo metadata={metadataWithDefaults} />
      {/* Display content sections */}
      {hasConsented ? (
        <>
          <div className="container prose prose-lg gap-4 py-12 dark:prose-invert">
            <StudyStatus
              progress={progress}
              surveySendDate={surveySendDate}
              content={studyStatusContent}
              user={user}
              accountLinkError={accountLinkError}
              provider={provider}
            />
          </div>
          <div className="bg-gray-200 dark:border-2 dark:border-x-0 dark:border-zinc-900 dark:bg-black">
            <div className="container py-4 ">
              {progress.status !== "studyCompleted" && (
                <>
                  <div className="prose prose-lg m-auto">
                    <h2 className="text-center dark:text-stone-50">Accounts</h2>
                  </div>
                  <div className="justify-center gap-4 py-8 ">
                    <Accounts data={{ accounts, activationDate }} />
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      ) : (
        user?.dataDeletionRequest !== true && (
          <InformedConsent
            content={researchConsent}
            onConsent={() => setDemoConsented(true)}
          />
        )
      )}
      <div className="container prose prose-lg py-12 dark:prose-invert">
        <h2>{FAQ.title}</h2>
        <Accordion items={FAQ?.accordionItems} provider={provider} />
        <DeleteAccount content={deleteAccount} consented={hasConsented} />
        <p className="prose-sm text-center text-slate-500 dark:text-slate-400">
          Unique identifier: &quot;{user.uuid}&quot;
        </p>
      </div>
    </Layout>
  )
}

export async function getStaticProps(context) {
  const { params, preview = null } = context
  // i18n is disabled in demo, so locale fields from context are undefined.
  const locale = isDemoMode ? "en" : context.locale
  const locales = isDemoMode ? ["en"] : context.locales
  const defaultLocale = isDemoMode ? "en" : context.defaultLocale
  const pageData = await getProfilePageData({ locale, preview })
  const globalLocale = await getGlobalData(locale)
  const pageContext = {
    locale,
    locales,
    defaultLocale,
    slug: "profile",
  }
  const { title, metadata, researchConsent, accounts, FAQ, deleteAccount } =
    pageData.attributes
  return {
    props: {
      title,
      metadata,
      researchConsent,
      deleteAccount,
      accounts,
      pageContext,
      global: globalLocale.data,
      fallback: {
        "/api/user/profile": {
          isLoggedIn: false,
        },
      },
    },
    // ISR is unsupported by `output: export`.
    ...(isDemoMode ? {} : { revalidate: 300 }),
  }
}

export default ProfilePage
