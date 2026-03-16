const isProlificEmail = (identifier) => {
  return /^[a-f\d]{24}@email\.prolific\.co$/.test(identifier)
}
export default isProlificEmail
