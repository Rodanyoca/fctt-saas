import { env } from "@/lib/env"
import { getSheetsDataFrom, type SheetRow } from "@/lib/google-sheets"
import { formatDateForSheet } from "@/lib/compact-date"

export const COMPETITION_SHEETS = [
  "COMPETITIONS", "COMPETITIONS_EPREUVES", "COMPETITIONS_PHASES", "COMPETITIONS_GROUPES",
  "COMPETITIONS_PARTICIPANTS", "COMPETITIONS_UNITES", "COMPETITIONS_PHASES_UNITES",
  "COMPETITIONS_GROUPES_UNITES", "COMPETITIONS_INTERVENANTS", "COMPETITIONS_MATCHS",
  "COMPETITIONS_RESULTATS", "COMPETITIONS_CLASSEMENT", "COMPETITIONS_DISTINCTIONS",
] as const

export const COMPETITION_REFERENCE_SHEETS = [
  "TYPES_COMPETITIONS", "DISCIPLINES", "SAISON", "CATEGORIES_AGE", "SEXES", "TYPES_ACTEURS",
  "TYPES_PHASES", "MODES_PHASES", "TYPES_UNITES_COMPETITION", "TYPES_AFFECTATIONS_PHASES",
  "STATUTS_RESULTATS", "TYPES_RESULTATS", "TYPES_DISTINCTIONS",
] as const

const text = (value: unknown) => String(value ?? "").trim()
const rows = (source: Record<string, SheetRow[]>, sheet: string) => source[sheet] ?? []
const mapLabels = (source: SheetRow[], id: string, label: string): Map<string, string> =>
  new Map(source.map((row): [string, string] => [text(row[id]), text(row[label]) || text(row[id])]).filter(([key]) => Boolean(key)))
const resolved = (map: Map<string, string>, id: string) => map.get(id) || (id ? `Référence inconnue (${id})` : "—")

export type Option = { id: string; label: string }
export type CompetitionView = {
  id: string; edition: string; nom: string; typeId: string; type: string; disciplineId: string; discipline: string
  saisonId: string; saison: string; dateDebut: string; dateFin: string; pays: string; lieu: string; statut: string; observations: string
}
export type CompetitionBundle = {
  competitions: CompetitionView[]
  references: Record<string, Option[]>
  referenceData: Record<string, SheetRow[]>
  data: Record<string, SheetRow[]>
}

export async function loadCompetitionBundle(): Promise<CompetitionBundle> {
  if (!env.googleSheets.competitionsSpreadsheetId || !env.googleSheets.referentielsSpreadsheetId) {
    return { competitions: [], references: {}, referenceData: {}, data: {} }
  }
  const [data, refs] = await Promise.all([
    getSheetsDataFrom(env.googleSheets.competitionsSpreadsheetId, COMPETITION_SHEETS.map((sheet) => `${sheet}!A:ZZ`)),
    getSheetsDataFrom(env.googleSheets.referentielsSpreadsheetId, COMPETITION_REFERENCE_SHEETS.map((sheet) => `${sheet}!A:ZZ`)),
  ])
  const types = mapLabels(rows(refs, "TYPES_COMPETITIONS"), "id_type_competition", "nom_type_competition")
  const disciplines = mapLabels(rows(refs, "DISCIPLINES"), "id_discipline", "nom_discipline")
  const seasons = mapLabels(rows(refs, "SAISON"), "id_saison", "nom_saison")
  const competitions = rows(data, "COMPETITIONS").filter((row) => text(row.id_competition)).map((row) => ({
    id: text(row.id_competition), edition: text(row.numero_edition), nom: text(row.nom_competition),
    typeId: text(row.id_type_competition), type: resolved(types, text(row.id_type_competition)),
    disciplineId: text(row.id_discipline), discipline: resolved(disciplines, text(row.id_discipline)),
    saisonId: text(row.id_saison), saison: resolved(seasons, text(row.id_saison)), dateDebut: text(row.date_debut),
    dateFin: text(row.date_fin), pays: text(row.pays), lieu: text(row.lieu), statut: text(row.statut), observations: text(row.observations),
  })).sort((a, b) => b.dateDebut.localeCompare(a.dateDebut) || a.nom.localeCompare(b.nom, "fr"))
  const references = Object.fromEntries(COMPETITION_REFERENCE_SHEETS.map((sheet) => {
    const source = rows(refs, sheet)
    const header = Object.keys(source[0] ?? {})
    const idKey = header.find((key) => key.startsWith("id_")) ?? "id"
    const labelKey = header.find((key) => key.startsWith("nom_")) ?? idKey
    return [sheet, source.map((row) => ({ id: text(row[idKey]), label: text(row[labelKey]) || text(row[idKey]) })).filter((item) => item.id)]
  }))
  return { competitions, references, referenceData: refs, data }
}

