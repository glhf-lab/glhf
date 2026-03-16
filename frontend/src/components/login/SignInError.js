// nextAuth default error messages
// api/auth/signin?error=<key>
const nextAuthErrorMessages = {
  Signin: "Try signing in with a different account.",
  OAuthSignin: "Try signing with a different account.",
  OAuthCallback: "Try signing with a different account.",
  OAuthCreateAccount: "Try signing with a different account.",
  EmailCreateAccount: "Try signing with a different account.",
  Callback: "Try signing with a different account.",
  // this is modified
  OAuthAccountNotLinked:
    "Please sign in with the same account you used originally, or sign in using the email option.",
  EmailSignin: "The e-mail could not be sent.",
  Verification: "The link has expired or has already been used",
  CredentialsSignin:
    "Sign in failed. Check the details you provided are correct.",
  SessionRequired: "Session expired",
  default: "Something went wrong.",
}
const SignInError = ({ error }) => {
  const errorMessage =
    error && (nextAuthErrorMessages[error] ?? nextAuthErrorMessages.default)
  return (
    <div
      className="text mb-4 rounded-lg border-2 border-red-200 bg-red-100 p-4 text-red-700 dark:bg-red-200 dark:text-red-800"
      role="alert"
    >
      <span className="font-bold">Unable to sign in.</span> {errorMessage}
    </div>
  )
}

export default SignInError
