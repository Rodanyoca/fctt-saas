import { env } from "@/lib/env"
import { appendSheetRecord, updateSheetRecordById, type SheetRow } from "@/lib/google-sheets"
import { competitionData, loadCompetitionBundle, type CompetitionBundle } from "@/lib/competitions-v2"

const clean = (value: unknown) => String(value ?? "").trim()

export class CompetitionDomainError extends Error {
  constructor(message: string, public status = 400, public fields: Record<string, string> = {}) { super(message) }
}

function requireOpen(bundle: CompetitionBundle, competitionId: string) {
  const detail = competitionData(bundle, competitionId)
  if (!detail) throw new CompetitionDomainError("Compétition introuvable.", 404)
  if (detail.competition.statut === "TERMINEE") throw new CompetitionDomainError("Cette compétition est clôturée.", 409)
  return detail
}

function entityId(kind: "EPR" | "PHA" | "GRP", competitionId: string, existing: SheetRow[], idKey: string) {
  const match = competitionId.match(/^VOL-COMP-(\d{4})-(\d{3})$/)
  const year = match?.[1] ?? String(new Date().getUTCFullYear())
  const competitionCode = match?.[2] ?? "000"
  const prefix = `VOL-${kind}-${year}-${competitionCode}-`
  const used = new Set(existing.map((row) => clean(row[idKey])))
  let sequence = Math.max(0, ...[...used].filter((id) => id.startsWith(prefix)).map((id) => Number(id.slice(prefix.length)) || 0)) + 1
  let candidate = `${prefix}${String(sequence).padStart(3, "0")}`
  while (used.has(candidate)) candidate = `${prefix}${String(++sequence).padStart(3, "0")}`
  return candidate
}

function requireReference(bundle: CompetitionBundle, sheet: string, id: string, field: string) {
  if (!(bundle.references[sheet] ?? []).some((item) => item.id === id)) throw new CompetitionDomainError("Valeur de référentiel inconnue.", 400, { [field]: "Valeur inconnue." })
}

export async function createEvent(competitionId: string, input: Record<string, unknown>) {
  const bundle = await loadCompetitionBundle(), detail = requireOpen(bundle, competitionId)
  const values = { nom_epreuve: clean(input.nom_epreuve), id_discipline: clean(input.id_discipline), id_categorie_age: clean(input.id_categorie_age), id_sexe: clean(input.id_sexe), statut: "ACTIF", observations: clean(input.observations) }
  const fields: Record<string, string> = {}
  for (const key of ["nom_epreuve", "id_discipline", "id_categorie_age", "id_sexe"] as const) if (!values[key]) fields[key] = "Ce champ est obligatoire."
  if (Object.keys(fields).length) throw new CompetitionDomainError("Veuillez corriger les champs indiqués.", 400, fields)
  if (!["DISC061", "DISC009", "DISC099"].includes(values.id_discipline)) throw new CompetitionDomainError("Discipline invalide.", 400, { id_discipline: "Discipline non autorisée." })
  requireReference(bundle, "DISCIPLINES", values.id_discipline, "id_discipline"); requireReference(bundle, "CATEGORIES_AGE", values.id_categorie_age, "id_categorie_age"); requireReference(bundle, "SEXES", values.id_sexe, "id_sexe")
  const id = entityId("EPR", competitionId, detail.epreuves, "id_epreuve_competition")
  await appendSheetRecord(env.googleSheets.competitionsSpreadsheetId, "COMPETITIONS_EPREUVES", { id_epreuve_competition: id, id_competition: competitionId, ...values })
  return { id }
}

