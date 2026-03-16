import { useState } from "react"
import Markdown from "react-markdown"
import { getButtonAppearance } from "src/utils/button"
import { getStrapiMedia } from "src/utils/media"
import ButtonLink from "../elements/button-link"
//import NextImage from "../elements/image"
import Image from "next/image"
import classNames from "classnames"

const Hero = ({ data }) => {
  const { picture, pictureCredit } = data
  return (
    <div className="container flex flex-col items-center justify-between py-12 md:flex-row">
      {/* Left column for content */}
      <div className="flex-1 sm:pr-8">
        {/* Hero section label */}
        <p className="font-semibold uppercase tracking-wide dark:text-gray-400">
          {data.label}
        </p>
        {/* Big title */}
        <h1 className="title mb-4 mt-2 sm:mb-2 sm:mt-0 dark:text-white">
          {data.title}
        </h1>
        {/* Description paragraph */}
        <p className="mb-6 text-xl dark:text-gray-400">{data.description}</p>
        {/* Buttons row */}
        <div className="flex flex-row flex-wrap gap-4">
          {data.buttons.map((button) => (
            <div key={button.id} className="group relative">
              <ButtonLink
                button={button}
                appearance={getButtonAppearance(button.type, "light")}
                key={button.id}
              />
              <div className="absolute top-0 -z-10 h-full w-full rounded-full bg-gradient-to-r from-red-500 via-purple-500 to-cyan-500 bg-[size:100%_100%] bg-center opacity-70 blur-xl transition-all duration-300 group-hover:opacity-100" />
            </div>
          ))}
        </div>
        {/* Small rich text */}
        <div className="rich-text-hero mt-4 text-base sm:mt-3 md:text-sm dark:text-gray-400 ">
          <Markdown>{data.smallTextWithLink}</Markdown>
        </div>
      </div>
      {/* Right column for the image */}
      <div className="mt-6 items-end w-full flex-shrink-0 md:mt-0 flex md:w-6/12 flex-col">
        <Image
          src={getStrapiMedia(picture.data.attributes.url)}
          width={picture.data.attributes.width}
          height={picture.data.attributes.height}
          priority={true}
          sizes="(max-width: 768px) 100vw, 33vw"
          alt={picture.data.attributes.alternativeText || ""}
          className={
            "object-contain  m-h-full m-w-full duration-500 ease-in-out"
          }
        />
        {pictureCredit && (
          <div className="text-right text-gray-400 text-sm pt-2">
            <Markdown>{pictureCredit}</Markdown>
          </div>
        )}
      </div>
    </div>
  )
}

export default Hero
