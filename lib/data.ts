import { getSheetCell, getSheetData, getSheetDataFrom, getSheetsDataFrom, type SheetRow } from "@/lib/google-sheets"
import { env } from "@/lib/env"
import type { Arbitre, Athlete, Club, Coach, Competition, CompetitionClassement, CompetitionParticipant, CompetitionResult, CompetitionUnite, Entente, EquipeNationale, EquipeNationaleCompetition, EquipeNationaleResultat, EquipeNationaleSelection, EquipeNationaleStaff, Ligue, Medecin, Officiel, Province, Transfert } from "@/lib/types"
import { mapProvinceRow } from "@/lib/mappers/provinces"
import { mapLigueRow } from "@/lib/mappers/ligues"
import { mapEntenteRow } from "@/lib/mappers/ententes"
import { mapClubRow } from "@/lib/mappers/clubs"
import { mapAthleteRow } from "@/lib/mappers/athletes"
import { mapCoachRow } from "@/lib/mappers/coachs"
import { mapOfficielRow } from "@/lib/mappers/officiels"
import { mapMedecinRow } from "@/lib/mappers/medecins"
import { mapArbitreRow } from "@/lib/mappers/arbitres"
import { mapCompetitionRow } from "@/lib/mappers/competitions"
import { mapCompetitionParticipantRow } from "@/lib/mappers/competition-participants"
import { mapCompetitionUniteRow } from "@/lib/mappers/competition-unites"
import { mapCompetitionResultRow } from "@/lib/mappers/competition-results"
import { mapCompetitionClassementRow } from "@/lib/mappers/competition-classements"
import { getAthleteAffiliations } from "@/lib/actor-records"
import { mapEquipeNationaleRow } from "@/lib/mappers/equipe-nationale"
import { mapEquipeNationaleSelectionRow } from "@/lib/mappers/equipe-nationale-selections"
import { mapEquipeNationaleCompetitionRow } from "@/lib/mappers/equipe-nationale-competitions"
import { mapEquipeNationaleResultatRow } from "@/lib/mappers/equipe-nationale-resultats"
import { mapEquipeNationaleStaffRow } from "@/lib/mappers/equipe-nationale-staff"
import { getActorSexes, getArbitreGrades, getCoachLevels, getMedecinSpecialties } from "@/lib/actor-references"

function computeProvinceCompletude(p: Province): number {
  const fields: Array<string> = [p.id, p.nom, p.chefLieu, p.responsable, p.telephone, p.email, String(p.statut)]
  const filled = fields.filter((v) => String(v).trim().length > 0).length
  return Math.round((filled / fields.length) * 100)
}

const cell = (row: SheetRow | undefined, key: string) => String(row?.[key] ?? "").trim()

