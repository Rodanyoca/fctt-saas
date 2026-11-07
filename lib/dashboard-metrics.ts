import { parseSheetDate } from "@/lib/date-utils"

export function normalizeMetricValue(value: unknown): string {
  return String(value ?? "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
}

export const isMetricActive = (value: unknown) =>
  ["actif", "active", "en cours"].includes(normalizeMetricValue(value))

export const isMetricPlanned = (value: unknown) => {
  const status = normalizeMetricValue(value)
  return ["prevu", "programme", "planifie"].some((item) => status.includes(item))
}

export const isMetricDone = (value: unknown) => {
  const status = normalizeMetricValue(value)
  return ["termine", "cloture", "complete"].some((item) => status.includes(item))
}

export const isMetricWin = (value: unknown) => {
  const result = normalizeMetricValue(value)
  return result.startsWith("v") || result.includes("gagne")
}

export const completionPercent = (value: number, total: number) =>
  total > 0 ? Math.round((value / total) * 100) : 0

export const isDateExpired = (value: string) => {
  const date = parseSheetDate(value)
  return date ? date.getTime() < Date.now() : false
}

export function calculateTerritorialMetrics(
  provinces: unknown[], ligues: unknown[], ententes: unknown[], clubs: unknown[],
) {
  return {
    provinces: provinces.length,
    ligues: ligues.length,
    ententes: ententes.length,
    clubs: clubs.length,
    averageClubsPerLeague: ligues.length ? clubs.length / ligues.length : 0,
    averageEntentesPerLeague: ligues.length ? ententes.length / ligues.length : 0,
  }
}

export function calculateActorMetrics(
  athletes: unknown[], coachs: unknown[], arbitres: unknown[], medecins: unknown[], officiels: unknown[],
) {
  return {
    athletes: athletes.length,
    coachs: coachs.length,
    arbitres: arbitres.length,
    medecins: medecins.length,
    officiels: officiels.length,
    encadreurs: coachs.length + arbitres.length + medecins.length + officiels.length,
  }
}

export function calculateLicenceMetrics<T extends { statutLicence: string; dateFinValidite: string }>(
  licences: T[],
) {
  const active = licences.filter((item) => isMetricActive(item.statutLicence) && !isDateExpired(item.dateFinValidite)).length
  const expired = licences.filter((item) => isDateExpired(item.dateFinValidite)).length
  return { total: licences.length, active, expired }
}
