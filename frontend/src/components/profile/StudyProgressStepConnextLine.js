import classNames from "classnames"

const StudyProgressStepConnectLine = ({ progress, index }) => {
  const inactive = progress < index
  const active = progress == index
  const complete = progress > index
  return (
    <div
      className={classNames(
        "absolute left-[50%] top-[1.5rem] z-0 w-full border-t-2",
        { "border-slate-900 dark:border-slate-100": complete || active },
        {
          "border-dotted border-gray-300": inactive,
        }
      )}
    />
  )
}
export default StudyProgressStepConnectLine