async function getTerritorialHierarchy() {
  const [territorial, references, sexes] = await Promise.all([
    getSheetsDataFrom(env.googleSheets.territorialSpreadsheetId, [
      "LIGUES!A:ZZ",
      "ENTENTES!A:ZZ",
      "CLUBS!A:ZZ",
    ]),
    getSheetsDataFrom(env.googleSheets.referentielsSpreadsheetId, [
      "PROVINCES!A:ZZ",
      "VILLES!A:ZZ",
      "CATEGORIES_CLUB!A:ZZ",
    ]),
    getActorSexes(),
  ])

  const provinces = (references.PROVINCES ?? []).map(mapProvinceRow).filter((item) => item.id && item.nom)
  const provincesById = new Map(provinces.map((item) => [item.idProvince, item]))
  const citiesById = new Map((references.VILLES ?? []).map((row) => [cell(row, "id_ville"), cell(row, "nom_ville")]))
  const categoriesById = new Map((references.CATEGORIES_CLUB ?? []).map((row) => [cell(row, "id_categorie_club"), cell(row, "nom_categorie_club")]))
  const sexesById = new Map(sexes.map((option) => [option.id, option.nom]))

  const ligues = (territorial.LIGUES ?? []).map((row) => {
    const province = provincesById.get(cell(row, "id_province"))
    return mapLigueRow({ ...row, nom_province: province?.nomProvince ?? "" })
  }).filter((item) => item.id && item.nom)
  const liguesById = new Map(ligues.map((item) => [item.idLigue, item]))

  const ententes = (territorial.ENTENTES ?? []).map((row) => {
    const ligue = liguesById.get(cell(row, "id_ligue"))
    return mapEntenteRow({
      ...row,
      nom_ligue: ligue?.nomLigue ?? "",
      id_province: ligue?.idProvince ?? "",
      nom_province: ligue?.nomProvince ?? "",
      nom_ville: citiesById.get(cell(row, "id_ville")) ?? "",
    })
  }).filter((item) => item.id && item.nom)
  const ententesById = new Map(ententes.map((item) => [item.idEntente, item]))

  const clubs = (territorial.CLUBS ?? []).map((row) => {
    const entente = ententesById.get(cell(row, "id_entente"))
    const ligue = entente ? liguesById.get(entente.idLigue) : undefined
    const categoryId = cell(row, "id_categorie_club")
    const sexId = cell(row, "id_sexe")
    return mapClubRow({
      ...row,
      nom_entente: entente?.nomEntente ?? "",
      pseudo_entente: entente?.pseudoEntente ?? "",
      id_ligue: ligue?.idLigue ?? "",
      nom_ligue: ligue?.nomLigue ?? "",
      id_province: ligue?.idProvince ?? "",
      nom_province: ligue?.nomProvince ?? "",
      nom_categorie_club: categoriesById.get(categoryId) ?? "",
      nom_sexe: sexesById.get(sexId) ?? "",
      nom_ville: citiesById.get(cell(row, "id_ville")) ?? "",
    })
  }).filter((item) => item.id && item.nom)

  return { provinces, ligues, ententes, clubs }
}

export async function getProvinces(): Promise<Province[]> {
  const [territorial, athletes, arbitres, medecins] = await Promise.all([
    getTerritorialHierarchy(),
    getAthletes(),
    getArbitres(),
    getMedecins(),
  ])
  const { provinces: base, ligues, ententes, clubs } = territorial

  return base
    .map((p) => {
      const provinceLigues = ligues.filter((l) => l.provinceId === p.id || l.provinceNom === p.nom)
      const provinceEntentes = ententes.filter((e) => e.provinceId === p.id || e.provinceNom === p.nom)
      const provinceClubs = clubs.filter((c) => c.provinceId === p.id || c.provinceNom === p.nom)
      const provinceAthletes = athletes.filter((a) => a.provinceId === p.id || a.provinceNom === p.nom)
      const provinceArbitres = arbitres.filter((a) => a.provinceId === p.id || a.provinceNom === p.nom)
      const provinceMedecins = medecins.filter((m) => m.provinceId === p.id || m.provinceNom === p.nom)

      const withCounts: Province = {
        ...p,
        ligues: provinceLigues.length,
        ententes: provinceEntentes.length,
        clubs: provinceClubs.length,
        athletes: provinceAthletes.length,
        coachs: 0,
        arbitres: provinceArbitres.length,
        medecins: provinceMedecins.length,
        completude: computeProvinceCompletude(p),
      }

      return withCounts
    })
    .sort((a, b) => a.nom.localeCompare(b.nom))
}

export async function getProvinceOptions(): Promise<Province[]> {
  const rows = await getSheetDataFrom(
    env.googleSheets.referentielsSpreadsheetId,
    "PROVINCES!A:B",
  )
  return rows
    .map(mapProvinceRow)
    .filter((province) => province.id && province.nom)
    .sort((a, b) => a.nom.localeCompare(b.nom))
}

