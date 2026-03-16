import PropTypes from "prop-types"
import { linkPropTypes, mediaPropTypes } from "src/utils/types"
import NextImage from "./image"
import CustomLink from "./custom-link"

const Footer = ({ footer, studyName }) => {
  return (
    <footer className="bg-zinc-900 pt-12 text-white">
      <div className="container flex flex-col lg:flex-row lg:justify-between">
        <div>
          <div className="group flex flex-col text-3xl font-extrabold text-white">
            {studyName || "GLHF"}
          </div>
          <div className="py-4 text-sm">
            {studyName || "GLHF"} is a research project and is not affiliated
            with Steam or Discord.
          </div>
        </div>
        <nav
          className="mb-10 flex flex-row flex-wrap items-start lg:justify-end lg:gap-20"
          aria-label="Footer"
        >
          {footer.columns.map((footerColumn) => (
            <div
              key={footerColumn.id}
              className="mt-10 w-6/12 lg:mt-0 lg:w-auto"
            >
              <p className="font-semibold uppercase tracking-wide">
                {footerColumn.title}
              </p>
              <ul className="mt-2">
                {footerColumn.links.map((link) => (
                  <li
                    key={link.id}
                    className="-mx-1 flex min-h-[3rem] items-center px-1 py-1 text-gray-100 hover:text-slate-400"
                  >
                    <CustomLink link={link} classes="flex ">
                      {link.text}
                    </CustomLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </div>
      <div className="bg-zinc-900 py-6 text-sm text-white">
        <div className="container">{footer.smallText}</div>
      </div>
    </footer>
  )
}

Footer.propTypes = {
  footer: PropTypes.shape({
    columns: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
          .isRequired,
        title: PropTypes.string.isRequired,
        links: PropTypes.arrayOf(linkPropTypes),
      })
    ),
    smallText: PropTypes.string.isRequired,
  }),
  studyName: PropTypes.string,
}

export default Footer
