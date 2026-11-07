import { formatDateForSheet } from "@/lib/compact-date"
import { env } from "@/lib/env"
import { appendSheetRecord } from "@/lib/google-sheets"
import { competitionData, loadCompetitionBundle } from "@/lib/competitions-v2"
import { CompetitionDomainError } from "@/lib/competition-structure"

const clean = (value: unknown) => String(value ?? "").trim()
export async function createMatch(competitionId: string, input: Record<string, unknown>) {
  const bundle = await loadCompetitionBundle(), detail = competitionData(bundle, competitionId)
  if (!detail) throw new CompetitionDomainError("Compétition introuvable.", 404)
  if (detail.competition.statut === "TERMINEE") throw new CompetitionDomainError("Cette compétition est clôturée.", 409)
  const phaseId = clean(input.id_phase_competition), groupId = clean(input.id_groupe), unitA = clean(input.id_unite_a), unitB = clean(input.id_unite_b), time = clean(input.heure_match), observations = clean(input.observations)
  const phase = detail.phases.find((row) => clean(row.id_phase_competition) === phaseId && clean(row.statut) === "ACTIF")
  if (!phase) throw new CompetitionDomainError("Phase active introuvable.", 400, { id_phase_competition: "Phase invalide." })
  if (!unitA || !unitB || unitA === unitB) throw new CompetitionDomainError("Sélectionnez deux unités distinctes.", 400)
  const eligible = detail.phasesUnites.filter((row) => clean(row.id_phase_competition) === phaseId && clean(row.statut) === "ACTIF")
  if (![unitA, unitB].every((id) => eligible.some((row) => clean(row.id_unite_competition) === id))) throw new CompetitionDomainError("Une unité n’est pas affectée à cette phase.", 400)
  if (clean(phase.id_mode_phase) === "MPH001") {
    if (!groupId || !detail.groupes.some((row) => clean(row.id_groupe) === groupId && clean(row.id_phase_competition) === phaseId)) throw new CompetitionDomainError("Un groupe commun est obligatoire.", 400, { id_groupe: "Groupe invalide." })
    if (![unitA, unitB].every((id) => eligible.some((row) => clean(row.id_unite_competition) === id && clean(row.id_groupe) === groupId))) throw new CompetitionDomainError("Les unités doivent appartenir au même groupe.", 400)
  } else if (groupId) throw new CompetitionDomainError("Le groupe est interdit pour cette phase.", 400)
  let date = ""; try { date = formatDateForSheet(clean(input.date_match)) } catch { throw new CompetitionDomainError("Date invalide.", 400, { date_match: "Date invalide." }) }
  if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new CompetitionDomainError("Heure invalide.", 400, { heure_match: "Utilisez HH:MM." })
  if (detail.matches.some((row) => clean(row.id_phase_competition) === phaseId && clean(row.id_groupe) === groupId && new Set([clean(row.id_unite_a), clean(row.id_unite_b)]).has(unitA) && new Set([clean(row.id_unite_a), clean(row.id_unite_b)]).has(unitB) && clean(row.statut_match) !== "ANNULE")) throw new CompetitionDomainError("Cette confrontation existe déjà dans ce périmètre.", 409)
  const match = competitionId.match(/^VOL-COMP-(\d{4})-(\d{3})$/), prefix = `VOL-MAT-${match?.[1] ?? new Date().getUTCFullYear()}-${match?.[2] ?? "000"}-`, used = new Set(detail.matches.map((row) => clean(row.id_match)))
  let sequence = Math.max(0, ...[...used].filter((id) => id.startsWith(prefix)).map((id) => Number(id.slice(prefix.length)) || 0)) + 1, id = `${prefix}${String(sequence).padStart(3, "0")}`; while (used.has(id)) id = `${prefix}${String(++sequence).padStart(3, "0")}`
  await appendSheetRecord(env.googleSheets.competitionsSpreadsheetId, "COMPETITIONS_MATCHS", { id_match: id, id_competition: competitionId, id_phase_competition: phaseId, id_groupe: groupId, id_unite_a: unitA, id_unite_b: unitB, date_match: date, heure_match: time, statut_match: "PROGRAMME", observations })
  return { id }
}
