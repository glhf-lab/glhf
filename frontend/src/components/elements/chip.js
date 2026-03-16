import classNames from "classnames"
import { CheckIcon, NoSymbolIcon } from "@heroicons/react/24/outline"

const Chip = ({ children, success, outlined }) => {
  return (
    <span
      className={classNames(
        "align-center flex w-max flex-row items-center rounded-full px-4 py-2 text-sm font-semibold ",
        { " bg-red-500 ": success === false && !outlined },
        {
          " border-2 border-red-500 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-100":
            success === false && outlined,
        },
        { " bg-green-500 ": success === true && !outlined },
        {
          " border-2 border-green-500 bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-200":
            success === true && outlined,
        }
      )}
    >
      {success ? (
        <CheckIcon className="h-5 w-5 stroke-[3px]" />
      ) : (
        <NoSymbolIcon className="h-5 w-5" />
      )}
      {children && (
        <span className="ml-2 mt-px w-full font-semibold">{children}</span>
      )}
    </span>
  )
}

export default Chip
