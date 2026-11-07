import { z } from "zod"

export type AffiliationKind = "athlete" | "coach" | "medecin" | "officiel"
export type AffiliationRow = {
  id: string; kind: AffiliationKind; actorId: string; clubId: string; entityTypeId: string; entityId: string
  functionId: string; dateDebut: string; dateFin: string; statusId: string; observations: string
}
export type AffiliationStore = {
  list(kind: AffiliationKind, fresh?: boolean): Promise<AffiliationRow[]>
  save(row: AffiliationRow, mode: "create" | "update"): Promise<void>
  actorExists(kind: AffiliationKind, id: string): Promise<boolean>
  clubExists(id: string): Promise<boolean>
  entityExists(typeId: string, id: string): Promise<boolean>
  statusExists(id: string): Promise<boolean>
  officialFunctionExists(id: string): Promise<boolean>
}

export class AffiliationDomainError extends Error {
  constructor(public code: string, message: string, public status: number, public fields: Record<string, string> = {}) { super(message) }
}

const commandSchema = z.object({
  id_club: z.string().trim().optional().default(""), id_fonction: z.string().trim().optional().default(""),
  id_type_entite: z.string().trim().optional().default(""), id_entite: z.string().trim().optional().default(""),
  date_debut: z.string().trim().min(1, "Ce champ est obligatoire."), date_fin: z.string().trim().optional().default(""),
  id_statut_affiliation: z.string().trim().min(1, "Ce champ est obligatoire."), observations: z.string().trim().optional().default(""),
})
const prefixes: Record<AffiliationKind, string> = { athlete: "AFA", coach: "AFC", medecin: "AFM", officiel: "AFO" }
const isOfficial = (kind: AffiliationKind) => kind === "officiel"
const overlap = (a: AffiliationRow, start: string, end: string) => a.dateDebut <= (end || "9999-12-31") && start <= (a.dateFin || "9999-12-31")
const sameTarget = (a: AffiliationRow, clubId: string, typeId: string, entityId: string) => a.kind === "officiel" ? a.entityTypeId === typeId && a.entityId === entityId : a.clubId === clubId

function canonicalDate(value: string) {
  const digits = value.replace(/\D/g, "")
  if (digits.length !== 8) throw new Error("Date invalide")
  const day = Number(digits.slice(0, 2)), month = Number(digits.slice(2, 4)), year = Number(digits.slice(4))
  const date = new Date(Date.UTC(year, month - 1, day))
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) throw new Error("Date invalide")
  return `${String(year).padStart(4, "0")}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`
}

function nextId(kind: AffiliationKind, rows: AffiliationRow[]) {
  const prefix = prefixes[kind], pattern = new RegExp(`^${prefix}-(\\d{6})$`)
  const highest = Math.max(0, ...rows.map((row) => Number(row.id.match(pattern)?.[1] ?? 0)))
  return `${prefix}-${String(highest + 1).padStart(6, "0")}`
}

function parse(input: unknown) {
  const result = commandSchema.safeParse(input)
  if (!result.success) throw new AffiliationDomainError("VALIDATION", "Veuillez corriger les champs indiqués.", 422, Object.fromEntries(result.error.issues.map((issue) => [String(issue.path[0]), issue.message])))
  let dateDebut = "", dateFin = ""
  const fields: Record<string, string> = {}
  try { dateDebut = canonicalDate(result.data.date_debut) } catch { fields.date_debut = "Date invalide." }
  try { dateFin = result.data.date_fin ? canonicalDate(result.data.date_fin) : "" } catch { fields.date_fin = "Date invalide." }
  if (dateDebut && dateFin && dateFin < dateDebut) fields.date_fin = "La date de fin ne peut pas précéder la date de début."
  if (result.data.id_statut_affiliation === "SAF002" && !dateFin) fields.date_fin = "La date de fin est obligatoire pour une affiliation terminée."
  if (Object.keys(fields).length) throw new AffiliationDomainError("VALIDATION", "Veuillez corriger les champs indiqués.", 422, fields)
  return { ...result.data, date_debut: dateDebut, date_fin: dateFin }
}

