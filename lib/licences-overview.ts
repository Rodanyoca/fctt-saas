import "server-only"
import { env } from "@/lib/env"
import { getSheetsDataFrom, type SheetRow } from "@/lib/google-sheets"
import { effectiveLicenceStatus } from "@/lib/licences-domain"

const clean = (value: unknown) => String(value ?? "").trim()
const index = (rows: SheetRow[], key: string): Map<string, SheetRow> => new Map(rows.map((row): [string, SheetRow] => [clean(row[key]), row]).filter(([id]) => Boolean(id)))
const label = (row: SheetRow | undefined, keys: string[], fallback = "—") => keys.map((key) => clean(row?.[key])).find(Boolean) || fallback

export type AthleteLicenceView = { id: string; athlete: string; numero: string; saison: string; club: string; entente: string; ligue: string; sexe: string; dateDelivrance: string; statut: string; athleteId: string; seasonId: string; clubId: string; ententeId: string; ligueId: string; sexId: string; statusId: string }
export type ActorLicenceView = { id: string; acteur: string; type: string; numero: string; cycle: string; affiliation: string; periode: string; statut: string; statutEffectif: string; typeId: string; cycleId: string; statusId: string; dateDelivrance: string; dateExpiration: string }

async function sources() {
  if (!env.googleSheets.licencesSpreadsheetId) throw new Error("Le classeur 04_FEACO_LICENCE n’est pas configuré.")
  const [licences, affiliations, actors, structures, refs] = await Promise.all([
    getSheetsDataFrom(env.googleSheets.licencesSpreadsheetId, ["ATHLETE_LICENCES!A:ZZ", "ACTEURS_LICENCES!A:ZZ"]),
    getSheetsDataFrom(env.googleSheets.affiliationsSpreadsheetId, ["ATHLETE_AFFILIATIONS!A:ZZ", "COACH_AFFILIATIONS!A:ZZ", "MEDECIN_AFFILIATIONS!A:ZZ", "OFFICIELS_AFFILIATIONS!A:ZZ"]),
    getSheetsDataFrom(env.googleSheets.acteursSpreadsheetId, ["ATHLETES!A:ZZ", "COACHS!A:ZZ", "OFFICIELS!A:ZZ", "ARBITRES!A:ZZ", "MEDECINS!A:ZZ"]),
    getSheetsDataFrom(env.googleSheets.territorialSpreadsheetId, ["CLUBS!A:ZZ", "ENTENTES!A:ZZ", "LIGUES!A:ZZ"]),
    getSheetsDataFrom(env.googleSheets.referentielsSpreadsheetId, ["SAISON!A:ZZ", "SEXES!A:ZZ", "STATUT_LICENCE!A:ZZ", "CYCLES_LICENCES!A:ZZ", "TYPES_ACTEURS!A:ZZ"]),
  ])
  return { licences, affiliations, actors, structures, refs }
}

export async function athleteLicenceOverview(): Promise<AthleteLicenceView[]> {
  const data = await sources(), athletes = index(data.actors.ATHLETES ?? [], "id_athlete"), affiliations = index(data.affiliations.ATHLETE_AFFILIATIONS ?? [], "id_affiliation_athlete"), clubs = index(data.structures.CLUBS ?? [], "id_club"), ententes = index(data.structures.ENTENTES ?? [], "id_entente"), ligues = index(data.structures.LIGUES ?? [], "id_ligue"), seasons = index(data.refs.SAISON ?? [], "id_saison"), sexes = index(data.refs.SEXES ?? [], "id_sexe"), statuses = index(data.refs.STATUT_LICENCE ?? [], "id_statut_licence")
  return (data.licences.ATHLETE_LICENCES ?? []).map((row) => { const athleteId = clean(row.id_athlete), athlete = athletes.get(athleteId), affiliation = affiliations.get(clean(row.id_affiliation_athlete)), clubId = clean(affiliation?.id_club), club = clubs.get(clubId), ententeId = clean(club?.id_entente), entente = ententes.get(ententeId), ligueId = clean(entente?.id_ligue), sexId = clean(athlete?.id_sexe), seasonId = clean(row.id_saison), statusId = clean(row.id_statut_licence); return { id: clean(row.id_licence), athleteId, athlete: label(athlete, ["nom_complet"], athleteId), numero: clean(row.numero_licence) || "—", seasonId, saison: label(seasons.get(seasonId), ["nom_saison"], seasonId), clubId, club: label(club, ["nom_club"], clubId), ententeId, entente: label(entente, ["nom_entente"], ententeId), ligueId, ligue: label(ligues.get(ligueId), ["nom_ligue"], ligueId), sexId, sexe: label(sexes.get(sexId), ["nom_sexe"], sexId), dateDelivrance: clean(row.date_delivrance), statusId, statut: label(statuses.get(statusId), ["nom_statut_licence"], statusId) } }).filter((row) => row.id)
}

export async function actorLicenceOverview(today = new Date().toISOString().slice(0, 10)): Promise<ActorLicenceView[]> {
  const data = await sources(), types = index(data.refs.TYPES_ACTEURS ?? [], "id_type_acteur"), cycles = index(data.refs.CYCLES_LICENCES ?? [], "id_cycle_licence"), statuses = index(data.refs.STATUT_LICENCE ?? [], "id_statut_licence")
  const actorConfigs: Record<string, [string, string]> = { TAC002: ["COACHS", "id_coach"], TAC003: ["OFFICIELS", "id_officiel"], TAC004: ["ARBITRES", "id_arbitre"], TAC005: ["MEDECINS", "id_medecin"] }
  const actors = Object.fromEntries(Object.entries(actorConfigs).map(([typeId, [sheet, key]]) => [typeId, index(data.actors[sheet] ?? [], key)]))
  const affiliations = new Map<string, SheetRow>(["COACH_AFFILIATIONS", "MEDECIN_AFFILIATIONS", "OFFICIELS_AFFILIATIONS"].flatMap((sheet) => (data.affiliations[sheet] ?? []).map((row) => [clean(row.id_affiliation_coach ?? row.id_affiliation_medecin ?? row.id_affiliation_officiel), row] as [string, SheetRow])))
  return (data.licences.ACTEURS_LICENCES ?? []).map((row) => { const typeId = clean(row.id_type_acteur), actorId = clean(row.id_acteur), cycleId = clean(row.id_cycle_licence), statusId = clean(row.id_statut_licence), start = clean(row.date_debut_validite), end = clean(row.date_fin_validite), affiliationId = clean(row.id_affiliation_acteur), storedStatus = label(statuses.get(statusId), ["nom_statut_licence"], statusId); return { id: clean(row.id_licence), acteur: label(actors[typeId]?.get(actorId), ["nom_complet"], actorId), typeId, type: label(types.get(typeId), ["nom_type_acteur"], typeId), numero: clean(row.numero_licence) || "—", cycleId, cycle: label(cycles.get(cycleId), ["nom_cycle_licence"], cycleId), affiliation: typeId === "TAC004" ? "Non applicable" : affiliations.has(affiliationId) ? affiliationId : "Affiliation historique non renseignée", periode: `${start || "—"} — ${end || "En cours"}`, dateDelivrance: clean(row.date_delivrance), dateExpiration: end, statusId, statut: storedStatus, statutEffectif: effectiveLicenceStatus(storedStatus, start, end, today) } }).filter((row) => row.id)
}
