import ButtonLink from "src/components/elements/button-link"
import { getButtonAppearance } from "src/utils/button"

const BottomActions = ({ data }) => {
  return (
    <section className="border-y-2 border-slate-200 bg-gray-50 py-20 text-center text-black dark:border-2 dark:border-x-0 dark:border-zinc-900 dark:bg-black dark:text-white">
      <h2 className="title mb-10 ">{data.title}</h2>
      {/* Buttons row */}
      <div className="container flex flex-row flex-wrap justify-center gap-4">
        {data.buttons.map((button) => (
          <ButtonLink
            button={button}
            appearance={getButtonAppearance(button.type, "light")}
            key={button.id}
          />
        ))}
      </div>
    </section>
  )
}

export default BottomActions
