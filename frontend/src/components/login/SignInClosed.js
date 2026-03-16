const SignInClosed = ({ description }) => {
  return (
    <div
      className="text mb-4 rounded-lg border-2 border-blue-200 bg-blue-100 p-4 text-blue-700 dark:bg-blue-200 dark:text-blue-800"
      role="alert"
    >
      <span className="font-bold">Sign up closed.</span> {description}
    </div>
  )
}

export default SignInClosed
