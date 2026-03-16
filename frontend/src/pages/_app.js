import App from "next/app"
import Head from "next/head"
import ErrorPage from "next/error"
import { DefaultSeo } from "next-seo"
import { getStrapiMedia } from "src/utils/media"
import "@/styles/index.css"
import { SessionProvider } from "next-auth/react"
import { ThemeProvider } from "next-themes"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })
const SkipLink = () => {
  return (
    <a
      href="#main-content"
      className="fixed -top-20 left-2 z-50 m-4 block p-3 transition-all duration-300 ease-in-out focus:top-3"
    >
      Skip to main content
    </a>
  )
}

const MyApp = ({ Component, pageProps }) => {
  // Extract the data we need
  const { global } = pageProps
  if (global == null) {
    return <ErrorPage statusCode={404} />
  }

  const { metadata, metaTitleSuffix } = global.attributes

  return (
    <>
      {/* Favicon */}
      <Head>
        <link rel="shortcut icon" href="/favicons/favicon.ico" />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/favicons/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicons/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicons/favicon-16x16.png"
        />
        <link rel="manifest" href="/favicons/site.webmanifest" />
      </Head>
      {/* Global site metadata */}
      <DefaultSeo
        titleTemplate={`%s | ${metaTitleSuffix}`}
        defaultTitle={metaTitleSuffix}
        description={metadata.metaDescription}
        openGraph={{
          images: Object.values(
            metadata.shareImage.data.attributes.formats
          ).map((image) => {
            return {
              url: getStrapiMedia(image.url),
              width: image.width,
              height: image.height,
            }
          }),
        }}
        twitter={{
          cardType: metadata.twitterCardType,
          handle: metadata.twitterUsername,
        }}
      />
      {/* Display the content */}
      <ThemeProvider enableSystem={true} attribute="class">
        <SessionProvider session={pageProps.session} refetchInterval={0}>
          <div className={inter.className}>
            <SkipLink color="secondary" href="#main-content">
              Skip to contents
            </SkipLink>
            <Component {...pageProps} />
          </div>
        </SessionProvider>
      </ThemeProvider>
    </>
  )
}

export default MyApp
