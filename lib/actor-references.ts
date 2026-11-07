import "server-only"

import { env } from "@/lib/env"
import { getSheetDataFrom } from "@/lib/google-sheets"
import { compareLabels } from "@/lib/sort-utils"

export type ActorSexOption = { id: string; nom: string }
export type TransferTypeOption = { id: string; nom: string }
export type CoachReferenceOption = { id: string; nom: string }

export async function getActorSexes(): Promise<ActorSexOption[]> {
  if (!env.googleSheets.referentielsSpreadsheetId) return []
  let rows: Record<string, unknown>[] = []
  for (const sheetName of ["SEXES", "ACTEURS_SEXE"]) {
    try {
      rows = await getSheetDataFrom(env.googleSheets.referentielsSpreadsheetId, `${sheetName}!A:C`)
    } catch {
      continue
    }
    if (rows.length) break
  }
  const unique = new Map<string, ActorSexOption>()
  for (const row of rows) {
    const nom = String(row.nom_sexe ?? row.sexe ?? row.nom ?? "").trim()
    if (!nom) continue
    const key = nom.toLowerCase()
    if (!unique.has(key)) {
      unique.set(key, { id: String(row.id_sexe ?? "").trim() || `SEXES:${nom}`, nom })
    }
  }
  return Array.from(unique.values()).sort((a, b) => compareLabels(a.nom, b.nom))
}

export async function getTransferTypes(): Promise<TransferTypeOption[]> {
  if (!env.googleSheets.referentielsSpreadsheetId) return []
  const rows = await getSheetDataFrom(env.googleSheets.referentielsSpreadsheetId, "TYPES_TRANSFERT!A:C")
  const unique = new Map<string, TransferTypeOption>()
  for (const row of rows) {
    const nom = String(row.nom_type_transfert ?? row.nom_transfert ?? row.nom ?? "").trim()
    if (!nom) continue
    const key = nom.toLowerCase()
    if (!unique.has(key)) {
      unique.set(key, {
        id: String(row.id_type_transfert ?? row.id_transfert ?? row.id ?? "").trim() || `TYPES_TRANSFERT:${nom}`,
        nom,
      })
    }
  }
  return Array.from(unique.values()).sort((a, b) => compareLabels(a.nom, b.nom))
}

async function referenceOptions(sheetNames: string[], idKeys: string[], nameKeys: string[], requireStableId = false): Promise<CoachReferenceOption[]> {
  if (!env.googleSheets.referentielsSpreadsheetId) return []
  let rows: Record<string, unknown>[] = []
  for (const sheetName of sheetNames) {
    rows = await getSheetDataFrom(env.googleSheets.referentielsSpreadsheetId, `${sheetName}!A:C`)
    if (rows.length) break
  }
  const unique = new Map<string, CoachReferenceOption>()
  for (const row of rows) {
    const nom = nameKeys.map((key) => String(row[key] ?? "").trim()).find(Boolean) ?? ""
    if (!nom) continue
    const key = nom.toLowerCase()
    const id = idKeys.map((idKey) => String(row[idKey] ?? "").trim()).find(Boolean) ?? ""
    if (requireStableId && !id) continue
    if (!unique.has(key)) unique.set(key, { id: id || `${sheetNames[0]}:${nom}`, nom })
  }
  return Array.from(unique.values()).sort((a, b) => compareLabels(a.nom, b.nom))
}

export const getActorAffiliationTypes = () =>
  referenceOptions(
    ["TYPES_AFFILIATIONS_ACTEURS"],
    ["id_type", "id_type_affiliation", "id"],
    ["nom_type", "nom_type_affiliation", "nom"],
  )

export const getMedecinSpecialties = () =>
  referenceOptions(
    ["SPECIALITE_MEDECIN"],
    ["id_specialite"],
    ["nom_specialite", "specialite", "nom"],
    true,
  )

export const getCoachFunctions = () =>
  referenceOptions(
    ["FONCTION_COACH"],
    ["id_fonction_coach", "id_fonction", "id"],
    ["nom_fonction_coach", "nom_fonction", "fonction", "nom"],
  )

export const getCoachLevels = () =>
  referenceOptions(
    ["NIVEAUX_COACH"],
    ["id_niveau_coach", "id_niveau", "id"],
    ["nom_niveau_coach", "nom_niveau", "niveau", "nom"],
  )

export const getArbitreGrades = () =>
  referenceOptions(
    ["GRADES_ARBITRES"],
    ["id_grade_arbitre"],
    ["nom_grade_arbitre"],
  )

export const getOfficialFunctions = () =>
  referenceOptions(
    ["FONCTION_OFFICIEL"],
    ["id_fonction", "id"],
    ["nom_fonction", "fonction", "nom"],
    true,
  )

export const getStructureTypes = () => referenceOptions(["TYPES_STRUCTURES"], ["id_type_structure"], ["nom_type_structure"], true)
export const getSeasons = () => referenceOptions(["SAISON"], ["id_saison"], ["nom_saison"], true)
export async function getOfficialActorType() {
  const options = await referenceOptions(["TYPES_ACTEURS"], ["id_type_acteur"], ["nom_type_acteur"], true)
  return options.find((option) => option.nom.trim().toUpperCase() === "OFFICIEL")
}
