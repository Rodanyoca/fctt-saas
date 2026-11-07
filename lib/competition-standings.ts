import { formatDateForSheet } from "@/lib/compact-date"
import { env } from "@/lib/env"
import { appendSheetRecord, updateSheetRecordById, type SheetRow } from "@/lib/google-sheets"
import { competitionData, loadCompetitionBundle } from "@/lib/competitions-v2"
import { CompetitionDomainError } from "@/lib/competition-structure"
import { calculateStandings } from "@/lib/standings-calculation"

const clean = (value: unknown) => String(value ?? "").trim()
const number = (value: unknown) => Number(clean(value)) || 0
function nextId(kind: "CLA" | "PHU", competitionId: string, existing: SheetRow[], key: string) { const match = competitionId.match(/^VOL-COMP-(\d{4})-(\d{3})$/), prefix = `VOL-${kind}-${match?.[1] ?? new Date().getUTCFullYear()}-${match?.[2] ?? "000"}-`, used = new Set(existing.map((row) => clean(row[key]))); let sequence = Math.max(0, ...[...used].filter((id) => id.startsWith(prefix)).map((id) => Number(id.slice(prefix.length)) || 0)) + 1, id = `${prefix}${String(sequence).padStart(3, "0")}`; while (used.has(id)) id = `${prefix}${String(++sequence).padStart(3, "0")}`; return id }

export async function recalculateStandings(competitionId: string, phaseId: string, groupId: string) {
  const bundle = await loadCompetitionBundle(), detail = competitionData(bundle, competitionId)
  if (!detail) throw new CompetitionDomainError("Compétition introuvable.", 404)
  if (detail.competition.statut === "TERMINEE") throw new CompetitionDomainError("Cette compétition est clôturée.", 409)
  const phase = detail.phases.find((row) => clean(row.id_phase_competition) === phaseId)
  if (!phase || clean(phase.id_mode_phase) !== "MPH001") throw new CompetitionDomainError("Le classement exige une phase de groupes.", 400)
  if (!groupId || !detail.groupes.some((row) => clean(row.id_groupe) === groupId && clean(row.id_phase_competition) === phaseId)) throw new CompetitionDomainError("Groupe invalide.", 400)
  const units = detail.phasesUnites.filter((row) => clean(row.id_phase_competition) === phaseId && clean(row.id_groupe) === groupId && clean(row.statut) === "ACTIF").map((row) => clean(row.id_unite_competition))
  const matches = detail.matches.filter((row) => clean(row.id_phase_competition) === phaseId && clean(row.id_groupe) === groupId)
  const standings = calculateStandings(units, matches, detail.resultats, bundle.referenceData.TYPES_RESULTATS ?? [])
  for (const standing of standings) {
    const existing = detail.classements.find((row) => clean(row.id_phase_competition) === phaseId && clean(row.id_groupe) === groupId && clean(row.id_unite_competition) === standing.unitId), id = existing ? clean(existing.id_classement) : nextId("CLA", competitionId, [...detail.classements], "id_classement")
    const record = { id_competition: competitionId, id_phase_competition: phaseId, id_groupe: groupId, id_unite_competition: standing.unitId, matchs_joues: String(standing.played), victoires: String(standing.wins), defaites: String(standing.losses), sets_gagnes: String(standing.setsFor), sets_perdus: String(standing.setsAgainst), difference_sets: String(standing.setDifference), points_pour: String(standing.pointsFor), points_contre: String(standing.pointsAgainst), difference_points: String(standing.pointDifference), ratio_sets: standing.setRatio.toFixed(4), ratio_points: standing.pointRatio.toFixed(4), points_classement: String(standing.rankingPoints), rang: String(standing.rank), observations: "" }
    if (existing) await updateSheetRecordById(env.googleSheets.competitionsSpreadsheetId, "COMPETITIONS_CLASSEMENT", "id_classement", id, record); else { await appendSheetRecord(env.googleSheets.competitionsSpreadsheetId, "COMPETITIONS_CLASSEMENT", { id_classement: id, ...record }); detail.classements.push({ id_classement: id }) }
  }
  return standings
}

export async function qualifyUnit(competitionId: string, input: Record<string, unknown>) {
  const bundle = await loadCompetitionBundle(), detail = competitionData(bundle, competitionId)
  if (!detail) throw new CompetitionDomainError("Compétition introuvable.", 404)
  if (detail.competition.statut === "TERMINEE") throw new CompetitionDomainError("Cette compétition est clôturée.", 409)
  const unitId = clean(input.id_unite_competition), sourceId = clean(input.id_phase_source), destinationId = clean(input.id_phase_competition), groupId = clean(input.id_groupe), matchId = clean(input.id_match_source)
  const source = detail.phases.find((row) => clean(row.id_phase_competition) === sourceId), destination = detail.phases.find((row) => clean(row.id_phase_competition) === destinationId)
  if (!source || !destination || clean(source.id_epreuve_competition) !== clean(destination.id_epreuve_competition) || number(destination.numero_phase) <= number(source.numero_phase)) throw new CompetitionDomainError("La phase de destination doit être ultérieure et appartenir à la même épreuve.", 400)
  if (clean(destination.statut) !== "ACTIF") throw new CompetitionDomainError("La phase de destination doit être active.", 409)
  if (!detail.phasesUnites.some((row) => clean(row.id_phase_competition) === sourceId && clean(row.id_unite_competition) === unitId && clean(row.statut) === "ACTIF")) throw new CompetitionDomainError("L’unité n’appartient pas à la phase source.", 400)
  if (clean(destination.id_mode_phase) === "MPH001") { if (!groupId || !detail.groupes.some((row) => clean(row.id_groupe) === groupId && clean(row.id_phase_competition) === destinationId)) throw new CompetitionDomainError("Un groupe de destination est obligatoire.", 400) } else if (groupId) throw new CompetitionDomainError("Le groupe est interdit dans cette phase.", 400)
  if (matchId) { const result = detail.resultats.find((row) => clean(row.id_match) === matchId); if (!result || clean(result.id_unite_vainqueur) !== unitId) throw new CompetitionDomainError("L’unité n’est pas le vainqueur officiel du match source.", 400) }
  if (detail.phasesUnites.some((row) => clean(row.id_phase_competition) === destinationId && clean(row.id_groupe) === groupId && clean(row.id_unite_competition) === unitId && clean(row.statut) === "ACTIF")) throw new CompetitionDomainError("Cette qualification existe déjà.", 409)
  let date = ""; try { date = formatDateForSheet(clean(input.date_affectation)) } catch { throw new CompetitionDomainError("Date d’affectation invalide.", 400) }
  const id = nextId("PHU", competitionId, detail.phasesUnites, "id_phase_unite")
  await appendSheetRecord(env.googleSheets.competitionsSpreadsheetId, "COMPETITIONS_PHASES_UNITES", { id_phase_unite: id, id_phase_competition: destinationId, id_groupe: groupId, id_unite_competition: unitId, id_type_affectation_phase: "TAP002", id_phase_source: sourceId, id_match_source: matchId, date_affectation: date, statut: "ACTIF", observations: clean(input.observations) })
  return { id }
}
