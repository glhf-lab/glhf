import ButtonLink from "@/components/elements/button-link"
import { FaSteam } from "react-icons/fa"
import Link from "next/link"
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
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/api/steam/login"
          className="focus-visible:btn-focus dark:focus-visible:btn-focus-dark mb-3 flex w-full items-center justify-center rounded border-2 border-blue-800 bg-blue-600 px-7 py-3 font-medium  leading-snug text-white ring-slate-500 transition-all duration-150 hover:ring-2 focus:shadow-lg active:shadow-lg "
        >
          <FaSteam className="mr-4 h-6 w-6" aria-hidden />
          {buttonLabelNotConnected}
        </a>
      </div>
    </div>
  )
}

export default NotConnectedAccountCard
