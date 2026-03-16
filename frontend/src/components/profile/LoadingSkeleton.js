import Accordion from "@/components/sections/accordion"

const LoadingSkeleton = ({ accounts, FAQ }) => {
  return (
    <>
      <div className="container prose prose-lg animate-pulse gap-4 py-12 dark:prose-invert">
        <h1 className="flex flex-row items-center gap-4 text-3xl">
          Study status
          <div className="flex h-10 w-20 rounded bg-slate-400 dark:bg-slate-700"></div>
        </h1>
        <div className="mb-4 flex flex-col gap-4 pt-4">
          <div className="flex h-5 w-full rounded bg-slate-400 dark:bg-slate-700"></div>
          <div className="flex h-5 w-full rounded bg-slate-400 dark:bg-slate-700"></div>
        </div>
        <div className="flex gap-4">
          <div className="flex h-16 w-full rounded bg-slate-400 dark:bg-slate-700"></div>
          <div className="flex h-16 w-full rounded bg-slate-400 dark:bg-slate-700"></div>
          <div className="flex h-16 w-full rounded bg-slate-400 dark:bg-slate-700"></div>
        </div>
      </div>
      <div className="bg-gray-200 dark:border-2 dark:border-x-0 dark:border-zinc-900 dark:bg-black">
        <div className="container prose prose-lg py-4 ">
          <h2 className="text-center dark:text-stone-50">Accounts</h2>
        </div>
        <div className="flex flex-row justify-center gap-4 py-8 ">
          {/* TODO WRAP */}
          <div className="flex gap-4">
            {/* Show the actual sections */}
            {accounts.map((accountData, id) => (
              <div
                key={id}
                className="mb-2 w-40 max-w-sm animate-pulse overflow-hidden rounded bg-white shadow-lg dark:border-2 dark:border-zinc-700 dark:bg-zinc-900"
              >
                <div className="mx-auto w-full max-w-sm p-4">
                  <div className="flex animate-pulse space-x-4">
                    <div className="flex-1 space-y-6 py-1">
                      <div className="h-2 rounded dark:bg-slate-700"></div>
                      <div className="space-y-3">
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-2 h-2 rounded bg-slate-400 dark:bg-slate-700"></div>
                          <div className="col-span-1 h-2 rounded bg-slate-400 dark:bg-slate-700"></div>
                        </div>
                        <div className="h-2 rounded bg-slate-400 dark:bg-slate-700"></div>
                        <div className="h-10 rounded bg-slate-400 dark:bg-slate-700"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>{" "}
        </div>
      </div>
      {/* <div className="container prose prose-lg py-12 dark:prose-invert">
        <h2>{FAQ.title}</h2>
        <Accordion items={FAQ?.accordionItems} />
      </div> */}
    </>
  )
}

export default LoadingSkeleton