export async function getLigues(): Promise<Ligue[]> {
  return (await getTerritorialHierarchy()).ligues
}

export async function getEntentes(): Promise<Entente[]> {
  return (await getTerritorialHierarchy()).ententes
}

export async function getClubs(): Promise<Club[]> {
  return (await getTerritorialHierarchy()).clubs
}

export async function getAthletes(): Promise<Athlete[]> {
  const [rows, sexes] = await Promise.all([
    getSheetDataFrom(env.googleSheets.acteursSpreadsheetId, "ATHLETES!A:ZZ"),
    getActorSexes(),
  ])
  const sexesById = new Map(sexes.map((option) => [option.id, option.nom]))
  return rows
    .map((row) => mapAthleteRow({ ...row, nom_sexe: sexesById.get(cell(row, "id_sexe")) ?? "" }))
    .filter((a) => a.id && a.nomComplet)
}

export async function getCoachs(): Promise<Coach[]> {
  const [rows, sexes, levels] = await Promise.all([
    getSheetDataFrom(env.googleSheets.acteursSpreadsheetId, "COACHS!A:ZZ"),
    getActorSexes(),
    getCoachLevels(),
  ])
  const sexesById = new Map(sexes.map((option) => [option.id, option.nom]))
  const levelsById = new Map(levels.map((option) => [option.id, option.nom]))
  return rows
    .map((row) => mapCoachRow({
      ...row,
      nom_sexe: sexesById.get(cell(row, "id_sexe")) ?? "",
      nom_niveau_coach: levelsById.get(cell(row, "id_niveau")) ?? "",
    }))
    .filter((c) => c.id && c.nomComplet)
}

export async function getOfficiels(): Promise<Officiel[]> {
  const [rows, sexes] = await Promise.all([getSheetDataFrom(env.googleSheets.acteursSpreadsheetId, "OFFICIELS!A:ZZ"), getActorSexes()])
  const sexesById = new Map(sexes.map((option) => [option.id, option.nom]))
  return rows.map((row) => mapOfficielRow({ ...row, nom_sexe: sexesById.get(cell(row, "id_sexe")) ?? "" })).filter((o) => o.id && o.nomComplet)
}

export async function getMedecins(): Promise<Medecin[]> {
  const [rows, sexes, specialties] = await Promise.all([
    getSheetDataFrom(env.googleSheets.acteursSpreadsheetId, "MEDECINS!A:ZZ"),
    getActorSexes(),
    getMedecinSpecialties(),
  ])
  const sexesById = new Map(sexes.map((option) => [option.id, option.nom]))
  const specialtiesById = new Map(specialties.map((option) => [option.id, option.nom]))
  return rows.map((row) => mapMedecinRow({
    ...row,
    nom_sexe: sexesById.get(cell(row, "id_sexe")) ?? "",
    nom_specialite: specialtiesById.get(cell(row, "id_specialite") || cell(row, "id_specialite_sante")) ?? "",
  })).filter((m) => m.id && m.nomComplet)
}

export async function getArbitres(): Promise<Arbitre[]> {
  const [rows, sexes, grades] = await Promise.all([
    getSheetDataFrom(env.googleSheets.acteursSpreadsheetId, "ARBITRES!A:ZZ"),
    getActorSexes(),
    getArbitreGrades(),
  ])
  const sexeById = new Map(sexes.map((option) => [option.id, option.nom]))
  const gradeById = new Map(grades.map((option) => [option.id, option.nom]))
  return rows.map((row) => mapArbitreRow({
    ...row,
    nom_sexe: sexeById.get(String(row.id_sexe ?? "").trim()) ?? "",
    nom_grade_arbitre: gradeById.get(String(row.id_niveau ?? "").trim()) ?? "",
  })).filter((a) => a.id && a.nomComplet)
}

