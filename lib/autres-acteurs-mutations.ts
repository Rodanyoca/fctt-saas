import "server-only"

import { env } from "@/lib/env"
import { appendSheetRecord, formatSheetDateColumn, updateSheetRecordById } from "@/lib/google-sheets"
import { loadAutresActeurs } from "@/lib/autres-acteurs"
import { autreActeurFormSchema } from "@/lib/autres-acteurs-schema"
import { formatDateForSheet } from "@/lib/compact-date"
import type { AutreActeur, TypeAutreActeur } from "@/lib/types"
import { isAutreActeurId, nextAutreActeurId, validateAutreActeurType } from "@/lib/autres-acteurs-domain"


function parsePayload(payload: Record<string, unknown>) {
  const parsed = autreActeurFormSchema.safeParse({
    nomComplet: String(payload.nomComplet ?? ""), idSexe: String(payload.idSexe ?? ""), dateNaissance: String(payload.dateNaissance ?? ""),
    lieuNaissance: String(payload.lieuNaissance ?? ""), nationalite: String(payload.nationalite ?? ""), idTypeAutreActeur: String(payload.idTypeAutreActeur ?? ""),
    telephone: String(payload.telephone ?? ""), email: String(payload.email ?? ""), adresse: String(payload.adresse ?? ""), numeroPasseport: String(payload.numeroPasseport ?? ""),
    dateDelivrancePasseport: String(payload.dateDelivrancePasseport ?? ""), dateExpirationPasseport: String(payload.dateExpirationPasseport ?? ""),
    statut: String(payload.statut ?? "ACTIF").trim().toUpperCase(), observations: String(payload.observations ?? ""),
  })
  if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? "Données invalides.")
  return parsed.data
}

function assertReferences(input: ReturnType<typeof parsePayload>, sexes: Array<{ id: string }>, types: TypeAutreActeur[], current?: AutreActeur) {
  if (!sexes.some((item) => item.id === input.idSexe)) throw new Error("Le sexe sélectionné est invalide.")
  return validateAutreActeurType(types, input.idTypeAutreActeur, current?.idTypeAutreActeur)
}

function sheetRecord(input: ReturnType<typeof parsePayload>) {
  return {
    nom_complet: input.nomComplet,
    id_sexe: input.idSexe,
    date_de_naissance: input.dateNaissance ? formatDateForSheet(input.dateNaissance) : "",
    lieu_de_naissance: input.lieuNaissance,
    nationalite: input.nationalite,
    id_type_autre_acteur: input.idTypeAutreActeur,
    telephone: input.telephone,
    email: input.email,
    adresse: input.adresse,
    numero_passeport: input.numeroPasseport,
    date_de_delivrance_passeport: input.dateDelivrancePasseport ? formatDateForSheet(input.dateDelivrancePasseport) : "",
    date_expiration_passeport: input.dateExpirationPasseport ? formatDateForSheet(input.dateExpirationPasseport) : "",
    statut: input.statut,
    observations: input.observations,
  }
}

async function formatDateColumns() {
  await Promise.all([
    formatSheetDateColumn(env.googleSheets.acteursSpreadsheetId, "AUTRES", "date_de_naissance", "yyyy-mm-dd"),
    formatSheetDateColumn(env.googleSheets.acteursSpreadsheetId, "AUTRES", "date_de_delivrance_passeport", "yyyy-mm-dd"),
    formatSheetDateColumn(env.googleSheets.acteursSpreadsheetId, "AUTRES", "date_expiration_passeport", "yyyy-mm-dd"),
  ])
}

function fallback(idAutreActeur: string, input: ReturnType<typeof parsePayload>, sexe: string, type: string, current?: AutreActeur): AutreActeur {
  const dates = sheetRecord(input)
  return {
    ...current,
    idAutreActeur, id: idAutreActeur, nomComplet: input.nomComplet, idSexe: input.idSexe, sexe,
    dateNaissance: dates.date_de_naissance, lieuNaissance: input.lieuNaissance, nationalite: input.nationalite,
    idTypeAutreActeur: input.idTypeAutreActeur, typeAutreActeur: type, telephone: input.telephone, email: input.email,
    adresse: input.adresse, numeroPasseport: input.numeroPasseport, dateDelivrancePasseport: dates.date_de_delivrance_passeport,
    dateExpirationPasseport: dates.date_expiration_passeport, statut: input.statut, observations: input.observations,
    avatarDriveId: current?.avatarDriveId ?? "", avatarDriveUrl: current?.avatarDriveUrl ?? "",
    passeportDriveId: current?.passeportDriveId ?? "", passeportDriveUrl: current?.passeportDriveUrl ?? "",
  }
}

export async function createAutreActeur(payload: Record<string, unknown>) {
  const input = parsePayload(payload)
  const bundle = await loadAutresActeurs()
  const type = assertReferences(input, bundle.sexes, bundle.types)
  const idAutreActeur = nextAutreActeurId(bundle.acteurs.map((item) => item.idAutreActeur))
  if (bundle.acteurs.some((item) => item.idAutreActeur === idAutreActeur)) throw new Error("Cet identifiant existe déjà.")
  await formatDateColumns()
  await appendSheetRecord(env.googleSheets.acteursSpreadsheetId, "AUTRES", { id_autre_acteur: idAutreActeur, ...sheetRecord(input) }, "OVERWRITE")
  const saved = (await loadAutresActeurs()).acteurs.find((item) => item.idAutreActeur === idAutreActeur)
  const sexe = bundle.sexes.find((item) => item.id === input.idSexe)?.nom ?? "Sexe non reconnu"
  return saved ?? fallback(idAutreActeur, input, sexe, type?.nom ?? "Type non reconnu")
}

export async function updateAutreActeur(idAutreActeur: string, payload: Record<string, unknown>) {
  if (!isAutreActeurId(idAutreActeur)) throw new Error("Identifiant d’autre acteur invalide.")
  const input = parsePayload(payload)
  const bundle = await loadAutresActeurs()
  const current = bundle.acteurs.find((item) => item.idAutreActeur === idAutreActeur)
  if (!current) throw new Error("Autre acteur introuvable.")
  const type = assertReferences(input, bundle.sexes, bundle.types, current)
  await formatDateColumns()
  await updateSheetRecordById(env.googleSheets.acteursSpreadsheetId, "AUTRES", "id_autre_acteur", idAutreActeur, sheetRecord(input))
  const saved = (await loadAutresActeurs()).acteurs.find((item) => item.idAutreActeur === idAutreActeur)
  const sexe = bundle.sexes.find((item) => item.id === input.idSexe)?.nom ?? "Sexe non reconnu"
  return saved ?? fallback(idAutreActeur, input, sexe, type?.nom ?? current.typeAutreActeur, current)
}