export function competitionData(bundle: CompetitionBundle, competitionId: string) {
  const competition = bundle.competitions.find((item) => item.id === competitionId)
  if (!competition) return null
  const events = rows(bundle.data, "COMPETITIONS_EPREUVES").filter((row) => text(row.id_competition) === competitionId)
  const eventIds = new Set(events.map((row) => text(row.id_epreuve_competition)))
  const phases = rows(bundle.data, "COMPETITIONS_PHASES").filter((row) => text(row.id_competition) === competitionId || eventIds.has(text(row.id_epreuve_competition)))
  const phaseIds = new Set(phases.map((row) => text(row.id_phase_competition)))
  const matches = rows(bundle.data, "COMPETITIONS_MATCHS").filter((row) => text(row.id_competition) === competitionId || phaseIds.has(text(row.id_phase_competition)))
  const matchIds = new Set(matches.map((row) => text(row.id_match)))
  return {
    competition,
    epreuves: events,
    phases,
    groupes: rows(bundle.data, "COMPETITIONS_GROUPES").filter((row) => phaseIds.has(text(row.id_phase_competition))),
    participants: rows(bundle.data, "COMPETITIONS_PARTICIPANTS").filter((row) => text(row.id_competition) === competitionId),
    unites: rows(bundle.data, "COMPETITIONS_UNITES").filter((row) => text(row.id_competition) === competitionId),
    phasesUnites: rows(bundle.data, "COMPETITIONS_PHASES_UNITES").filter((row) => phaseIds.has(text(row.id_phase_competition))),
    intervenants: rows(bundle.data, "COMPETITIONS_INTERVENANTS").filter((row) => text(row.id_competition) === competitionId),
    matches,
    resultats: rows(bundle.data, "COMPETITIONS_RESULTATS").filter((row) => matchIds.has(text(row.id_match))),
    classements: rows(bundle.data, "COMPETITIONS_CLASSEMENT").filter((row) => text(row.id_competition) === competitionId),
    distinctions: rows(bundle.data, "COMPETITIONS_DISTINCTIONS").filter((row) => text(row.id_competition) === competitionId),
  }
}

export function validateCompetitionInput(input: Record<string, unknown>) {
  const values = {
    numero_edition: text(input.numero_edition), nom_competition: text(input.nom_competition),
    id_type_competition: text(input.id_type_competition), id_discipline: text(input.id_discipline), id_saison: text(input.id_saison),
    date_debut: text(input.date_debut), date_fin: text(input.date_fin), pays: text(input.pays), lieu: text(input.lieu),
    statut: text(input.statut), observations: text(input.observations),
  }
  const errors: Record<string, string> = {}
  for (const key of ["nom_competition", "id_type_competition", "id_discipline", "id_saison", "date_debut", "date_fin", "pays"] as const) if (!values[key]) errors[key] = "Ce champ est obligatoire."
  try { values.date_debut = formatDateForSheet(values.date_debut) } catch { errors.date_debut = "Date invalide." }
  try { values.date_fin = formatDateForSheet(values.date_fin) } catch { errors.date_fin = "Date invalide." }
  if (values.date_debut && values.date_fin && values.date_fin < values.date_debut) errors.date_fin = "La date de fin doit suivre la date de début."
  if (!['PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'].includes(values.statut)) errors.statut = "Statut invalide."
  return { values, errors }
}

export function nextCompetitionId(existing: string[], seasonLabel: string) {
  const year = seasonLabel.match(/\d{4}/)?.[0] ?? String(new Date().getUTCFullYear())
  const expression = new RegExp(`^VOL-COMP-${year}-(\\d{3})$`)
  const used = new Set(existing)
  let sequence = Math.max(0, ...existing.map((id) => Number(id.match(expression)?.[1] ?? 0))) + 1
  let candidate = `VOL-COMP-${year}-${String(sequence).padStart(3, "0")}`
  while (used.has(candidate)) candidate = `VOL-COMP-${year}-${String(++sequence).padStart(3, "0")}`
  return candidate
}
