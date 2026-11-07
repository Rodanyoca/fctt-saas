import { getArbitreLicences, getAthleteLicences, getCoachLicences, getMedecinLicences, getOfficielLicences } from "@/lib/actor-records"
import { getArbitres, getAthletes, getCoachs, getMedecins, getOfficiels } from "@/lib/data"
import { env } from "@/lib/env"
import { appendSheetRecord } from "@/lib/google-sheets"
import { competitionData, loadCompetitionBundle, type CompetitionBundle } from "@/lib/competitions-v2"
import { CompetitionDomainError } from "@/lib/competition-structure"
import type { BaseActorLicence } from "@/lib/types"

const clean = (value: unknown) => String(value ?? "").trim()
const normalized = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase()
export type CompetitionPersonOption = { id: string; label: string; typeId: string; typeLabel: string; clubId: string; licenceNumber: string; licenceStatus: string }

function currentLicence(licences: BaseActorLicence[], actorId: string, start: string, end: string) {
  const candidates = licences.filter((item) => item.actorId === actorId).sort((a, b) => b.dateDelivrance.localeCompare(a.dateDelivrance))
  const licence = candidates.find((item) => (!item.dateDelivrance || item.dateDelivrance <= end) && (!item.dateFinValidite || item.dateFinValidite >= start)) ?? candidates[0]
  if (!licence) return { licenceNumber: "—", licenceStatus: "NON RENSEIGNÉE" }
  const valid = (!licence.dateFinValidite || licence.dateFinValidite >= start) && normalized(licence.statutLicence) === "ACTIF"
  return { licenceNumber: licence.numeroLicence || "—", licenceStatus: valid ? "VALIDE" : "À VÉRIFIER" }
}

export async function competitionPeopleOptions(competitionId: string, loadedBundle?: CompetitionBundle) {
  const bundle = loadedBundle ?? await loadCompetitionBundle(), competition = bundle.competitions.find((item) => item.id === competitionId)
  if (!competition) return []
  const [athletes, coaches, referees, officials, doctors, athleteLicences, coachLicences, refereeLicences, officialLicences, doctorLicences] = await Promise.all([getAthletes(), getCoachs(), getArbitres(), getOfficiels(), getMedecins(), getAthleteLicences(), getCoachLicences(), getArbitreLicences(), getOfficielLicences(), getMedecinLicences()])
  const types = bundle.references.TYPES_ACTEURS ?? []
  const type = (terms: string[]) => types.find((item) => terms.some((term) => normalized(item.label).includes(term)))
  const groups: Array<{ ref?: { id: string; label: string }; actors: Array<{ id: string; name: string; clubId?: string }>; licences: BaseActorLicence[] }> = [
    { ref: type(["ATHLETE", "JOUEUR"]), actors: athletes.map((item) => ({ id: item.idAthlete, name: item.nomComplet, clubId: item.clubId })), licences: athleteLicences },
    { ref: type(["COACH", "ENTRAINEUR"]), actors: coaches.map((item) => ({ id: item.idCoach, name: item.nomComplet })), licences: coachLicences },
    { ref: type(["ARBITRE"]), actors: referees.map((item) => ({ id: item.idArbitre, name: item.nomComplet })), licences: refereeLicences },
    { ref: type(["OFFICIEL"]), actors: officials.map((item) => ({ id: item.idOfficiel, name: item.nomComplet })), licences: officialLicences },
    { ref: type(["MEDECIN", "SANTE"]), actors: doctors.map((item) => ({ id: item.idMedecin, name: item.nomComplet })), licences: doctorLicences },
  ]
  return groups.flatMap(({ ref, actors, licences }) => ref ? actors.map((actor) => ({ id: actor.id, label: actor.name, typeId: ref.id, typeLabel: ref.label, clubId: actor.clubId ?? "", ...currentLicence(licences, actor.id, competition.dateDebut, competition.dateFin) })) : [])
}

export async function addCompetitionPerson(competitionId: string, input: Record<string, unknown>) {
  const [bundle, options] = await Promise.all([loadCompetitionBundle(), competitionPeopleOptions(competitionId)]), detail = competitionData(bundle, competitionId)
  if (!detail) throw new CompetitionDomainError("Compétition introuvable.", 404)
  if (detail.competition.statut === "TERMINEE") throw new CompetitionDomainError("Cette compétition est clôturée.", 409)
  const actorId = clean(input.id_acteur), typeId = clean(input.id_type_acteur), unitId = clean(input.id_unite_competition), clubId = clean(input.id_club), role = clean(input.role_participant), observations = clean(input.observations)
  const actor = options.find((item) => item.id === actorId && item.typeId === typeId)
  if (!actor) throw new CompetitionDomainError("Acteur ou type d’acteur invalide.", 400)
  if (!role) throw new CompetitionDomainError("Le rôle est obligatoire.", 400, { role_participant: "Rôle obligatoire." })
  if (unitId && !detail.unites.some((row) => clean(row.id_unite_competition) === unitId)) throw new CompetitionDomainError("Unité étrangère à la compétition.", 400)
  if (detail.intervenants.some((row) => clean(row.id_acteur) === actorId && clean(row.id_type_acteur) === typeId && clean(row.id_unite_competition) === unitId && clean(row.role_participant) === role && clean(row.statut) === "ACTIF")) throw new CompetitionDomainError("Cet intervenant actif est déjà enregistré avec ce rôle.", 409)
  const match = competitionId.match(/^VOL-COMP-(\d{4})-(\d{3})$/), prefix = `VOL-INV-${match?.[1] ?? new Date().getUTCFullYear()}-${match?.[2] ?? "000"}-`, used = new Set(detail.intervenants.map((row) => clean(row.id_intervenant_competition)))
  let sequence = Math.max(0, ...[...used].filter((id) => id.startsWith(prefix)).map((id) => Number(id.slice(prefix.length)) || 0)) + 1, id = `${prefix}${String(sequence).padStart(3, "0")}`; while (used.has(id)) id = `${prefix}${String(++sequence).padStart(3, "0")}`
  await appendSheetRecord(env.googleSheets.competitionsSpreadsheetId, "COMPETITIONS_INTERVENANTS", { id_intervenant_competition: id, id_competition: competitionId, type_participant: actor.typeLabel, id_acteur: actorId, id_type_acteur: typeId, id_unite_competition: unitId, id_fonction: clean(input.id_fonction), id_club: clubId || actor.clubId, role_participant: role, statut: "ACTIF", observations })
  return { id, licenceStatus: actor.licenceStatus }
}
