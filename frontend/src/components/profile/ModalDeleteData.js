import { useEffect, useState } from "react"
import Button from "@/components/elements/button"
import Modal from "react-modal"
import { useUser } from "src/utils/hooks"
import RichText from "../sections/rich-text"
import { isDemoMode } from "src/utils/demo"
import { MdClose } from "react-icons/md"
import { AiOutlineStop } from "react-icons/ai"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })
const ModalDeleteData = ({
  deleteDataButtonLabel,
  deleteDataModalHeader,
  deleteDataModal,
  deleteDataModalButtonCancelLabel,
  deleteDataModalButtonDeleteLabel,
}) => {
  const [modalIsOpen, setIsOpen] = useState(false)
  const { user, mutateUser } = useUser()
  const [updating, setUpdating] = useState(false)
  useEffect(() => {
    Modal.setAppElement("body")
  }, [])
  const handleSubmitDataDeletionRequest = async () => {
    if (isDemoMode) return
    setUpdating(true)
    try {
      const res = await fetch("/api/user/data-deletion-request", {
        method: "PUT",
      })
      if (!res.ok) {
        throw await res.json()
      }
      mutateUser()
      setUpdating(false)
      setIsOpen(false)
    } catch (error) {
      setUpdating(false)
      console.log("Error updating consent")
    }
  }
  const closeModal = () => {
    setIsOpen(false)
  }
  return (
    <>
      <Button
        handleClick={() => setIsOpen(true)}
        button={{
          text: deleteDataButtonLabel,
        }}
        appearance={"dark-outline-warn"}
      />
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel={deleteDataModalHeader}
        className={`z-50 flex w-full items-center justify-center overflow-x-hidden p-4 md:inset-0 md:h-full ${inter.className}`}
        overlayClassName="bg-gray-900 bg-opacity-50 dark:bg-opacity-80 flex fixed inset-0 z-40"
      >
        <div className="relative flex max-h-[calc(100%-2rem)] w-full max-w-2xl flex-col overflow-y-auto rounded-lg bg-white shadow md:h-auto dark:bg-slate-800">
          <div className="flex items-center justify-between rounded-t border-b px-6 py-4 dark:border-slate-700">
            <div>
              <AiOutlineStop
                className="h-9 w-9 pr-2 text-red-600"
                aria-hidden
              />
            </div>
            <h3 className="flex items-center text-xl font-semibold text-gray-900 dark:text-white">
              {deleteDataModalHeader}
            </h3>
            <div className="flex">
              <Button
                handleClick={() => setIsOpen(false)}
                ariaLabel="close"
                button={{
                  text: <MdClose className="h-6 w-6" aria-hidden />,
                }}
                icon
              />
            </div>
          </div>
          <div className="space-y-6 overflow-y-auto p-6">
            <RichText data={{ content: deleteDataModal }} compact />
          </div>
          <div className="flex flex-col items-center gap-y-6 rounded-b border-t border-gray-200 p-6 sm:flex-row sm:justify-end sm:gap-x-2 sm:gap-y-2 dark:border-slate-700">
            <Button
              handleClick={() => setIsOpen(false)}
              compact
              button={{
                text: deleteDataModalButtonCancelLabel,
              }}
              appearance={"dark-outline"}
            />
            <Button
              handleClick={handleSubmitDataDeletionRequest}
              compact
              button={{
                text: deleteDataModalButtonDeleteLabel,
              }}
              appearance={"dark-outline-warn"}
              disabled={updating || isDemoMode}
            />
          </div>
          {isDemoMode && (
            <p className="px-6 pb-4 text-right text-sm text-slate-500 dark:text-slate-400">
              Not available in the demo
            </p>
          )}
        </div>
      </Modal>
    </>
  )
}

export default ModalDeleteData
