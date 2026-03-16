import Link from "next/link"
import { signOut } from "next-auth/react"

const SignedInSection = ({ email }) => {
  return (
    <div className="w-full">
      <div className="prose py-4 dark:prose-invert">
        <h2>Already signed in</h2>
        <p>
          <Link href="/profile">Go to your profile</Link>
        </p>
        <button
          onClick={() => signOut()}
          className="focus-visible:btn-focus dark:focus-visible:btn-focus-dark mb-3 flex w-full items-center justify-center rounded border-2 border-slate-300 bg-slate-200 px-7 py-3 text-sm font-medium uppercase leading-snug text-black ring-slate-500 transition-all duration-150 hover:bg-slate-300 hover:ring-2 focus:shadow-lg focus:outline-none focus:ring-0 active:shadow-lg"
        >
          <span className="flex-none">Sign out</span>{" "}
          <span className="ml-2 truncate lowercase">({email}</span>)
        </button>
      </div>
    </div>
  )
}
export default SignedInSection
