import { useRouter } from "next/router"
import VerifyToken from "@/components/login/VerifyToken"
import EmailSignInForm from "@/components/login/EmailSignInForm"
import SignInError from "@/components/login/SignInError"
import { SiDiscord, SiGoogle } from "react-icons/si"
import { signIn } from "next-auth/react"
import SignInClosed from "./SignInClosed"

const signInIcons = {
  google: SiGoogle,
  discord: SiDiscord,
}

const SignInSection = ({ closeSignUp, providers, showLoginSection }) => {
  const router = useRouter()
  const {
    error: nextAuthError,
    PROLIFIC_PID,
    verify,
    identifier,
  } = router.query
  if (showLoginSection === false) return
  const { signUpEnabled, description: signUpDisabledDescription } = closeSignUp
  const showEmailSignIn = providers.email.length > 0
  const showOauthSignIn = providers.oauth.length > 0
  return (
    <div className="w-full">
      {signUpEnabled === true && (
        <div className="prose py-4 dark:prose-invert">
          <h2 id="sign-up">Sign up</h2>
        </div>
      )}
      {signUpEnabled === false && (
        <>
          <SignInClosed description={signUpDisabledDescription} />
          <div className="prose py-4 dark:prose-invert">
            <h2 id="sign-up">Sign in</h2>
          </div>
        </>
      )}
      {nextAuthError && <SignInError error={nextAuthError} />}
      {showEmailSignIn &&
        (verify === "prolific" && identifier ? (
          <VerifyToken provider={verify} identifier={identifier} />
        ) : (
          <EmailSignInForm prolificId={PROLIFIC_PID} />
        ))}
      {showEmailSignIn && showOauthSignIn && (
        <div className="my-4 flex items-center before:mt-0.5 before:flex-1 before:border-t before:border-gray-300 after:mt-0.5 after:flex-1 after:border-t after:border-gray-300">
          <p className="mx-4 mb-0 text-center font-semibold dark:text-white">
            OR
          </p>
        </div>
      )}
      <div>
        {providers.oauth.map((provider) => {
          const Icon = signInIcons[provider.id]
          return (
            <button
              key={provider.id}
              onClick={() =>
                signIn(provider.id, {
                  callbackUrl: "/profile",
                })
              }
              className="focus-visible:btn-focus dark:focus-visible:btn-focus-dark mb-3 flex w-full items-center justify-center rounded border-2 border-slate-300 bg-slate-200 px-7 py-3 text-sm font-medium uppercase leading-snug text-black ring-slate-500 transition-all duration-150 hover:bg-slate-300 hover:ring-2 focus:shadow-lg active:shadow-lg"
            >
              <Icon className="mr-4 h-4 w-4" aria-hidden />
              Continue with {provider.name}
            </button>
          )
        })}
      </div>
    </div>
  )
}

export default SignInSection
