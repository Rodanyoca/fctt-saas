import { env } from "@/lib/env"
import { appendSheetRecord, updateSheetRecordById } from "@/lib/google-sheets"
import { competitionData, loadCompetitionBundle } from "@/lib/competitions-v2"
import { CompetitionDomainError } from "@/lib/competition-structure"
import { validateVolleyballResult, type SetScore, type VolleyballDiscipline } from "@/lib/volleyball-results"

const clean = (value: unknown) => String(value ?? "").trim()
const NORMAL_STATUS = "STR001"

export async function createCompetitionResult(competitionId: string, input: Record<string, unknown>) {
  const bundle = await loadCompetitionBundle(), detail = competitionData(bundle, competitionId)
  if (!detail) throw new CompetitionDomainError("Compétition introuvable.", 404)
  if (detail.competition.statut === "TERMINEE") throw new CompetitionDomainError("Cette compétition est clôturée.", 409)
  const matchId = clean(input.id_match), statusId = clean(input.id_statut_resultat), observations = clean(input.observations)
  const match = detail.matches.find((row) => clean(row.id_match) === matchId)
  if (!match) throw new CompetitionDomainError("Match introuvable dans cette compétition.", 404)
  if (detail.resultats.some((row) => clean(row.id_match) === matchId)) throw new CompetitionDomainError("Un résultat existe déjà pour ce match.", 409)
  if (!(bundle.references.STATUTS_RESULTATS ?? []).some((item) => item.id === statusId)) throw new CompetitionDomainError("Statut de résultat inconnu.", 400, { id_statut_resultat: "Valeur inconnue." })
  const phase = detail.phases.find((row) => clean(row.id_phase_competition) === clean(match.id_phase_competition))
  const event = detail.epreuves.find((row) => clean(row.id_epreuve_competition) === clean(phase?.id_epreuve_competition))
  const discipline = clean(event?.id_discipline)
  if (!['DISC061', 'DISC009'].includes(discipline)) throw new CompetitionDomainError("La discipline de l’épreuve ne permet pas le calcul automatique.", 400)
  const record: Record<string, string> = { id_match: matchId, id_statut_resultat: statusId, observations, id_type_resultat: "", id_unite_vainqueur: "", sets_gagnes_a: "", sets_gagnes_b: "", total_points_a: "", total_points_b: "" }
  for (let index = 1; index <= 5; index++) { record[`set_${index}_a`] = ""; record[`set_${index}_b`] = "" }
  if (statusId === NORMAL_STATUS) {
    const maximum = discipline === 'DISC009' ? 3 : 5, sets: SetScore[] = []
    let emptySetSeen = false
    for (let index = 1; index <= maximum; index++) {
      const a = clean(input[`set_${index}_a`]), b = clean(input[`set_${index}_b`])
      if (!a && !b) { emptySetSeen = true; continue }
      if (emptySetSeen) throw new CompetitionDomainError("Les sets doivent être saisis dans l’ordre, sans espace vide.", 400)
      if (!/^\d+$/.test(a) || !/^\d+$/.test(b)) throw new CompetitionDomainError(`Le set ${index} doit contenir deux entiers.`, 400)
      sets.push({ a: Number(a), b: Number(b) })
    }
    const result = validateVolleyballResult(discipline as VolleyballDiscipline, sets)
    if (!result.valid) throw new CompetitionDomainError(result.errors.join(" "), 400)
    const typeExists = (bundle.references.TYPES_RESULTATS ?? []).some((item) => item.id === result.resultType)
    if (!typeExists) throw new CompetitionDomainError("Le barème correspondant est absent du référentiel.", 409)
    sets.forEach((set, index) => { record[`set_${index + 1}_a`] = String(set.a); record[`set_${index + 1}_b`] = String(set.b) })
    record.sets_gagnes_a = String(result.winsA); record.sets_gagnes_b = String(result.winsB); record.total_points_a = String(result.pointsA); record.total_points_b = String(result.pointsB)
    record.id_unite_vainqueur = result.winner === "A" ? clean(match.id_unite_a) : clean(match.id_unite_b); record.id_type_resultat = result.resultType
  } else {
    const winner = clean(input.id_unite_vainqueur)
    if (winner && ![clean(match.id_unite_a), clean(match.id_unite_b)].includes(winner)) throw new CompetitionDomainError("Le vainqueur doit participer au match.", 400)
    record.id_unite_vainqueur = winner
    if (statusId === "STR099" && !observations) throw new CompetitionDomainError("Une observation est obligatoire pour le statut Autre.", 400, { observations: "Observation obligatoire." })
  }
  const idMatch = competitionId.match(/^VOL-COMP-(\d{4})-(\d{3})$/), prefix = `VOL-RES-${idMatch?.[1] ?? new Date().getUTCFullYear()}-${idMatch?.[2] ?? "000"}-`, used = new Set(detail.resultats.map((row) => clean(row.id_resultat)))
  let sequence = Math.max(0, ...[...used].filter((id) => id.startsWith(prefix)).map((id) => Number(id.slice(prefix.length)) || 0)) + 1, id = `${prefix}${String(sequence).padStart(3, "0")}`; while (used.has(id)) id = `${prefix}${String(++sequence).padStart(3, "0")}`
  await appendSheetRecord(env.googleSheets.competitionsSpreadsheetId, "COMPETITIONS_RESULTATS", { id_resultat: id, ...record })
  try { await updateSheetRecordById(env.googleSheets.competitionsSpreadsheetId, "COMPETITIONS_MATCHS", "id_match", matchId, { statut_match: statusId === "STR005" ? "ANNULE" : "TERMINE" }) } catch (error) { console.error("Résultat enregistré mais statut du match non synchronisé", { competitionId, matchId, resultId: id, error }) }
  return { id, matchId, winnerId: record.id_unite_vainqueur, resultTypeId: record.id_type_resultat }
}