export function isAffiliationActive(row: Pick<AffiliationRow, "statusId" | "dateDebut" | "dateFin">, onDate: string) {
  return row.statusId === "SAF001" && row.dateDebut <= onDate && (!row.dateFin || row.dateFin >= onDate)
}

export function createAffiliationDomain(store: AffiliationStore) {
  async function mutate(kind: AffiliationKind, actorId: string, input: unknown, currentId?: string) {
    if (!Object.hasOwn(prefixes, kind)) throw new AffiliationDomainError("TYPE_NON_PRIS_EN_CHARGE", "Ce type d’acteur n’est pas pris en charge pour les affiliations.", 422)
    if (!actorId || !(await store.actorExists(kind, actorId))) throw new AffiliationDomainError("ACTEUR_INTROUVABLE", "Acteur introuvable.", 404, { actorId: "Acteur inconnu." })
    const values = parse(input), official = isOfficial(kind)
    if (!official && (!values.id_club || !(await store.clubExists(values.id_club)))) throw new AffiliationDomainError("CLUB_INTROUVABLE", "Club introuvable.", 422, { id_club: "Club inconnu." })
    if (official && !values.id_fonction) throw new AffiliationDomainError("VALIDATION", "La fonction est obligatoire.", 422, { id_fonction: "Ce champ est obligatoire." })
    if (official && !(await store.officialFunctionExists(values.id_fonction))) throw new AffiliationDomainError("FONCTION_INVALIDE", "Fonction inconnue.", 422, { id_fonction: "Valeur inconnue." })
    if (official && (!values.id_type_entite || !values.id_entite || !(await store.entityExists(values.id_type_entite, values.id_entite)))) throw new AffiliationDomainError("ENTITE_INVALIDE", "Entité incompatible ou introuvable.", 422, { id_entite: "Entité inconnue pour ce type." })
    if (!(await store.statusExists(values.id_statut_affiliation))) throw new AffiliationDomainError("STATUT_INVALIDE", "Statut inconnu.", 422, { id_statut_affiliation: "Valeur inconnue." })
    const rows = await store.list(kind, true), current = currentId ? rows.find((row) => row.id === currentId && row.actorId === actorId) : undefined
    if (currentId && !current) throw new AffiliationDomainError("INTROUVABLE", "Affiliation introuvable pour cet acteur.", 404)
    const candidate: AffiliationRow = { id: currentId || nextId(kind, rows), kind, actorId, clubId: official ? "" : values.id_club, entityTypeId: official ? values.id_type_entite : "", entityId: official ? values.id_entite : "", functionId: official ? values.id_fonction : "", dateDebut: values.date_debut, dateFin: values.date_fin, statusId: values.id_statut_affiliation, observations: values.observations }
    const exact = rows.find((row) => row.id !== currentId && JSON.stringify({ ...row, id: "" }) === JSON.stringify({ ...candidate, id: "" }))
    if (!currentId && exact) return { row: exact, created: false }
    if (rows.some((row) => row.id !== currentId && row.actorId === actorId && sameTarget(row, candidate.clubId, candidate.entityTypeId, candidate.entityId) && overlap(row, candidate.dateDebut, candidate.dateFin))) throw new AffiliationDomainError("CHEVAUCHEMENT", "Cette période chevauche une affiliation existante.", 409, { date_debut: "Période en conflit.", date_fin: "Période en conflit." })
    await store.save(candidate, currentId ? "update" : "create")
    return { row: candidate, created: !currentId }
  }
  return { create: (kind: AffiliationKind, actorId: string, input: unknown) => mutate(kind, actorId, input), update: (kind: AffiliationKind, actorId: string, id: string, input: unknown) => mutate(kind, actorId, input, id) }
}
