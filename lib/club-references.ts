import "server-only"

import { env } from "@/lib/env"
import { getSheetDataFrom } from "@/lib/google-sheets"
import { compareLabels } from "@/lib/sort-utils"

export type ClubReferenceOption = {
  id: string
  nom: string
}

function value(row: Record<string, unknown>, key: string): string {
  return String(row[key] ?? "").trim()
}

async function getReferenceOptions(
  sheetName: string,
  idHeader: string,
  nameHeader: string,
): Promise<ClubReferenceOption[]> {
  if (!env.googleSheets.referentielsSpreadsheetId) return []
  const rows = await getSheetDataFrom(
    env.googleSheets.referentielsSpreadsheetId,
    `${sheetName}!A:B`,
  )
  const options = rows
    .map((row) => {
      const nom = value(row, nameHeader)
      return {
        id: value(row, idHeader) || `${sheetName}:${nom}`,
        nom,
      }
    })
    .filter((option) => option.nom)
  const unique = new Map<string, ClubReferenceOption>()
  for (const option of options) {
    const key = option.nom.normalize("NFD").replace(/\p{Diacritic}/gu, "").toLowerCase()
    if (!unique.has(key)) unique.set(key, option)
  }
  return Array.from(unique.values()).sort((left, right) => compareLabels(left.nom, right.nom))
}

export function getClubCategories() {
  return getReferenceOptions("CATEGORIES_CLUB", "id_categorie_club", "nom_categorie_club")
}

export function getClubSexes() {
  return getReferenceOptions("SEXES", "id_sexe", "nom_sexe")
}
