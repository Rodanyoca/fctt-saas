import "server-only"

import { env } from "@/lib/env"
import { getSheetDataFrom, getSheetsDataFrom } from "@/lib/google-sheets"
import { mapAutreActeurRow, mapTypeAutreActeurRow } from "@/lib/mappers/autres-acteurs"
import type { ActorSexOption } from "@/lib/actor-references"
import type { AutreActeur, TypeAutreActeur } from "@/lib/types"

const text = (value: unknown) => String(value ?? "").trim()

export type AutresActeursBundle = { acteurs: AutreActeur[]; types: TypeAutreActeur[]; sexes: ActorSexOption[] }

export async function loadAutresActeurs(): Promise<AutresActeursBundle> {
  const [actorRows, references] = await Promise.all([
    getSheetDataFrom(env.googleSheets.acteursSpreadsheetId, "AUTRES!A:Z"),
    getSheetsDataFrom(env.googleSheets.referentielsSpreadsheetId, ["TYPES_AUTRES_ACTEURS!A:H", "SEXES!A:C"]),
  ])
  const types = (references.TYPES_AUTRES_ACTEURS ?? []).map(mapTypeAutreActeurRow).filter((item) => item.id && item.nom)
  const sexes = (references.SEXES ?? []).map((row) => ({ id: text(row.id_sexe), nom: text(row.nom_sexe) })).filter((item) => item.id && item.nom)
  const typesById = new Map(types.map((item) => [item.id, item.nom]))
  const sexesById = new Map(sexes.map((item) => [item.id, item.nom]))
  const acteurs = actorRows.map((row) => mapAutreActeurRow(row, sexesById, typesById)).filter((item) => item.idAutreActeur)
  const acteursById = new Map(acteurs.map((item) => [item.idAutreActeur, item]))
  if (acteursById.size !== acteurs.length) throw new Error("La feuille AUTRES contient des identifiants dupliqués.")
  const unknownTypeIds = [...new Set(acteurs.filter((item) => item.idTypeAutreActeur && !typesById.has(item.idTypeAutreActeur)).map((item) => item.idTypeAutreActeur))]
  if (unknownTypeIds.length) console.warn(`AUTRES contient des types non reconnus : ${unknownTypeIds.join(", ")}`)
  return { acteurs, types, sexes }
}
