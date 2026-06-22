import { useState } from "react"
import { useRouter } from "next/router"
import VerifyRequestFeedback from "@/components/login/VerifyRequestFeedback"
import { Formik, Form, Field } from "formik"
import * as yup from "yup"
import isProlificEmail from "@/lib/isProlificEmail"
import { signIn } from "next-auth/react"
import { isDemoMode } from "src/utils/demo"

const EmailSchema = yup.object().shape({
  email: yup.string().email().required(),
})
const ProlificIdSchema = yup.object().shape({
  email: yup
    .string()
    .required()
    .matches(/^[a-f\d]{24}@email\.prolific\.co$/, "Not a valid Prolific email")
    .min(42, "Not a valid Prolific email")
    .max(42, "Not a valid Prolific email"),
})

const EmailSignInForm = ({ prolificId }) => {
  const [loading, setLoading] = useState(false)
  const [verifyRequest, setVerifyRequest] = useState(false)
  const router = useRouter()

  return (
    <>
      {verifyRequest && <VerifyRequestFeedback verify={verifyRequest} />}
      <Formik
        initialValues={{
          email: prolificId ? `${prolificId}@email.prolific.co` : "",
        }}
        enableReinitialize={true}
        validationSchema={prolificId ? ProlificIdSchema : EmailSchema}
        onSubmit={async (values, { setSubmitting, setErrors }) => {
          setLoading(true)

          try {
            setErrors({ api: null })
            const res = await signIn("email", {
              callbackUrl: "/profile",
              email: values.email,
              redirect: false,
            })
            // No verification email in the demo
            if (isDemoMode) {
              router.push("/profile")
              setLoading(false)
              setSubmitting(false)
              return
            }
            if (res?.error) {
              setErrors({ api: "Error: Email could not be sent" })
              setVerifyRequest(false)
            } else {
              if (isProlificEmail(values.email)) {
                router.push(
                  `/login?verify=prolific&identifier=${values.email}#sign-up`
                )
              } else {
                setVerifyRequest(true)
              }
            }
          } catch (err) {
            console.log("err", err)
            setErrors({ api: "Something went wrong" })
            setVerifyRequest(false)
          }
          setLoading(false)
          setSubmitting(false)
        }}
      >
        {({ values, errors, touched, isSubmitting }) => {
          return (
            <div>
              <Form className="flex flex-col items-center gap-4">
                <Field
                  className="form-control m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-4 py-2 text-xl font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none focus:ring-4 disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500 disabled:shadow-none dark:bg-slate-800 dark:text-gray-100"
                  type="email"
                  name="email"
                  value={values.email}
                  placeholder={
                    prolificId ? "Enter your Prolific ID" : "Enter your email"
                  }
                  disabled={verifyRequest}
                  aria-label={prolificId ? "prolific id" : "email"}
                  aria-describedby={
                    touched.email && errors.email ? "error" : null
                  }
                  aria-invalid={touched.email && errors.email ? true : null}
                />
                <button
                  type="submit"
                  className="focus-visible:btn-focus dark:focus-visible:btn-focus-dark disabled mb-3 flex w-full items-center justify-center rounded border-2 border-transparent bg-blue-700 px-7 py-3 text-sm font-medium uppercase leading-snug text-white ring-blue-800 transition-all duration-150 enabled:hover:bg-blue-600 enabled:hover:ring-2 enabled:active:shadow-lg disabled:bg-slate-500"
                  disabled={isSubmitting || verifyRequest}
                >
                  {loading
                    ? "Sending..."
                    : prolificId
                      ? "Continue with Prolific"
                      : "Continue with email"}
                </button>
              </Form>
              {((errors.email && touched.email) || errors.api) && (
                <p
                  id="error"
                  className="ml-2 mt-1 h-5 text-left text-sm text-red-500"
                >
                  {(errors.email && touched.email && errors.email) ||
                    errors.api}
                </p>
              )}
            </div>
          )
        }}
      </Formik>
    </>
  )
}
export default EmailSignInForm
