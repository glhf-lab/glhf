import {
  Accordion as AccordionBase,
  AccordionItem,
  AccordionItemHeading,
  AccordionItemButton,
  AccordionItemPanel,
} from "react-accessible-accordion"
import Markdown from "react-markdown"

const Accordion = ({ items, provider }) => {
  return (
    <AccordionBase allowZeroExpanded allowMultipleExpanded>
      {items.map((item, id) => {
        if (
          item.showTo == "everyone" ||
          (item.showTo == "prolific" && provider == "prolific") ||
          (item.showTo == "public" && provider !== "prolific")
        ) {
          return (
            <AccordionItem key={id} className="group/item">
              <AccordionItemHeading>
                <AccordionItemButton className="focus-visible:accordion-focus group/button flex w-full items-center justify-between border border-b-0 border-gray-200  p-5 text-left font-medium text-gray-500 hover:bg-gray-100 focus:ring-2 focus:ring-gray-200 group-first/item:rounded-t-xl group-last/item:rounded-b-xl group-last/item:border-b aria-expanded:text-blue-700 aria-expanded:group-last/item:rounded-b-none  dark:text-white dark:hover:bg-gray-700">
                  <span id={`#${id}`}>{item.title}</span>
                  <svg
                    className="h-6 w-6 shrink-0 transform transition-transform duration-200 group-aria-expanded/button:rotate-180"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                </AccordionItemButton>
              </AccordionItemHeading>
              <AccordionItemPanel className="border border-b-0 border-gray-200 p-5 group-last/item:rounded-b-xl group-last/item:border-b">
                <div className="prose prose-lg prose-slate mb-2 dark:prose-invert">
                  <Markdown>{item.content}</Markdown>
                </div>
              </AccordionItemPanel>
            </AccordionItem>
          )
        }
      })}
    </AccordionBase>
  )
}

export default Accordion
