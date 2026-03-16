import Link from "next/link"
import PropTypes from "prop-types"
import { linkPropTypes } from "src/utils/types"

const CustomLink = ({ link, children, forceExternal, current, classes }) => {
  const isInternalLink = link.url.startsWith("/")
  // For internal links, use the Next.js Link component
  if (isInternalLink && !forceExternal) {
    return (
      <Link
        href={link.url}
        aria-current={current && "page"}
        className={classes}
      >
        {children}
      </Link>
    )
  }

  // Plain <a> tags for external links
  if (link.newTab) {
    return (
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className={classes}
      >
        {children}
      </a>
    )
  }

  return (
    <a href={link.url} target="_self" className={classes}>
      {children}
    </a>
  )
}

CustomLink.propTypes = {
  link: linkPropTypes,
  children: PropTypes.oneOfType([
    PropTypes.arrayOf(PropTypes.node),
    PropTypes.node,
  ]).isRequired,
}

export default CustomLink
