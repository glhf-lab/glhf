import { useState } from "react"
import PropTypes from "prop-types"
import Markdown from "react-markdown"
import Image from "next/image"
import classNames from "classnames"
import { getStrapiMedia } from "src/utils/media"

const ImageComponent = ({ node, ...props }) => {
  const [isLoading, setLoading] = useState(true)
  const substrings = props.alt?.split("{{")
  const alt = substrings[0].trim()
  const width = substrings[1] && substrings[1].match(/w:\s?(\d+)/)[1]
  const height = substrings[1] && substrings[1].match(/h:\s?(\d+)/)[1]
  return (
    <Image
      src={getStrapiMedia(props.src)}
      alt={alt}
      width={width || 700}
      height={height || 394}
      className={classNames(
        "duration-500 ease-in-out",
        {
          "animate-pulse bg-zinc-400 blur-lg dark:bg-zinc-700": isLoading,
        },
        { "blur-0": !isLoading }
      )}
      onLoad={() => setLoading(false)}
      sizes="(max-width: 768px) 100vw, 625px"
    />
  )
}

const RichText = ({ data, compact }) => {
  return (
    <div
      className={classNames(
        { "container prose prose-lg py-12 dark:prose-invert": !compact },
        { "prose prose-lg pb-2 dark:prose-invert": compact }
      )}
    >
      <Markdown
        components={{
          img: ImageComponent,
        }}
      >
        {data.content}
      </Markdown>
    </div>
  )
}

RichText.propTypes = {
  data: PropTypes.shape({
    content: PropTypes.string,
  }),
}

export default RichText
