import { useState } from "react"
import RichText from "../sections/rich-text"
import { useUser } from "src/utils/hooks"
const InformedConsent = ({ content }) => {
  const { user, mutateUser } = useUser()
  const [loading, setLoading] = useState(false)
  const [consentChecked, setChecked] = useState(false)
  const handleSubmitConsent = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch("/api/user/consent", {
        method: "PUT",
      })
      if (!res.ok) {
        throw await res.json()
      }
      mutateUser({ ...user, consentedToResearch: true })
      document
        .getElementById("main-content")
        .scrollIntoView({ behavior: "smooth" })
    } catch (error) {
      console.log("Error updating consent")
    }
  }

  return (
    <>
      <RichText data={{ content }} />
      <div className="container prose prose-lg dark:prose-invert">
        <form onSubmit={handleSubmitConsent}>
          <div className="mb-4 flex items-center">
            <input
              id="consent-checkbox"
              type="checkbox"
              required
              checked={consentChecked}
              onChange={() => setChecked((prev) => !prev)}
              value=""
              className="focus-visible:btn-focus focus-visible:dark:btn-focus-dark h-5 w-5 rounded border-gray-300 bg-gray-100 focus-visible:accent-highlight dark:border-gray-600 dark:bg-gray-700  "
            />
            <label
              htmlFor="consent-checkbox"
              className="ml-2 font-medium text-gray-900 dark:text-gray-300"
            >
              I consent to the research
            </label>
          </div>
          <button
            type="submit"
            className="focus-visible:btn-focus dark:focus-visible:btn-focus-dark disabled mb-3  flex w-full items-center justify-center rounded border-2 border-transparent bg-blue-700 px-7 py-3 text-sm font-medium uppercase leading-snug text-white ring-blue-800 transition-all duration-150 enabled:hover:bg-blue-600 enabled:hover:ring-2 enabled:active:shadow-lg disabled:cursor-not-allowed disabled:bg-slate-500"
            disabled={consentChecked === false || loading}
          >
            {loading ? "Submitting..." : "Continue"}
          </button>
        </form>
      </div>
    </>
  )
}

export default InformedConsent