export async function updateEvent(competitionId: string, eventId: string, input: Record<string, unknown>) {
  const bundle = await loadCompetitionBundle(), detail = requireOpen(bundle, competitionId)
  const event = detail.epreuves.find((row) => clean(row.id_epreuve_competition) === eventId)
  if (!event) throw new CompetitionDomainError("Épreuve introuvable dans cette compétition.", 404)
  const nom = clean(input.nom_epreuve), statut = clean(input.statut), observations = clean(input.observations)
  const fields: Record<string, string> = {}; if (!nom) fields.nom_epreuve = "Nom obligatoire."; if (!['ACTIF', 'INACTIF'].includes(statut)) fields.statut = "Statut invalide."
  if (Object.keys(fields).length) throw new CompetitionDomainError("Veuillez corriger les champs indiqués.", 400, fields)
  await updateSheetRecordById(env.googleSheets.competitionsSpreadsheetId, "COMPETITIONS_EPREUVES", "id_epreuve_competition", eventId, { nom_epreuve: nom, statut, observations })
  return { id: eventId }
}

export async function createPhase(competitionId: string, input: Record<string, unknown>) {
  const bundle = await loadCompetitionBundle(), detail = requireOpen(bundle, competitionId)
  const values = { id_epreuve_competition: clean(input.id_epreuve_competition), id_type_phase: clean(input.id_type_phase), id_mode_phase: clean(input.id_mode_phase), numero_phase: clean(input.numero_phase), nom_phase: clean(input.nom_phase), statut: "ACTIF", observations: clean(input.observations) }
  const fields: Record<string, string> = {}; for (const key of ["id_epreuve_competition", "id_type_phase", "id_mode_phase", "numero_phase", "nom_phase"] as const) if (!values[key]) fields[key] = "Ce champ est obligatoire."
  if (Object.keys(fields).length) throw new CompetitionDomainError("Veuillez corriger les champs indiqués.", 400, fields)
  if (!detail.epreuves.some((row) => clean(row.id_epreuve_competition) === values.id_epreuve_competition)) throw new CompetitionDomainError("Épreuve étrangère à la compétition.", 400, { id_epreuve_competition: "Épreuve invalide." })
  requireReference(bundle, "TYPES_PHASES", values.id_type_phase, "id_type_phase"); requireReference(bundle, "MODES_PHASES", values.id_mode_phase, "id_mode_phase")
  const id = entityId("PHA", competitionId, detail.phases, "id_phase_competition")
  await appendSheetRecord(env.googleSheets.competitionsSpreadsheetId, "COMPETITIONS_PHASES", { id_phase_competition: id, id_competition: competitionId, ...values })
  return { id }
}

export async function createGroup(competitionId: string, input: Record<string, unknown>) {
  const bundle = await loadCompetitionBundle(), detail = requireOpen(bundle, competitionId)
  const phaseId = clean(input.id_phase_competition), name = clean(input.nom_groupe), observations = clean(input.observations)
  const phase = detail.phases.find((row) => clean(row.id_phase_competition) === phaseId)
  if (!phase) throw new CompetitionDomainError("Phase introuvable dans cette compétition.", 404)
  if (clean(phase.statut) !== "ACTIF") throw new CompetitionDomainError("Le groupe exige une phase active.", 409)
  if (clean(phase.id_mode_phase) !== "MPH001") throw new CompetitionDomainError("Les groupes sont réservés au mode GROUPES.", 400, { id_phase_competition: "Cette phase n’accepte pas de groupe." })
  if (!name) throw new CompetitionDomainError("Veuillez saisir le nom du groupe.", 400, { nom_groupe: "Nom obligatoire." })
  const id = entityId("GRP", competitionId, detail.groupes, "id_groupe")
  await appendSheetRecord(env.googleSheets.competitionsSpreadsheetId, "COMPETITIONS_GROUPES", { id_groupe: id, id_phase_competition: phaseId, nom_groupe: name, statut: "ACTIF", observations })
  return { id }
}

export function asDomainResponse(error: unknown) {
  if (error instanceof CompetitionDomainError) return { body: { error: error.message, fields: error.fields }, status: error.status }
  return { body: { error: error instanceof Error ? error.message : "Service indisponible." }, status: 503 }
}
