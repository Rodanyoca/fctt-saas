export function parseSheetDate(value: unknown): Date | null {
  const raw = String(value ?? "").trim()
  if (!raw) return null

  if (/^\d+(?:\.\d+)?$/.test(raw)) {
    const serial = Number(raw)
    if (serial > 0 && serial < 100000) {
      const date = new Date(Date.UTC(1899, 11, 30) + serial * 86_400_000)
      return Number.isNaN(date.getTime()) ? null : date
    }
  }

  const frenchDateMatch = raw.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (frenchDateMatch) {
    const [, day, month, year] = frenchDateMatch
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    return date.getFullYear() === Number(year) &&
      date.getMonth() === Number(month) - 1 &&
      date.getDate() === Number(day)
      ? date
      : null
  }

  const isoDateMatch = raw.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (isoDateMatch) {
    const [, year, month, day] = isoDateMatch
    const date = new Date(Number(year), Number(month) - 1, Number(day))
    return date.getFullYear() === Number(year) &&
      date.getMonth() === Number(month) - 1 &&
      date.getDate() === Number(day)
      ? date
      : null
  }

  return null
}

export function calculateAgeFromSheetDate(value: unknown): number | null {
  const birthDate = parseSheetDate(value)
  if (!birthDate) return null

  const today = new Date()
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDelta = today.getMonth() - birthDate.getMonth()

  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }

  return age >= 0 ? age : null
}

export const calculateAge = calculateAgeFromSheetDate

export function formatSheetDate(value: unknown): string {
  const date = parseSheetDate(value)
  if (!date) return String(value ?? "").trim() || "-"

  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  })
}