export async function getCompetitions(): Promise<Competition[]> {
  if (!env.googleSheets.competitionsSpreadsheetId) {
    console.warn("FEACO_COMPETITIONS_SPREADSHEET_ID non configuré")
    return []
  }
  const rows = await getSheetDataFrom(env.googleSheets.competitionsSpreadsheetId, "COMPETITIONS!A:Z")
  return rows.map(mapCompetitionRow).filter((competition) => competition.idCompetition && competition.nomCompetition)
}

export async function getCompetitionParticipants(): Promise<CompetitionParticipant[]> {
  if (!env.googleSheets.competitionsSpreadsheetId) return []
  const rows = await getSheetDataFrom(env.googleSheets.competitionsSpreadsheetId, "COMPETITIONS_PARTICIPANTS!A:Z")
  return rows
    .map(mapCompetitionParticipantRow)
    .filter((participant) => participant.idParticipation && participant.idCompetition)
}

export async function getCompetitionUnites(): Promise<CompetitionUnite[]> {
  if (!env.googleSheets.competitionsSpreadsheetId) return []
  const rows = await getSheetDataFrom(env.googleSheets.competitionsSpreadsheetId, "COMPETITIONS_UNITES!A:Z")
  return rows
    .map(mapCompetitionUniteRow)
    .filter((unite) => unite.idUnite && unite.idCompetition)
}

export async function getCompetitionResults(): Promise<CompetitionResult[]> {
  if (!env.googleSheets.competitionsSpreadsheetId) return []
  const rows = await getSheetDataFrom(env.googleSheets.competitionsSpreadsheetId, "COMPETITIONS_RESULTATS!A:Z")
  return rows
    .map(mapCompetitionResultRow)
    .filter((result) => result.idResultat && result.idCompetition)
}

export async function getCompetitionClassements(): Promise<CompetitionClassement[]> {
  if (!env.googleSheets.competitionsSpreadsheetId) return []
  const rows = await getSheetDataFrom(env.googleSheets.competitionsSpreadsheetId, "COMPETITIONS_CLASSEMENT!A:Z")
  return rows
    .map(mapCompetitionClassementRow)
    .filter((classement) => classement.idClassement && classement.idUnite && (classement.idCompetition || classement.nomCompetition))
}

export async function getCompetitionById(idCompetition: string): Promise<Competition | undefined> {
  return (await getCompetitions()).find((item) => item.idCompetition === idCompetition)
}
export async function getCompetitionUnitsByCompetition(idCompetition: string) {
  return (await getCompetitionUnites()).filter((item) => item.idCompetition === idCompetition)
}
export async function getCompetitionParticipantsByCompetition(idCompetition: string) {
  return (await getCompetitionParticipants()).filter((item) => item.idCompetition === idCompetition)
}
export async function getCompetitionParticipantsByUnit(idUnite: string) {
  return (await getCompetitionParticipants()).filter((item) => item.idUnite === idUnite)
}
export async function getCompetitionResultsByCompetition(idCompetition: string) {
  return (await getCompetitionResults()).filter((item) => item.idCompetition === idCompetition)
}
export async function getCompetitionStandingsByCompetition(idCompetition: string) {
  return (await getCompetitionClassements()).filter((item) => item.idCompetition === idCompetition)
}

export async function getTransferts(): Promise<Transfert[]> {
  return (await getAthleteAffiliations())
    .map((item) => ({
      id: item.idAffiliation,
      athleteId: item.actorId,
      athleteNom: item.actorName,
      clubOrigineId: item.idClubOrigine,
      clubOrigineNom: item.nomClubOrigine,
      clubBeneficiaireId: item.idClubBeneficiaire,
      clubBeneficiaireNom: item.nomClubBeneficiaire,
      typeTransfert: item.typeAffiliation,
      saison: item.saison,
      statut: item.statutAffiliation,
      dateValidation: item.dateDebut,
      dateDebut: item.dateDebut,
      dateFin: item.dateFin,
      observation: item.observation,
    }))
}

