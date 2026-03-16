import Markdown from "markdown-to-jsx"
import {
  CheckIcon,
  EnvelopeIcon,
  TableCellsIcon,
  UserIcon,
} from "@heroicons/react/24/outline"
import StudyProgressStepItem from "./StudyProgressStepItem"
import classNames from "classnames"

const DynamicUrlButton = ({
  children,
  color = "primary",
  user,
  baseUrl,
  dynamicUrlQuery = "[]",
}) => {
  const queryArr = JSON.parse(dynamicUrlQuery)
  const urlParams = queryArr.reduce((obj, item) => {
    const dynamicItem = user[item]
    obj[item] = dynamicItem
    return obj
  }, {})
  const searchParams = new URLSearchParams(urlParams).toString()
  const url = new URL(baseUrl)
  const completeUrl = `${url}?${searchParams}`
  return (
    <div className="full-w pb-4">
      <a
        href={completeUrl}
        target="_self"
        className={classNames(
          {
            "no-underline focus-visible:btn-focus dark:focus-visible:btn-focus-dark disabled mb-3 flex w-full items-center justify-center rounded border-2 border-transparent bg-blue-700 px-7 py-3 text-sm font-medium uppercase leading-snug text-white ring-blue-800 transition-all duration-150 hover:bg-blue-600 hover:ring-2 active:shadow-lg":
              color === "primary",
          },
          {
            "no-underline focus-visible:btn-focus dark:focus-visible:btn-focus-dark disabled mb-3 flex w-full items-center justify-center rounded border-2 border-red-500 bg-transparent px-7 py-3 text-sm font-medium uppercase leading-snug text-red-500 ring-red-800 transition-all duration-150 hover:text-red-700 dark:hover:text-red-300 hover:ring-2 active:shadow-lg":
              color === "warning",
          }
        )}
      >
        {children}
      </a>
    </div>
  )
}

const StudyRichText = ({ children, user }) => {
  return (
    <Markdown
      options={{
        disableParsingRawHTML: false,
        overrides: {
          DynamicUrlButton: {
            component: DynamicUrlButton,
            props: {
              user,
            },
          },
          script: (props) => props.children,
          body: (props) => props.children,
          head: (props) => props.children,
          style: (props) => props.children,
        },
      }}
    >
      {children}
    </Markdown>
  )
}

const NotLinked = ({ content, user }) => {
  return <StudyRichText user={user}>{content}</StudyRichText>
}

const LinkedNotActive = ({ content, user }) => {
  return <StudyRichText user={user}>{content}</StudyRichText>
}
const Active = ({ content, surveySendDate, user }) => {
  return (
    <StudyRichText user={user}>
      {String(content).replace(
        /\{\{surveySendDate\}\}/,
        surveySendDate.toLocaleDateString()
      )}
    </StudyRichText>
  )
}
const SurveySent = ({ content, user, qualtricsLink }) => {
  return (
    <StudyRichText user={user}>
      {String(content).replace(/\{\{qualtricsLink\}\}/, qualtricsLink)}
    </StudyRichText>
  )
}
const StudyCompleted = ({ content, user }) => {
  return <StudyRichText user={user}>{content}</StudyRichText>
}
const progressComponents = {
  notLinked: NotLinked,
  linkedNotActive: LinkedNotActive,
  active: Active,
  surveySent: SurveySent,
  studyCompleted: StudyCompleted,
}

const StudyProgress = ({ progress, surveySendDate, user, content }) => {
  const ProgressDescription = progressComponents[progress.status]
  const { qualtricsDistributionLink, stepper } = user
  const {
    showLinkStep,
    showCheckPrivacyStep,
    showSurveyStep,
    showStudyCompletedStep,
    linkStepCompletedLabel,
    linkStepNotCompletedLabel,
    checkPrivacyStepCompletedLabel,
    checkPrivacyStepNotCompletedLabel,
    surveyStepCompletedLabel,
    surveyStepNotCompletedLabel,
    studyCompletedLabel,
  } = stepper
  return (
    <div>
      <ProgressDescription
        content={content}
        surveySendDate={surveySendDate}
        qualtricsLink={qualtricsDistributionLink}
        user={user}
      />
      <div className="">
        <div className="flex list-none">
          {showLinkStep && (
            <StudyProgressStepItem
              icon={
                <UserIcon className="feather feather-user-plus h-full w-full stroke-2" />
              }
              progress={progress.index}
              index={0}
              connect
            >
              {progress.index === 0
                ? linkStepNotCompletedLabel
                : linkStepCompletedLabel}
            </StudyProgressStepItem>
          )}
          {showCheckPrivacyStep && (
            <StudyProgressStepItem
              icon={
                <TableCellsIcon className="feather feather-user-plus h-full w-full stroke-2 " />
              }
              progress={progress.index}
              index={1}
              error={progress.index === 1}
              connect
            >
              {progress.index > 1
                ? checkPrivacyStepCompletedLabel
                : checkPrivacyStepNotCompletedLabel}
            </StudyProgressStepItem>
          )}
          {showSurveyStep && (
            <StudyProgressStepItem
              icon={
                <EnvelopeIcon className="feather feather-user-plus h-full w-full stroke-2 " />
              }
              progress={progress.index}
              index={3}
              connect
            >
              {progress > 3
                ? surveyStepCompletedLabel
                : surveyStepNotCompletedLabel.replace(
                    /\{\{surveySendDate\}\}/,
                    `${
                      surveySendDate
                        ? `${surveySendDate.toLocaleDateString()}`
                        : ""
                    }`
                  )}
            </StudyProgressStepItem>
          )}
          {showStudyCompletedStep && (
            <StudyProgressStepItem
              icon={
                <CheckIcon className="feather feather-user-plus h-full w-full stroke-[4px] " />
              }
              progress={progress.index}
              index={4}
            >
              {studyCompletedLabel}
            </StudyProgressStepItem>
          )}
        </div>
      </div>
    </div>
  )
}

export default StudyProgress
