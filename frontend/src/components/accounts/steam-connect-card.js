import { useUser } from "src/utils/hooks"
import ConnectedAccountCard from "./steam/ConnectedAccountCard"
import NotConnectedAccountCard from "./steam/NotConnectedAccountCard"

const SteamCard = ({ activationDate, data }) => {
  const { user, mutateUser } = useUser()
  const { steamHasRecentPlayedGames, steamHasOwnedGames, steamActivated } = user
  const { notConnected, connectedSuccess, connectedFail } = data
  return (
    <div className="mb-2 h-full overflow-hidden rounded bg-white shadow-lg dark:border-2 dark:border-zinc-700 dark:bg-zinc-900">
      {user?.steamLinked ? (
        <ConnectedAccountCard
          activated={steamActivated}
          contents={steamActivated ? connectedSuccess : connectedFail}
          user={user}
          mutateUser={mutateUser}
        />
      ) : (
        <NotConnectedAccountCard contents={notConnected} />
      )}
    </div>
  )
}

export default SteamCard
