import StudyProgress from "@/components/profile/StudyProgress"
import Chip from "@/components/elements/chip"
import AccountLinkError from "@/components/profile/AccountLinkError"

const StudyStatus = ({
  progress,
  surveySendDate,
  content,
  user,
  accountLinkError,
  provider,
}) => {
  if (!content)
    return (
      <div className="text-red-500">
        Internal server error could not load content.
      </div>
    )
  return (
    <>
      {" "}
      {accountLinkError && (
        <AccountLinkError error={accountLinkError} provider={provider} />
      )}
      <h1 className="flex flex-row items-center gap-4 text-3xl">
        Study status
        {progress.index === 1 && (
          <Chip success={false} outlined>
            {" "}
            Steam privacy issue{" "}
          </Chip>
        )}
        {progress.index > 1 && progress.index < 4 && (
          <Chip success={true} outlined>
            {" "}
            Active{" "}
          </Chip>
        )}
        {progress.index === 4 && (
          <Chip success={true} outlined>
            {" "}
            Completed{" "}
          </Chip>
        )}
      </h1>
      <StudyProgress
        progress={progress}
        surveySendDate={surveySendDate}
        content={content}
        user={user}
      />
    </>
  )
}

export default StudyStatus
