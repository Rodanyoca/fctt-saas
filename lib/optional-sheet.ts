export function isMissingSheetRangeError(error: unknown, sheetName: string) {
  const messages: string[] = []
  let current: unknown = error
  while (current instanceof Error) {
    messages.push(current.message)
    current = current.cause
  }
  const signal = messages.join(" ").toLowerCase()
  return signal.includes("unable to parse range") && signal.includes(`${sheetName.toLowerCase()}!`)
}
