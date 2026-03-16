import { getGlobalData, getLoginPageData } from "src/utils/api"
import Seo from "src/components/elements/seo"
import Layout from "src/components/layout"
import { useSession } from "next-auth/react"
import Markdown from "react-markdown"
import Accordion from "@/components/sections/accordion"
import SignInSection from "@/components/login/SignInSection"
import SignedInSection from "@/components/login/SignedInSection"

const LoginPage = ({
  title,
  description,
  closeSignUp,
  showLoginSection,
  FAQ,
  preview,
  metadata,
  providers,
  global,
  pageContext,
}) => {
  // Merge default site SEO settings with page specific SEO settings
  if (metadata.shareImage?.data == null) {
    delete metadata.shareImage
  }
  const metadataWithDefaults = {
    ...global.attributes.metadata,
    ...metadata,
  }
  const { data: session } = useSession()
  return (
    <Layout global={global} pageContext={pageContext}>
      {/* Add meta tags for SEO*/}
      <Seo metadata={metadataWithDefaults} />
      {/* Display content sections */}
      <div className="container prose prose-xl py-12 dark:prose-invert">
        <h1>{title}</h1>
        <Markdown>{description}</Markdown>
      </div>
      <div className="container h-full max-w-xl px-6 py-12">
        <div className="g-6 flex h-full justify-center text-gray-800">
          {session?.user ? (
            <SignedInSection email={session?.user?.email} />
          ) : (
            <SignInSection
              closeSignUp={closeSignUp}
              providers={providers}
              showLoginSection={showLoginSection}
            />
          )}
        </div>
      </div>
      <div className="container prose prose-xl py-12 dark:prose-invert">
        <h2>{FAQ.title}</h2>
        <Accordion items={FAQ?.accordionItems} />
      </div>
    </Layout>
  )
}

export async function getStaticProps(context) {
  const { locale, locales, defaultLocale, preview = null } = context
  const pageData = await getLoginPageData({ locale, preview })
  const globalLocale = await getGlobalData(locale)
  const pageContext = {
    locale,
    locales,
    defaultLocale,
    slug: "login",
  }
  const { title, metadata, description, FAQ, closeSignUp, showLoginSection } =
    pageData.attributes
  const emailProvider = []
  const oauthProviders = []
  if (process.env.GOOGLE_SIGNIN_ENABLED === "true")
    oauthProviders.push({ id: "google", name: "Google" })
  if (process.env.DISCORD_SIGNIN_ENABLED === "true")
    oauthProviders.push({ id: "discord", name: "Discord" })
  if (process.env.EMAIL_SIGNIN_ENABLED === "true")
    emailProvider.push({ id: "email", name: "Email" })

  const providers = {
    email: emailProvider,
    oauth: oauthProviders,
  }
  return {
    props: {
      title,
      metadata,
      description,
      showLoginSection,
      closeSignUp,
      FAQ,
      pageContext,
      providers,
      global: globalLocale.data,
    },
    revalidate: 300,
  }
}

export default LoginPage
