import { useTheme } from "next-themes"
import { useState, useEffect } from "react"
import { MoonIcon, SunIcon } from "@heroicons/react/24/solid"

const ThemeToggler = () => {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  //useEffect(() => setMounted(true), [])
  //if (!mounted) return null
  return (
    <button
      className="focus-visible:btn-focus dark:focus-visible:btn-focus-dark flex w-full items-center justify-center rounded-lg border-2 bg-gray-100 px-2 py-2 text-base font-semibold tracking-wide text-zinc-700 transition-all duration-150  hover:border-zinc-600 md:text-sm  lg:w-auto dark:border-zinc-600 dark:bg-zinc-700 dark:text-zinc-200 hover:dark:border-zinc-500"
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      aria-label="Toggle Dark Mode"
    >
      {theme === "light" ? (
        <MoonIcon className="h-6 w-6" />
      ) : (
        <SunIcon className="h-6 w-6" />
      )}
    </button>
  )
}

export default ThemeToggler
