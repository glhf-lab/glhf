import { getStrapiMedia } from "src/utils/media"
import Image from "next/image"
import { useState } from "react"
import classNames from "classnames"

const Logo = ({ data }) => {
  const { logo, title } = data

  const [isLoading, setLoading] = useState(true)

  return (
    <div className="w-1/3 max-w-xs p-2 md:w-1/5">
      <Image
        src={getStrapiMedia(logo?.data?.attributes?.url)}
        width={logo?.data?.attributes?.width}
        height={logo?.data?.attributes?.height}
        sizes="(max-width: 768px) 33vw, 20vw"
        className={classNames(
          "m-h-full m-w-full duration-500 ease-in-out",
          {
            "scale-110 animate-pulse bg-zinc-400 blur-xl dark:bg-zinc-700":
              isLoading,
          },
          { "scale-100 blur-0 dark:invert": !isLoading }
        )}
        onLoad={() => setLoading(false)}
        alt={`${title} logo`}
      />
    </div>
  )
}

const Logos = ({ data }) => {
  const { title, description, logos } = data
  return (
    <section className="bg-white dark:bg-black">
      <div className="mx-auto max-w-screen-xl px-4 py-8 text-center lg:px-6 lg:py-16">
        <div className="mx-auto max-w-screen-sm ">
          <h3 className="mb-4 text-2xl font-semibold tracking-tight text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="font-light text-gray-500 sm:text-xl dark:text-gray-400">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center">
          {logos.map((d, id) => (
            <Logo data={d} key={id} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Logos
