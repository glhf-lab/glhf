import classNames from "classnames"
import StudyProgressStepConnectLine from "./StudyProgressStepConnextLine"

const StudyProgressStepItem = ({
  children,
  icon,
  progress,
  index,
  error,
  connect,
}) => {
  const inactive = progress < index
  const active = progress == index
  const complete = progress > index
  return (
    <div
      className={classNames(
        "relative flex flex-1 flex-col items-center text-primary-600",
        {
          "text-gray-500": inactive,
        }
      )}
    >
      {connect && (
        <StudyProgressStepConnectLine progress={progress} index={index + 1} />
      )}

      <div
        className={classNames(
          "z-10 flex h-12 w-12 rounded-full border-2 py-3",
          {
            "border-blue-600 bg-white text-blue-600 dark:border-sky-500 dark:bg-black dark:text-sky-500":
              active && !error,
          },
          {
            "border-slate-900 bg-slate-900 text-white dark:bg-slate-100 dark:text-black":
              complete,
          },
          {
            "border-2 !border-red-500 bg-red-100 text-red-600 dark:bg-red-900 dark:text-red-100":
              error,
          },
          {
            "border-dotted border-gray-300 bg-white text-gray-400 dark:bg-black dark:text-stone-50":
              inactive,
          }
        )}
      >
        {icon}
      </div>

      <div
        className={classNames(
          "flex text-center text-xs font-medium sm:text-base",
          {
            "font-extrabold text-blue-600 dark:text-sky-500": active && !error,
          },
          { "text-slate-900 dark:text-slate-100": complete },
          { "text-gray-500 dark:text-stone-50": inactive },
          { "text-red-500 dark:text-stone-50": error }
        )}
      >
        {children}
      </div>
    </div>
  )
}

export default StudyProgressStepItem
