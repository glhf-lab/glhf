import { useState } from "react"
import Button from "@/components/elements/button"
import { useUser } from "src/utils/hooks"
import RichText from "../sections/rich-text"
import ModalDeleteData from "./ModalDeleteData"

const DeleteAccount = ({ content }) => {
  const { user, mutateUser } = useUser()
  const [updating, setUpdating] = useState(false)
  const {
    header,
    withdrawHeader,
    withdrawDescription,
    withdrawButtonLabel,
    deleteDataHeader,
    deleteDataDescription,
    deleteDataButtonLabel,
    deleteDataModal,
    deleteDataModalHeader,
    deleteDataModalButtonCancelLabel,
    deleteDataModalButtonDeleteLabel,
  } = content
  const handleSubmitConsent = async () => {
    setUpdating(true)
    try {
      const res = await fetch("/api/user/consent", {
        method: "PUT",
      })
      if (!res.ok) {
        throw await res.json()
      }
      mutateUser({ ...user, steamLinked: false })
      setUpdating(false)
    } catch (error) {
      setUpdating(false)
      console.log("Error updating consent")
    }
  }

  return (
    <div>
      <h2>{header}</h2>
      {user?.consentedToResearch && (
        <>
          <h3>{withdrawHeader}</h3>
          <RichText data={{ content: withdrawDescription }} compact />
          <Button
            handleClick={handleSubmitConsent}
            button={{
              text: updating ? "Loading" : withdrawButtonLabel,
            }}
            appearance={"dark-outline-warn"}
            disabled={updating}
          />
        </>
      )}

      <h3>{deleteDataHeader}</h3>

      {user?.dataDeletionRequest ? (
        <div
          className="text mb-4 rounded-lg border-2 border-green-200 bg-green-100 p-4 text-green-700 dark:bg-green-200 dark:text-green-800"
          role="alert"
        >
          <span className="font-bold">Request submitted.</span> Your data
          deletion request is being processed.
        </div>
      ) : (
        <>
          <RichText data={{ content: deleteDataDescription }} compact />
          <ModalDeleteData
            deleteDataButtonLabel={deleteDataButtonLabel}
            deleteDataModalHeader={deleteDataModalHeader}
            deleteDataModal={deleteDataModal}
            deleteDataModalButtonCancelLabel={deleteDataModalButtonCancelLabel}
            deleteDataModalButtonDeleteLabel={deleteDataModalButtonDeleteLabel}
          />
        </>
      )}
    </div>
  )
}

export default DeleteAccount