export async function getEquipeNationale(): Promise<EquipeNationale[]> {
  if (!env.googleSheets.equipeNationaleSpreadsheetId) {
    console.warn("FEACO_EQUIPE_NATIONALE_SPREADSHEET_ID non configuré")
    return []
  }
  const rows = await getSheetDataFrom(env.googleSheets.equipeNationaleSpreadsheetId, "EQUIPE_NATIONALE!A:Z")
  return rows
    .map(mapEquipeNationaleRow)
    .filter((equipe) => equipe.idEquipeNationale && equipe.nomEquipeNationale)
}

export async function getEquipeNationaleSelections(): Promise<EquipeNationaleSelection[]> {
  if (!env.googleSheets.equipeNationaleSpreadsheetId) return []
  const rows = await getSheetDataFrom(env.googleSheets.equipeNationaleSpreadsheetId, "EQUIPE_NATIONALE_SELECTIONS!A:Z")
  return rows
    .map(mapEquipeNationaleSelectionRow)
    .filter((selection) => selection.idSelection && selection.idEquipeNationale && selection.nomAthlete)
}

export async function getEquipeNationaleCompetitions(): Promise<EquipeNationaleCompetition[]> {
  if (!env.googleSheets.equipeNationaleSpreadsheetId) return []
  const rows = await getSheetDataFrom(env.googleSheets.equipeNationaleSpreadsheetId, "EQUIPE_NATIONALE_COMPETITIONS!A:Z")
  return rows
    .map(mapEquipeNationaleCompetitionRow)
    .filter((participation) => participation.idParticipationEquipeNationale && participation.idEquipeNationale)
}

export async function getEquipeNationaleResultats(): Promise<EquipeNationaleResultat[]> {
  if (!env.googleSheets.equipeNationaleSpreadsheetId) return []
  const rows = await getSheetDataFrom(env.googleSheets.equipeNationaleSpreadsheetId, "EQUIPE_NATIONALE_RESULTATS!A:Z")
  return rows
    .map(mapEquipeNationaleResultatRow)
    .filter((resultat) => resultat.idResultatEquipeNationale && resultat.idEquipeNationale)
}

export async function getEquipeNationaleStaff(): Promise<EquipeNationaleStaff[]> {
  if (!env.googleSheets.equipeNationaleSpreadsheetId) return []
  const rows = await getSheetDataFrom(env.googleSheets.equipeNationaleSpreadsheetId, "EQUIPE_NATIONALE_STAFF!A:Z")
  return rows.map(mapEquipeNationaleStaffRow).filter((item) => item.idStaffSelection && item.idEquipeNationale)
}

export async function getEquipeNationaleById(idEquipeNationale: string) {
  return (await getEquipeNationale()).find((item) => item.idEquipeNationale === idEquipeNationale)
}
export async function getSelectionsByEquipeNationale(idEquipeNationale: string) {
  return (await getEquipeNationaleSelections()).filter((item) => item.idEquipeNationale === idEquipeNationale)
}
export async function getStaffByEquipeNationale(idEquipeNationale: string) {
  return (await getEquipeNationaleStaff()).filter((item) => item.idEquipeNationale === idEquipeNationale)
}
export async function getCompetitionsByEquipeNationale(idEquipeNationale: string) {
  return (await getEquipeNationaleCompetitions()).filter((item) => item.idEquipeNationale === idEquipeNationale)
}
export async function getResultatsByEquipeNationale(idEquipeNationale: string) {
  return (await getEquipeNationaleResultats()).filter((item) => item.idEquipeNationale === idEquipeNationale)
}

export async function getEquipeNationaleParticipantsCount(): Promise<number> {
  const rows = await getSheetData("EQUIPE_NATIONALE_PARTICIPANTS")
  return rows.length
}

export async function getDerniereMiseAJour(): Promise<string> {
  return getSheetCell("VALIDATIONS!A1")
}
