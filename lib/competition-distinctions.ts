import { formatDateForSheet } from "@/lib/compact-date"
import { env } from "@/lib/env"
import { appendSheetRecord, updateSheetRecordById } from "@/lib/google-sheets"
import { competitionData, loadCompetitionBundle } from "@/lib/competitions-v2"
import { competitionPeopleOptions } from "@/lib/competition-people"
import { CompetitionDomainError } from "@/lib/competition-structure"

const clean = (value: unknown) => String(value ?? "").trim()
const normalized = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()

function validateTarget(target: string, unitId: string, actorId: string, actorTypeId: string) {
  const unitAllowed = target.includes("UNITE"), actorAllowed = target.includes("ATHLETE") || target.includes("COACH") || target.includes("ACTEUR")
  if (unitId && !unitAllowed) throw new CompetitionDomainError("Cette distinction n’accepte pas une unité.", 400)
  if (actorId && !actorAllowed) throw new CompetitionDomainError("Cette distinction n’accepte pas un acteur.", 400)
  if (!unitId && !actorId) throw new CompetitionDomainError("Sélectionnez un bénéficiaire.", 400)
  if (unitId && actorId && target !== "UNITE_OU_ACTEUR") throw new CompetitionDomainError("Sélectionnez un seul type de bénéficiaire.", 400)
  if (actorId && !actorTypeId) throw new CompetitionDomainError("Le type d’acteur est obligatoire.", 400)
}

async function context(competitionId: string) {
  const [bundle, people] = await Promise.all([loadCompetitionBundle(), competitionPeopleOptions(competitionId)]), detail = competitionData(bundle, competitionId)
  if (!detail) throw new CompetitionDomainError("Compétition introuvable.", 404)
  if (detail.competition.statut === "TERMINEE") throw new CompetitionDomainError("Cette compétition est clôturée.", 409)
  return { bundle, detail, people }
}

export async function createDistinction(competitionId: string, input: Record<string, unknown>) {
  const { bundle, detail, people } = await context(competitionId)
  const typeId = clean(input.id_type_distinction), eventId = clean(input.id_epreuve_competition), unitId = clean(input.id_unite_competition), actorId = clean(input.id_acteur), actorTypeId = clean(input.id_type_acteur), phaseId = clean(input.id_phase_competition), matchId = clean(input.id_match), observations = clean(input.observations)
  const type = (bundle.referenceData.TYPES_DISTINCTIONS ?? []).find((row) => clean(row.id_type_distinction) === typeId && clean(row.statut || "ACTIF") !== "INACTIF")
  if (!type) throw new CompetitionDomainError("Type de distinction inconnu.", 400)
  validateTarget(normalized(clean(type.cible_autorisee)), unitId, actorId, actorTypeId)
  if (eventId && !detail.epreuves.some((row) => clean(row.id_epreuve_competition) === eventId)) throw new CompetitionDomainError("Épreuve étrangère à la compétition.", 400)
  if (unitId && !detail.unites.some((row) => clean(row.id_unite_competition) === unitId && (!eventId || clean(row.id_epreuve_competition) === eventId))) throw new CompetitionDomainError("Unité incompatible avec l’épreuve.", 400)
  const person = actorId ? people.find((item) => item.id === actorId && item.typeId === actorTypeId) : undefined
  if (actorId && !person) throw new CompetitionDomainError("Acteur ou type d’acteur invalide.", 400)
  const target = normalized(clean(type.cible_autorisee)); if (target === "ATHLETE" && !normalized(person?.typeLabel ?? "").includes("ATHLETE")) throw new CompetitionDomainError("Cette distinction exige un athlète.", 400); if (target === "COACH" && !["COACH", "ENTRAINEUR"].some((word) => normalized(person?.typeLabel ?? "").includes(word))) throw new CompetitionDomainError("Cette distinction exige un coach.", 400)
  if (phaseId && !detail.phases.some((row) => clean(row.id_phase_competition) === phaseId && (!eventId || clean(row.id_epreuve_competition) === eventId))) throw new CompetitionDomainError("Phase incompatible.", 400)
  if (matchId && !detail.matches.some((row) => clean(row.id_match) === matchId && (!phaseId || clean(row.id_phase_competition) === phaseId))) throw new CompetitionDomainError("Match incompatible.", 400)
  if (typeId === "DST099" && !observations) throw new CompetitionDomainError("Une observation est obligatoire pour Autre.", 400, { observations: "Observation obligatoire." })
  if (detail.distinctions.some((row) => clean(row.id_type_distinction) === typeId && clean(row.id_epreuve_competition) === eventId && clean(row.id_unite_competition) === unitId && clean(row.id_acteur) === actorId && clean(row.id_phase_competition) === phaseId && clean(row.id_match) === matchId && clean(row.statut) === "ACTIF")) throw new CompetitionDomainError("Cette distinction active existe déjà.", 409)
  let date = ""; try { date = formatDateForSheet(clean(input.date_attribution)) } catch { throw new CompetitionDomainError("Date d’attribution invalide.", 400, { date_attribution: "Date invalide." }) }
  const match = competitionId.match(/^VOL-COMP-(\d{4})-(\d{3})$/), prefix = `VOL-DST-${match?.[1] ?? new Date().getUTCFullYear()}-${match?.[2] ?? "000"}-`, used = new Set(detail.distinctions.map((row) => clean(row.id_distinction_competition)))
  let sequence = Math.max(0, ...[...used].filter((id) => id.startsWith(prefix)).map((id) => Number(id.slice(prefix.length)) || 0)) + 1, id = `${prefix}${String(sequence).padStart(3, "0")}`; while (used.has(id)) id = `${prefix}${String(++sequence).padStart(3, "0")}`
  await appendSheetRecord(env.googleSheets.competitionsSpreadsheetId, "COMPETITIONS_DISTINCTIONS", { id_distinction_competition: id, id_competition: competitionId, id_epreuve_competition: eventId, id_type_distinction: typeId, id_unite_competition: unitId, id_acteur: actorId, id_type_acteur: actorTypeId, id_phase_competition: phaseId, id_match: matchId, date_attribution: date, statut: "ACTIF", observations })
  return { id }
}

export async function updateDistinction(competitionId: string, distinctionId: string, input: Record<string, unknown>) {
  const { detail } = await context(competitionId), distinction = detail.distinctions.find((row) => clean(row.id_distinction_competition) === distinctionId)
  if (!distinction) throw new CompetitionDomainError("Distinction introuvable.", 404)
  const statut = clean(input.statut), observations = clean(input.observations); if (!['ACTIF', 'INACTIF'].includes(statut)) throw new CompetitionDomainError("Statut invalide.", 400)
  if (clean(distinction.id_type_distinction) === "DST099" && !observations) throw new CompetitionDomainError("Une observation est obligatoire pour Autre.", 400)
  await updateSheetRecordById(env.googleSheets.competitionsSpreadsheetId, "COMPETITIONS_DISTINCTIONS", "id_distinction_competition", distinctionId, { statut, observations })
  return { id: distinctionId }
}
