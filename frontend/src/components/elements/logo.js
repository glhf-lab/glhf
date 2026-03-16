import Link from "next/link"
import Image from "next/image"

const Logo = ({ imgUrl, textTop, textBottom }) => {
  return (
    <Link
      href="/"
      className="flex items-center group [&>*]:focus-visible:dark:text-black"
    >
      {imgUrl && (
        <Image
          src={imgUrl}
          alt="logo"
          width={60}
          height={60}
          className="mr-4"
        />
      )}
      <div className="flex flex-col text-3xl font-extrabold ">
        {textTop && (
          <span
            className="bg-gradient-to-r from-black to-black bg-clip-text text-black text-transparent group-hover:animate-text 
                 group-hover:from-black group-hover:via-purple-500 group-hover:to-cyan-500 dark:from-white 
               dark:to-white  dark:group-hover:from-white dark:group-hover:via-purple-500 dark:group-hover:to-cyan-500"
          >
            {textTop}
          </span>
        )}
        {textBottom && <span className="dark:text-white">{textBottom}</span>}
      </div>
    </Link>
  )
}

export default Logo
