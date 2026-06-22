import { signIn } from "next-auth/react"
import { SiDiscord } from "react-icons/si"
import { isDemoMode } from "src/utils/demo"

const NotConnectedAccountCard = ({ contents }) => {
  const {
    titleNotConnected,
    descriptionNotConnected,
    buttonLabelNotConnected,
  } = contents

  return (
    <div className="px-6 py-4">
      <div className="mb-2 text-xl font-bold dark:text-gray-100">
        {titleNotConnected}
      </div>
      <p className="text-base text-gray-700 dark:text-gray-100">
        {descriptionNotConnected}
      </p>

      <div className="mt-4 flex w-full justify-center">
        <button
          onClick={
            isDemoMode
              ? undefined
              : () => signIn("discord-link", { scope: "identify guilds.join" })
          }
          disabled={isDemoMode}
          title={
            isDemoMode
              ? "Account linking is not available in the demo"
              : undefined
          }
          className={
            isDemoMode
              ? "mb-3 flex w-full cursor-not-allowed items-center justify-center rounded border-2 border-slate-300 bg-slate-200 px-7 py-3 font-medium leading-snug text-slate-500 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-500"
              : "focus-visible:btn-focus dark:focus-visible:btn-focus-dark mb-3 flex w-full items-center justify-center rounded border-2 border-blue-800 bg-blue-600 px-7 py-3 font-medium  leading-snug text-white ring-slate-500 transition-all duration-150 hover:ring-2 focus:shadow-lg active:shadow-lg "
          }
        >
          <SiDiscord className="mr-4 h-6 w-6" aria-hidden />
          {buttonLabelNotConnected}
        </button>
      </div>
      {isDemoMode && (
        <p className="mt-1 text-center text-sm text-slate-500 dark:text-slate-400">
          Not available in the demo
        </p>
      )}
    </div>
  )
}

export default NotConnectedAccountCard
