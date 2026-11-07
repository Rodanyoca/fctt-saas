import "server-only"

import { getSheetDataFrom } from "@/lib/google-sheets"
import { env } from "@/lib/env"
import {
  mapAthleteAffiliation,
  mapAthleteLicence,
  mapCoachAffiliation,
  mapLicence,
  mapMedecinAffiliation,
  mapOfficielAffiliation,
} from "@/lib/mappers/actor-records"
import type {
  AthleteAffiliation,
  AthleteLicence,
  BaseActorLicence,
  CoachAffiliation,
  MedecinAffiliation,
  OfficielAffiliation,
} from "@/lib/types"
import { isMissingSheetRangeError } from "@/lib/optional-sheet"

async function rows(sheet: string) {
  if (!env.googleSheets.affiliationsSpreadsheetId) return []
  return getSheetDataFrom(env.googleSheets.affiliationsSpreadsheetId, `${sheet}!A:Z`)
}

async function licenceRows(sheet: string) {
  if (!env.googleSheets.licencesSpreadsheetId) return []
  return getSheetDataFrom(env.googleSheets.licencesSpreadsheetId, `${sheet}!A:Z`)
}

export const getAthleteAffiliations = async (): Promise<AthleteAffiliation[]> =>
  (await rows("ATHLETE_AFFILIATIONS")).map(mapAthleteAffiliation).filter((item) => item.actorId)
export const getCoachAffiliations = async (): Promise<CoachAffiliation[]> =>
  (await rows("COACH_AFFILIATIONS")).map(mapCoachAffiliation).filter((item) => item.actorId)
export const getMedecinAffiliations = async (): Promise<MedecinAffiliation[]> =>
  (await rows("MEDECIN_AFFILIATIONS")).map(mapMedecinAffiliation).filter((item) => item.actorId)
export const getOfficielAffiliations = async (): Promise<OfficielAffiliation[]> => {
  const affiliations = await rows("OFFICIELS_AFFILIATIONS")
  return affiliations.map(mapOfficielAffiliation).filter((item) => item.actorId)
}

async function optionalLicenceRows(sheet: string) {
  try { return await licenceRows(sheet) } catch (error) {
    if (isMissingSheetRangeError(error, sheet)) {
      console.warn(`Onglet facultatif ${sheet} absent : les licences seront affichées comme non renseignées.`)
      return []
    }
    throw error
  }
}

export const getAthleteLicences = async (): Promise<AthleteLicence[]> =>
  (await optionalLicenceRows("ATHLETE_LICENCES")).map(mapAthleteLicence).filter((item) => item.idLicence && item.actorId)

const actorTypeIds = { coach: "TAC002", officiel: "TAC003", arbitre: "TAC004", medecin: "TAC005" } as const
async function licences(kind: keyof typeof actorTypeIds) {
  return (await optionalLicenceRows("ACTEURS_LICENCES"))
    .filter((row) => String(row.id_type_acteur ?? "").trim() === actorTypeIds[kind])
    .map((row) => mapLicence(row, kind)).filter((item) => item.idLicence && item.actorId)
}
export const getCoachLicences = (): Promise<BaseActorLicence[]> => licences("coach")
export const getMedecinLicences = (): Promise<BaseActorLicence[]> => licences("medecin")
export const getOfficielLicences = (): Promise<BaseActorLicence[]> => licences("officiel")
export const getArbitreLicences = (): Promise<BaseActorLicence[]> => licences("arbitre")
