import { useState } from "react"
import { useSWRConfig } from "swr"
import Button from "@/components/elements/button"

const RecheckSteamButton = ({ contents, activated }) => {
  const { buttonLabelRecheck } = contents
  const { mutate } = useSWRConfig()
  const [updating, setUpdating] = useState(false)

  const handleRecheckSteamPrivacy = async () => {
    setUpdating(true)
    const res = await fetch(`/api/steam/user/check`)
    setUpdating(false)
    mutate("/api/user/profile")
  }
  return (
    <>
      <div className="flex justify-center">
        <Button
          handleClick={handleRecheckSteamPrivacy}
          button={{
            text: updating ? "Updating" : buttonLabelRecheck,
            type: "primary",
          }}
          className="relative inline-block"
          appearance={"warning"}
          disabled={activated === true}
        />
      </div>
    </>
  )
}
export default RecheckSteamButton
