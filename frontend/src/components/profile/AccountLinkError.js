import { useRouter } from "next/router"
const providers = {
  steam: "Steam",
  discord: "Discord",
}
const errorMessages = {
  accountAlreadyConnectedToOtherUser:
    "Account already connected to another user.",
  discordServerLimit:
    "You have reached the Discord server limit. Please leave a server to connect your Discord account.",
  steamHttp429: "Steam servers are busy. Please try again later.",
}
const AccountLinkError = ({ error }) => {
  const router = useRouter()
  const { provider } = router.query
  console.log({ error })
  const errorMessage = errorMessages[error] || "Unknown error."

  const providerLabel = `Unable to connect ${providers[provider]} account.`
  return (
    <div
      className="text mb-4 rounded-lg border-2 border-red-200 bg-red-100 p-4 text-red-700 dark:border-red-800 dark:bg-red-200 dark:text-red-800"
      role="alert"
    >
      <span className="font-bold">{providerLabel}</span> {errorMessage}
    </div>
  )
}
export default AccountLinkError
