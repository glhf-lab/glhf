import { Formik, Form, Field } from "formik"
import * as yup from "yup"

const TokenSchema = yup.object().shape({
  token: yup.string().required(),
})

const VerifyToken = ({ provider, identifier }) => {
  const isProlific = provider === "prolific"
  return (
    <>
      <div
        className="text mb-4 rounded-lg border-2 border-green-200 bg-green-100 p-4 text-green-700 dark:bg-green-200 dark:text-green-800"
        role="alert"
      >
        <span className="font-bold">Check your Prolific messages.</span> A sign
        in code has been sent to your Prolific inbox.
      </div>
      {isProlific && (
        <Formik
          initialValues={{
            token: "",
          }}
          enableReinitialize={true}
          validationSchema={TokenSchema}
          onSubmit={async (values, { setSubmitting, setErrors }) => {
            window.location.href = `/api/auth/callback/email?token=${values.token}&callbackUrl=/profile&email=${identifier}`
            return
          }}
        >
          {({ values, errors, touched, isSubmitting }) => {
            return (
              <div>
                <Form className="flex flex-col items-center gap-4">
                  <Field
                    className="form-control m-0 block w-full rounded border border-solid border-gray-300 bg-white bg-clip-padding px-4 py-2 text-xl font-normal text-gray-700 transition ease-in-out focus:border-blue-600 focus:bg-white focus:text-gray-700 focus:outline-none disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500 disabled:shadow-none dark:bg-slate-800 dark:text-gray-100 dark:placeholder-zinc-400"
                    type="text"
                    name="token"
                    value={values.token}
                    placeholder="Enter your code"
                    aria-label="enter code"
                    aria-describedby={
                      touched.token && errors.token ? "error" : null
                    }
                    aria-invalid={touched.token && errors.token ? true : null}
                  />
                  <button
                    type="submit"
                    className="disabled mb-3 flex w-full items-center justify-center rounded bg-blue-700 px-7 py-3 text-sm font-medium uppercase leading-snug text-white ring-blue-800 transition-all duration-150 focus:shadow-lg focus:outline-none focus:ring-0 enabled:hover:bg-blue-600 enabled:hover:ring-2 enabled:active:shadow-lg disabled:bg-slate-500"
                  >
                    Continue
                  </button>
                </Form>
                {((errors.token && touched.token) || errors.api) && (
                  <p
                    id="error"
                    className="ml-2 mt-1 h-5 text-left text-sm text-red-500"
                  >
                    {(errors.token && touched.token && errors.token) ||
                      errors.api}
                  </p>
                )}
              </div>
            )
          }}
        </Formik>
      )}
    </>
  )
}

export default VerifyToken
