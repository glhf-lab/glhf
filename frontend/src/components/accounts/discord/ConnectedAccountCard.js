import { useState } from "react"
import Chip from "@/components/elements/chip"
import Button from "@/components/elements/button"
import { SiDiscord } from "react-icons/si"

const ConnectedAccountCard = ({ contents, user, mutateUser }) => {
  const [updating, setUpdating] = useState(false)
  const handleUnlink = async () => {
    setUpdating(true)
    await fetch(`/api/discord/user/unlink`)
    setUpdating(false)
    mutateUser({ ...user, steamLinked: false })
  }
  const { title, description, chip } = contents
  return (
    <div className="space-y-4 px-6 py-4 dark:text-gray-100">
      <div className="flex flex-row items-center justify-between gap-x-2">
        <div className="mb-2 flex flex-row items-center text-xl font-bold">
          <SiDiscord className="mr-2 h-4 w-4" aria-hidden />
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
      <Chip success={true} outlined>
        {chip}
      </Chip>
      <p className="text-base text-gray-700 dark:text-gray-100">
        {description}
      </p>
    </div>
  )
}

export default ConnectedAccountCard
