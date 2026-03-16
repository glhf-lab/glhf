import classNames from "classnames"
import PropTypes from "prop-types"
import { buttonLinkPropTypes } from "src/utils/types"
import CustomLink from "./custom-link"

const ButtonLink = ({
  button,
  appearance,
  compact = false,
  forceExternal = false,
}) => {
  const { text } = button
  return (
    <CustomLink
      link={button}
      forceExternal={forceExternal}
      classes={classNames(
        // Common classes
        "focus-visible:btn-focus focus-visible:dark:btn-focus-dark block w-full justify-center rounded-md border-2 text-center text-base font-semibold tracking-wide lg:w-auto",
        // Full-size button
        {
          "px-8 py-4": compact === false,
        },
        // Compact button
        {
          "px-6 py-2": compact === true,
        },
        // Specific to when the button is fully dark
        {
          "dark:border-black bg-slate-900 border-slate-900 text-white shadow-xl dark:border-white dark:bg-white dark:text-black":
            appearance === "dark",
        },
        // Specific to when the button is dark outlines
        {
          "border-gray-100 bg-white text-black hover:border-gray-400 dark:border-white dark:bg-black dark:bg-none dark:text-white":
            appearance === "dark-outline",
        },
        // Specific to when the button is fully white
        {
          "border-white bg-white text-primary-600 dark:text-black":
            appearance === "white",
        },
        // Specific to when the button is white outlines
        {
          "border-white text-white": appearance === "white-outline",
        }
      )}
    >
      {text}
    </CustomLink>
  )
}

ButtonLink.propTypes = {
  button: buttonLinkPropTypes,
  appearance: PropTypes.oneOf([
    "dark",
    "white-outline",
    "white",
    "dark-outline",
  ]),
  compact: PropTypes.bool,
}

export default ButtonLink
