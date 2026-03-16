import Markdown from "react-markdown"
import classNames from "classnames"
import { MdClose } from "react-icons/md"

const NotificationBanner = ({ data: { text } }) => {
  const type = "info"
  return (
    <div
      role="banner"
      className={classNames(
        // Common classes
        "px-2 py-2 text-center text-white",
        {
          // Apply theme based on notification type
          "border-b-2 border-slate-700 bg-slate-900 dark:border-slate-800 dark:bg-zinc-900":
            type === "info",
          "bg-orange-600": type === "warning",
          "bg-red-600": type === "alert",
        }
      )}
    >
      <div className="container flex flex-row items-center justify-between ">
        <div className="rich-text-banner flex-1">
          <Markdown>{text}</Markdown>
        </div>
      </div>
    </div>
  )
}

export default NotificationBanner
