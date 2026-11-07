import type { BaseActorAffiliation, BaseActorLicence } from "@/lib/types"
import { parseSheetDate } from "@/lib/date-utils"

const timestamp = (value: string) => {
  return parseSheetDate(value)?.getTime() ?? 0
}

export const affiliationHistory = <T extends BaseActorAffiliation>(
  items: T[],
  actorId: string,
) =>
  items
    .filter((item) => item.actorId === actorId)
    .sort((a, b) => timestamp(b.dateDebut) - timestamp(a.dateDebut))

export function getCurrentAffiliationForActor<T extends BaseActorAffiliation>(
  items: T[],
  actorId: string,
): T | undefined {
  const history = affiliationHistory(items, actorId)
  const explicitActive = history.filter((item) =>
    ["ACTIF", "ACTIVE", "EN COURS"].includes(item.statutAffiliation.trim().toUpperCase()),
  )
  const active = explicitActive.length ? explicitActive : history.filter((item) => {
    const status = item.statutAffiliation.trim().toUpperCase()
    return !["INACTIF", "INACTIVE", "TERMINE", "TERMINEE", "ANNULE", "ANNULEE"].includes(status)
  })

  if (active.length > 1) {
    console.warn(`Plusieurs affiliations actives pour l'acteur ${actorId}`)
  }

  return active[0]
}

export const licenceHistory = <T extends BaseActorLicence>(
  items: T[],
  actorId: string,
) =>
  items
    .filter((item) => item.actorId === actorId)
    .sort((a, b) => timestamp(b.dateDelivrance) - timestamp(a.dateDelivrance))
