const ID_PATTERN = /^AUT(\d{5})$/

export function isAutreActeurId(value: string) {
  return ID_PATTERN.test(value)
}

export function nextAutreActeurId(ids: string[]): string {
  const existing = new Set(ids.map((id) => id.trim()))
  const maximum = ids.reduce((max, id) => {
    const match = id.trim().match(ID_PATTERN)
    return match ? Math.max(max, Number(match[1])) : max
  }, 0)
  const next = `AUT${String(maximum + 1).padStart(5, "0")}`
  if (existing.has(next)) throw new Error("Collision lors de la génération de l’identifiant.")
  return next
}

type OtherType = { id: string; statut: string }
const active = (value: string) => value.trim().toUpperCase() === "ACTIF"
export const normalizePhone = (value: string) => value.trim().replace(/[\s().-]+/g, "")
export const requiresOtherTypePrecision = (typeId: string, observations: string) => typeId === "TAU099" && !observations.trim()

export function selectableAutreActeurTypes<T extends OtherType>(types: T[], currentTypeId = ""): T[] {
  return types.filter((type) => active(type.statut) || type.id === currentTypeId)
}

export function validateAutreActeurType<T extends OtherType>(types: T[], selectedId: string, currentTypeId = ""): T | undefined {
  const selected = types.find((type) => type.id === selectedId)
  const unchangedHistorical = Boolean(currentTypeId && selectedId === currentTypeId)
  if (!selected && !unchangedHistorical) throw new Error("Le type d’autre acteur est introuvable.")
  if (selected && !active(selected.statut) && !unchangedHistorical) throw new Error("Ce type d’autre acteur n’est plus actif.")
  return selected
}
