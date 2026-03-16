import { useUser } from "src/utils/hooks"
import ConnectedAccountCard from "./discord/ConnectedAccountCard"
import NotConnectedAccountCard from "./discord/NotConnectedAccountCard"

const DiscordCard = ({ activationDate, data }) => {
  const { user, mutateUser } = useUser()
  const { notConnected, connectedSuccess, connectedFail } = data
  return (
    <div className="mb-2 h-full overflow-hidden rounded bg-white shadow-lg dark:border-2 dark:border-zinc-700 dark:bg-zinc-900">
      {user.discordLinked ? (
        <ConnectedAccountCard
          contents={true ? connectedSuccess : connectedFail}
          user={user}
          mutateUser={mutateUser}
        />
      ) : (
        <NotConnectedAccountCard contents={notConnected} />
      )}
    </div>
  )
}

export default DiscordCard
