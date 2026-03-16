const getProgress = (user) => {
  const {
    requiredAccountsLinked,
    activationDate,
    surveyActivationDate,
    studyCompleted,
  } = user
  if (studyCompleted) {
    return { status: "studyCompleted", index: 4 }
  }
  if (!requiredAccountsLinked) {
    // not linked
    return { status: "notLinked", index: 0 }
  }
  if (requiredAccountsLinked && !activationDate) {
    // "linkedNotActive"
    return { status: "linkedNotActive", index: 1 }
  }
  if (activationDate && !surveyActivationDate) {
    // active
    return { status: "active", index: 2 }
  }
  if (requiredAccountsLinked && surveyActivationDate) {
    // survey sent
    return { status: "surveySent", index: 3 }
  }
  return false
}
export default getProgress
