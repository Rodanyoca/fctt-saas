import { formatDateForSheet } from "@/lib/compact-date"
import { getAthletes, getClubs } from "@/lib/data"
import { env } from "@/lib/env"
import { appendSheetRecordsBatch, type SheetRow } from "@/lib/google-sheets"
import { competitionData, loadCompetitionBundle } from "@/lib/competitions-v2"
import { CompetitionDomainError } from "@/lib/competition-structure"

const clean = (value: unknown) => String(value ?? "").trim()
function id(kind: "PAR" | "UNI" | "PHU" | "INV", competitionId: string, rows: SheetRow[], key: string) {
  const match = competitionId.match(/^VOL-COMP-(\d{4})-(\d{3})$/), prefix = `VOL-${kind}-${match?.[1] ?? new Date().getUTCFullYear()}-${match?.[2] ?? "000"}-`
  const used = new Set(rows.map((row) => clean(row[key]))), next = Math.max(0, ...[...used].filter((item) => item.startsWith(prefix)).map((item) => Number(item.slice(prefix.length)) || 0)) + 1
  return `${prefix}${String(next).padStart(3, "0")}`
}

export async function competitionEntryOptions() {
  const [clubs, athletes] = await Promise.all([getClubs(), getAthletes()])
  return {
    clubs: clubs.filter((item) => item.statut.toLowerCase() === "actif").map((item) => ({ id: item.idClub, label: item.nomClub })),
    athletes: athletes.filter((item) => item.statut.toLowerCase() === "actif").map((item) => ({ id: item.idAthlete, label: item.nomComplet, clubId: item.clubId, sexId: item.idSexe })),
  }
}

export async function createEntry(competitionId: string, input: Record<string, unknown>) {
  const [bundle, options] = await Promise.all([loadCompetitionBundle(), competitionEntryOptions()])
  const detail = competitionData(bundle, competitionId)
  if (!detail) throw new CompetitionDomainError("Compétition introuvable.", 404)
  if (detail.competition.statut === "TERMINEE") throw new CompetitionDomainError("Cette compétition est clôturée.", 409)
  const eventId = clean(input.id_epreuve_competition), phaseId = clean(input.id_phase_competition), groupId = clean(input.id_groupe), clubId = clean(input.id_club), athleteA = clean(input.id_athlete_a), athleteB = clean(input.id_athlete_b)
  const event = detail.epreuves.find((row) => clean(row.id_epreuve_competition) === eventId), phase = detail.phases.find((row) => clean(row.id_phase_competition) === phaseId && clean(row.id_epreuve_competition) === eventId)
  if (!event || !phase) throw new CompetitionDomainError("Épreuve ou phase invalide.", 400)
  const isBeach = clean(event.id_discipline) === "DISC009", typeId = isBeach ? "TUC002" : "TUC004"
  if (clean(phase.id_mode_phase) === "MPH001") { if (!groupId || !detail.groupes.some((row) => clean(row.id_groupe) === groupId && clean(row.id_phase_competition) === phaseId)) throw new CompetitionDomainError("Un groupe de la phase est obligatoire.", 400, { id_groupe: "Groupe invalide." }) } else if (groupId) throw new CompetitionDomainError("Cette phase n’accepte pas de groupe.", 400, { id_groupe: "Groupe interdit." })
  if (clubId && !options.clubs.some((item) => item.id === clubId)) throw new CompetitionDomainError("Club introuvable.", 400, { id_club: "Club invalide." })
  if (!isBeach && !clubId) throw new CompetitionDomainError("Le club est obligatoire en indoor.", 400, { id_club: "Club obligatoire." })
  if (isBeach) {
    if (!athleteA || !athleteB || athleteA === athleteB) throw new CompetitionDomainError("Une paire exige deux athlètes distincts.", 400)
    const selected = options.athletes.filter((item) => item.id === athleteA || item.id === athleteB)
    if (selected.length !== 2) throw new CompetitionDomainError("Un athlète est introuvable ou inactif.", 400)
    const eventSex = clean(event.id_sexe); if (eventSex !== "SEX003" && selected.some((item) => item.sexId && item.sexId !== eventSex)) throw new CompetitionDomainError("Le sexe d’un athlète est incompatible avec l’épreuve.", 400)
    const existingPairs = detail.unites.filter((row) => clean(row.id_type_unite_competition) === "TUC002" && clean(row.id_epreuve_competition) === eventId)
    const memberSets = existingPairs.map((unit) => new Set(detail.intervenants.filter((person) => clean(person.id_unite_competition) === clean(unit.id_unite_competition)).map((person) => clean(person.id_acteur))))
    if (memberSets.some((members) => members.size === 2 && members.has(athleteA) && members.has(athleteB))) throw new CompetitionDomainError("Cette paire est déjà engagée dans l’épreuve.", 409)
  } else if (detail.unites.some((row) => clean(row.id_epreuve_competition) === eventId && clean(row.id_club) === clubId && clean(row.statut) !== "INACTIF")) throw new CompetitionDomainError("Ce club est déjà engagé dans l’épreuve.", 409)
  let registrationDate = ""; try { registrationDate = formatDateForSheet(clean(input.date_inscription)) } catch { throw new CompetitionDomainError("Date d’inscription invalide.", 400, { date_inscription: "Date invalide." }) }
  const participationId = id("PAR", competitionId, detail.participants, "id_participation"), unitId = id("UNI", competitionId, detail.unites, "id_unite_competition"), phaseUnitId = id("PHU", competitionId, bundle.data.COMPETITIONS_PHASES_UNITES ?? [], "id_phase_unite")
  const records: Array<{ sheetName: string; record: Record<string, string> }> = [
    { sheetName: "COMPETITIONS_PARTICIPANTS", record: { id_participation: participationId, id_competition: competitionId, id_epreuve_competition: eventId, id_type_unite_competition: typeId, id_club: clubId, date_inscription: registrationDate, statut_participation: "ACTIF", observations: clean(input.observations) } },
    { sheetName: "COMPETITIONS_UNITES", record: { id_unite_competition: unitId, id_competition: competitionId, id_epreuve_competition: eventId, id_type_unite_competition: typeId, id_club: clubId, id_equipe_nationale_saison: "", id_participation: participationId, statut: "ACTIF", observations: clean(input.observations) } },
    { sheetName: "COMPETITIONS_PHASES_UNITES", record: { id_phase_unite: phaseUnitId, id_phase_competition: phaseId, id_groupe: groupId, id_unite_competition: unitId, id_type_affectation_phase: "TAP001", id_phase_source: "", id_match_source: "", date_affectation: registrationDate, statut: "ACTIF", observations: clean(input.observations) } },
  ]
  if (isBeach) for (const athleteId of [athleteA, athleteB]) records.push({ sheetName: "COMPETITIONS_INTERVENANTS", record: { id_intervenant_competition: id("INV", competitionId, [...detail.intervenants, ...records.filter((item) => item.sheetName === "COMPETITIONS_INTERVENANTS").map((item) => item.record as SheetRow)], "id_intervenant_competition"), id_competition: competitionId, type_participant: "ATHLETE", id_acteur: athleteId, id_type_acteur: "TAC001", id_unite_competition: unitId, id_fonction: "", id_club: options.athletes.find((item) => item.id === athleteId)?.clubId ?? "", role_participant: "JOUEUR", statut: "ACTIF", observations: "" } })
  await appendSheetRecordsBatch(env.googleSheets.competitionsSpreadsheetId, records)
  return { participationId, unitId, phaseUnitId }
}
