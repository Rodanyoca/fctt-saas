import "server-only"

import { env } from "@/lib/env"
import { getActorSexes, getArbitreGrades } from "@/lib/actor-references"
import { nextActorId } from "@/lib/actor-id"
import { getArbitres } from "@/lib/data"
import { appendSheetRecord, formatSheetDateColumn, updateSheetRecordById } from "@/lib/google-sheets"
import { assertValidDate } from "@/lib/date-validation"

const text = (value: unknown) => String(value ?? "").trim()
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const statuses = new Set(["actif", "inactif", "active", "inactive"])

type ArbitreInput = {
  idNational: string; idFivb: string; nomComplet: string; idSexe: string
  dateNaissance: string; nationalite: string; idGrade: string
  telephone: string; email: string; adresse: string; statut: string
}

function normalizeInput(payload: Record<string, unknown>): ArbitreInput {
  return {
    idNational: text(payload.idNational), idFivb: text(payload.idFivb),
    nomComplet: text(payload.nomComplet), idSexe: text(payload.idSexe),
    dateNaissance: text(payload.dateNaissance), nationalite: text(payload.nationalite),
    idGrade: text(payload.idGrade), telephone: text(payload.telephone),
    email: text(payload.email), adresse: text(payload.adresse),
    statut: text(payload.statut).toLowerCase() || "actif",
  }
}

async function validateInput(input: ArbitreInput) {
  if (!input.nomComplet) throw new Error("Le nom est obligatoire.")
  if (!input.idSexe) throw new Error("Le sexe est obligatoire.")
  assertValidDate(input.dateNaissance, "La date de naissance")
  if (input.email && !emailPattern.test(input.email)) throw new Error("L’adresse e-mail est invalide.")
  if (!statuses.has(input.statut)) throw new Error("Le statut est invalide.")
  const [sexes, grades] = await Promise.all([getActorSexes(), getArbitreGrades()])
  const sexe = sexes.find((option) => option.id === input.idSexe)
  if (!sexe) throw new Error("Le sexe sélectionné est invalide.")
  const grade = input.idGrade ? grades.find((option) => option.id === input.idGrade) : undefined
  if (input.idGrade && !grade) throw new Error("Le grade sélectionné est invalide.")
  return { sexe, grade }
}

export async function createArbitre(payload: Record<string, unknown>) {
  const input = normalizeInput(payload)
  const references = await validateInput(input)
  const arbitres = await getArbitres()
  const idArbitre = nextActorId(arbitres.map((item) => item.idArbitre), "ABR")
  if (arbitres.some((item) => item.idArbitre === idArbitre)) throw new Error("Cet identifiant d’arbitre existe déjà.")
  await formatSheetDateColumn(env.googleSheets.acteursSpreadsheetId, "ARBITRES", "date_naissance")
  await appendSheetRecord(env.googleSheets.acteursSpreadsheetId, "ARBITRES", {
    id_arbitre: idArbitre, id_national: input.idNational, id_fivb: input.idFivb,
    nom_complet: input.nomComplet, id_sexe: input.idSexe, date_naissance: input.dateNaissance,
    nationalite: input.nationalite, id_niveau: input.idGrade, telephone: input.telephone,
    email: input.email, adresse: input.adresse, statut: input.statut,
  })
  return (await getArbitres()).find((item) => item.idArbitre === idArbitre) ?? {
    idArbitre, ...input, sexe: references.sexe.nom, grade: references.grade?.nom ?? "",
    niveau: references.grade?.nom ?? "", dateDeNaissance: input.dateNaissance,
    avatarDriveId: "", avatarDriveUrl: "",
  }
}

export async function updateArbitre(idArbitre: string, payload: Record<string, unknown>) {
  const input = normalizeInput(payload)
  const references = await validateInput(input)
  const current = (await getArbitres()).find((item) => item.idArbitre === idArbitre)
  if (!current) throw new Error("Arbitre introuvable.")
  await formatSheetDateColumn(env.googleSheets.acteursSpreadsheetId, "ARBITRES", "date_naissance")
  await updateSheetRecordById(env.googleSheets.acteursSpreadsheetId, "ARBITRES", "id_arbitre", idArbitre, {
    id_national: input.idNational, id_fivb: input.idFivb, nom_complet: input.nomComplet,
    id_sexe: input.idSexe, date_naissance: input.dateNaissance,
    nationalite: input.nationalite, id_niveau: input.idGrade, telephone: input.telephone,
    email: input.email, adresse: input.adresse, statut: input.statut,
  })
  return (await getArbitres()).find((item) => item.idArbitre === idArbitre) ?? {
    ...current, ...input, sexe: references.sexe.nom, grade: references.grade?.nom ?? "",
    niveau: references.grade?.nom ?? "", dateDeNaissance: input.dateNaissance,
  }
}

export async function updateArbitreAvatar(idArbitre: string, avatarDriveId: string, avatarDriveUrl: string) {
  const current = (await getArbitres()).find((item) => item.idArbitre === idArbitre)
  if (!current) throw new Error("Arbitre introuvable.")
  await updateSheetRecordById(env.googleSheets.acteursSpreadsheetId, "ARBITRES", "id_arbitre", idArbitre, {
    avatar_drive_id: avatarDriveId, avatar_drive_url: avatarDriveUrl,
  })
  return (await getArbitres()).find((item) => item.idArbitre === idArbitre)
    ?? { ...current, avatarDriveId, avatarDriveUrl }
}
