import { useState } from "react"
import Chip from "@/components/elements/chip"
import Button from "@/components/elements/button"
import ActivationDetails from "./ActivationDetails"
import { FaSteam } from "react-icons/fa"
import Markdown from "react-markdown"

const ConnectedAccountCard = ({ activated, contents, user, mutateUser }) => {
  const [updating, setUpdating] = useState(false)
  const handleUnlink = async () => {
    setUpdating(true)
    await fetch(`/api/steam/user/unlink`)
    setUpdating(false)
    mutateUser({ ...user, steamLinked: false })
  }
  const { title, description, chip } = contents
  return (
    <div className="space-y-4 px-6 py-4 dark:text-gray-100">
      <div className="flex flex-row items-center justify-between gap-x-2">
        <div className="mb-2 flex flex-row items-center text-xl font-bold">
          <FaSteam className="mr-2 h-4 w-4" aria-hidden />
          {title}
        </div>
        <div className="">
          <Button
            handleClick={handleUnlink}
            compact
            button={{
              text: updating ? "Loading" : "Unlink",
            }}
            appearance="dark-outline"
            smallText
            disabled={updating}
          />
        </div>
      </div>
      {activated ? (
        <>
          <Chip success={true} outlined>
            {chip}
          </Chip>
          <div className="prose text-gray-700 dark:text-gray-100 dark:prose-invert">
            <Markdown>{description}</Markdown>
          </div>
        </>
      ) : (
        <>
          <Chip success={false} outlined>
            {chip}
          </Chip>
          <div className="prose text-gray-700 dark:text-gray-100 dark:prose-invert">
            <Markdown>{description}</Markdown>
          </div>
          <ActivationDetails contents={contents} user={user} />
        </>
      )}
    </div>
  )
}

export default ConnectedAccountCard
