import { CheckCircleIcon, NoSymbolIcon } from "@heroicons/react/24/outline"
import RecheckSteamButton from "./RecheckSteamButton"

const ActivationDetails = ({ contents, activationDate, user }) => {
  const {
    feedbackFoundRecentlyPlayedGames,
    feedbackNoRecentlyPlayedGames,
    feedbackFoundOwnedGames,
    feedbackNoOwnedGames,
    feedbackHasPlaytimePublic,
    feedbackHasPlaytimePrivate,
  } = contents
  const { activated } = user
  return (
    <div className="space-y-2">
      <RecheckSteamButton contents={contents} activated={activated} />
      <ul className="space-y-2">
        <li>
          <div className="flex flex-row items-center">
            {feedbackNoRecentlyPlayedGames !== null &&
              (user.steamHasRecentPlayedGames ? (
                <>
                  <CheckCircleIcon className="mr-2 h-5 w-5 text-green-600" />{" "}
                  <span>{feedbackFoundRecentlyPlayedGames}</span>
                </>
              ) : (
                <>
                  <NoSymbolIcon className="mr-2 h-5 w-5 text-red-600" />{" "}
                  <span>{feedbackNoRecentlyPlayedGames}</span>
                </>
              ))}
          </div>
        </li>
        <li>
          <div className="flex">
            {feedbackNoOwnedGames !== null &&
              (user.steamHasOwnedGames ? (
                <>
                  <CheckCircleIcon className="mr-2 h-5 w-5 text-green-600" />{" "}
                  <span>{feedbackFoundOwnedGames}</span>
                </>
              ) : (
                <>
                  <NoSymbolIcon className="mr-2 h-5 w-5 text-red-600" />{" "}
                  <span>{feedbackNoOwnedGames}</span>
                </>
              ))}
          </div>
        </li>
        <li>
          <div className="flex">
            {feedbackHasPlaytimePrivate !== null &&
              (user.steamHasPlaytimePublic ? (
                <>
                  <CheckCircleIcon className="mr-2 h-5 w-5 text-green-600" />{" "}
                  <span>{feedbackHasPlaytimePublic}</span>
                </>
              ) : (
                <>
                  <NoSymbolIcon className="mr-2 h-5 w-5 text-red-600" />{" "}
                  <span>{feedbackHasPlaytimePrivate}</span>
                </>
              ))}
          </div>
        </li>
      </ul>
    </div>
  )
}
export default ActivationDetails
