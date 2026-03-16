import { useState } from "react"
import PropTypes from "prop-types"
import Link from "next/link"
import { useRouter } from "next/router"
import {
  mediaPropTypes,
  linkPropTypes,
  buttonLinkPropTypes,
} from "src/utils/types"
import { MdMenu } from "react-icons/md"
import CustomLink from "./custom-link"
import Logo from "./logo"
import { useUser } from "src/utils/hooks"
import { signOut } from "next-auth/react"
import ThemeToggler from "./theme-toggler"
import classNames from "classnames"
import { MdClose, MdChevronRight } from "react-icons/md"
import { getStrapiMedia } from "src/utils/media"

const NavLinkItem = ({ link }) => {
  const router = useRouter()

  const isCurrent = router.asPath === link.url
  return (
    <li
      className={classNames(
        "border-b py-6 last:border-0 md:border-0   dark:border-zinc-800",
        {
          "underline decoration-2 underline-offset-4": isCurrent,
        }
      )}
    >
      <CustomLink
        link={link}
        locale={router.locale}
        current={isCurrent}
        classes="flex flex-row items-center justify-between font-bold hover:text-blue-500"
      >
        {link.text}
        <MdChevronRight className="h-8 w-auto md:hidden" />
      </CustomLink>
    </li>
  )
}

const Navbar = ({ navbar, pageContext }) => {
  const [mobileMenuIsShown, setMobileMenuIsShown] = useState(false)
  const { user } = useUser()
  const { logo } = navbar
  const logoUrl = getStrapiMedia(logo?.logoImg?.data?.attributes?.url)
  return (
    <>
      {/* The actual navbar */}
      <nav className="border-b-2 border-gray-100 bg-white py-2 sm:px-4 dark:border-gray-900 dark:bg-black">
        <div className="container mx-auto flex flex-wrap items-center justify-between">
          <Logo
            imgUrl={logoUrl}
            textTop={logo?.textTop}
            textBottom={logo?.textBottom}
          />
          <button
            type="button"
            className="focus-visible:btn-focus dark:focus-visible:btn-focus-dark ml-3 inline-flex items-center rounded-lg border-2 border-transparent p-2 text-sm text-gray-500 hover:bg-gray-100  focus:ring-2 focus:ring-gray-200 md:hidden dark:text-gray-400 dark:hover:bg-gray-700 dark:focus:ring-gray-600"
            aria-controls="app-navbar"
            aria-expanded={mobileMenuIsShown}
            onClick={() => setMobileMenuIsShown(!mobileMenuIsShown)}
          >
            <span className="sr-only">Open main menu</span>
            {mobileMenuIsShown ? (
              <MdClose className="h-8 w-auto" />
            ) : (
              <MdMenu className="h-8 w-auto" />
            )}
          </button>
          <div
            className={classNames(
              "flex w-full flex-col gap-y-2 md:flex md:w-auto md:flex-row md:items-center md:gap-x-2",
              {
                hidden: mobileMenuIsShown === false,
              }
            )}
            id="app-navbar"
          >
            <ul
              className="md:text-md mt-4 flex flex-col rounded-lg border border-gray-100  bg-gray-50 
              p-4 text-lg md:mt-0 md:flex-row md:space-x-8
              md:border-0 md:bg-white md:font-medium dark:border-zinc-700 dark:bg-zinc-900 dark:text-white md:dark:bg-black"
            >
              {navbar.links.map((navLink) => (
                <NavLinkItem link={navLink} key={navLink.id} />
              ))}
              <li className="flex flex-row items-center justify-between gap-x-4 pt-6 md:pt-0">
                {/* Light/dark mode */}
                <div className="md:flex">
                  <ThemeToggler />
                </div>
                <div className="w-40 md:flex">
                  {/* CTA button */}
                  {navbar.button && (
                    <div className="w-40">
                      {!user?.isLoggedIn && (
                        <Link
                          className="focus-visible:btn-focus focus-visible:dark:btn-focus-dark block w-full justify-center rounded-md border-2 border-black bg-slate-900 px-6 py-2 text-center text-base font-semibold tracking-wide text-white transition-all duration-150 hover:border-gray-400 hover:bg-slate-800 dark:border-black dark:border-white dark:bg-white dark:text-black dark:hover:border-gray-400 dark:hover:bg-slate-100"
                          href="/login"
                        >
                          Sign in
                        </Link>
                      )}
                      {user?.isLoggedIn && (
                        <button
                          onClick={() => signOut({ callbackUrl: "/login" })}
                          className="focus-visible:btn-focus focus-visible:dark:btn-focus-dark block w-full justify-center rounded-md border-2 px-6 py-2 text-center text-base font-semibold tracking-wide transition-all duration-150 hover:border-gray-400 hover:bg-slate-100 dark:hover:border-gray-400 dark:hover:bg-slate-900"
                        >
                          Sign out
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </>
  )
}

Navbar.propTypes = {
  navbar: PropTypes.shape({
    logo: PropTypes.shape({
      logoImg: mediaPropTypes,
      textTop: PropTypes.string,
      textBottom: PropTypes.string,
    }),
    links: PropTypes.arrayOf(linkPropTypes),
    button: buttonLinkPropTypes,
  }),
  initialLocale: PropTypes.string,
}

export default Navbar
