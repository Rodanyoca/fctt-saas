import "server-only"

import { env } from "@/lib/env"
import { getActorSexes, getCoachLevels } from "@/lib/actor-references"
import { nextActorId } from "@/lib/actor-id"
import { getCoachs } from "@/lib/data"
import { appendSheetRecord, formatSheetDateColumn, updateSheetRecordById } from "@/lib/google-sheets"
import { assertValidDate } from "@/lib/date-validation"

const text = (value: unknown) => String(value ?? "").trim()
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const statuses = new Set(["actif", "inactif", "active", "inactive"])

type CoachInput = {
  idNational: string; idFivb: string; nomComplet: string; idSexe: string
  dateNaissance: string; nationalite: string; idNiveau: string
  telephone: string; email: string; adresse: string; statut: string
}

function normalizeInput(payload: Record<string, unknown>): CoachInput {
  return {
    idNational: text(payload.idNational), idFivb: text(payload.idFivb),
    nomComplet: text(payload.nomComplet), idSexe: text(payload.idSexe),
    dateNaissance: text(payload.dateNaissance), nationalite: text(payload.nationalite),
    idNiveau: text(payload.idNiveau), telephone: text(payload.telephone),
    email: text(payload.email), adresse: text(payload.adresse),
    statut: text(payload.statut).toLowerCase() || "actif",
  }
}

async function validateInput(input: CoachInput) {
  if (!input.nomComplet) throw new Error("Le nom complet est obligatoire.")
  if (!input.idSexe) throw new Error("Le sexe est obligatoire.")
  assertValidDate(input.dateNaissance, "La date de naissance")
  if (input.email && !emailPattern.test(input.email)) throw new Error("L’adresse e-mail est invalide.")
  if (!statuses.has(input.statut)) throw new Error("Le statut est invalide.")
  const [sexes, levels] = await Promise.all([getActorSexes(), getCoachLevels()])
  const selectedSex = sexes.find((option) => option.id === input.idSexe)
  if (!selectedSex) throw new Error("Le sexe sélectionné est invalide.")
  const selectedLevel = input.idNiveau ? levels.find((option) => option.id === input.idNiveau) : undefined
  if (input.idNiveau && !selectedLevel) throw new Error("Le niveau sélectionné est invalide.")
  return { selectedSex, selectedLevel }
}

export async function createCoach(payload: Record<string, unknown>) {
  const input = normalizeInput(payload)
  const { selectedSex, selectedLevel } = await validateInput(input)
  const coachs = await getCoachs()
  const idCoach = nextActorId(coachs.map((coach) => coach.idCoach), "TRN")
  if (coachs.some((coach) => coach.idCoach === idCoach)) throw new Error("Cet identifiant de coach existe déjà.")
  await formatSheetDateColumn(env.googleSheets.acteursSpreadsheetId, "COACHS", "date_naissance")
  await appendSheetRecord(env.googleSheets.acteursSpreadsheetId, "COACHS", {
    id_coach: idCoach, id_national: input.idNational, id_fivb: input.idFivb,
    nom_complet: input.nomComplet, id_sexe: input.idSexe,
    date_naissance: input.dateNaissance, nationalite: input.nationalite,
    id_niveau: input.idNiveau, telephone: input.telephone, email: input.email,
    adresse: input.adresse, statut: input.statut,
  })
  return (await getCoachs()).find((coach) => coach.idCoach === idCoach)
    ?? { idCoach, ...input, niveau: selectedLevel?.nom ?? "", sexe: selectedSex.nom }
}

export async function updateCoach(idCoach: string, payload: Record<string, unknown>) {
  const input = normalizeInput(payload)
  const { selectedSex, selectedLevel } = await validateInput(input)
  const coachs = await getCoachs()
  const current = coachs.find((coach) => coach.idCoach === idCoach)
  if (!current) throw new Error("Coach introuvable.")
  await formatSheetDateColumn(env.googleSheets.acteursSpreadsheetId, "COACHS", "date_naissance")
  await updateSheetRecordById(env.googleSheets.acteursSpreadsheetId, "COACHS", "id_coach", idCoach, {
    id_national: input.idNational, id_fivb: input.idFivb,
    nom_complet: input.nomComplet, id_sexe: input.idSexe,
    date_naissance: input.dateNaissance, nationalite: input.nationalite,
    id_niveau: input.idNiveau, telephone: input.telephone, email: input.email,
    adresse: input.adresse, statut: input.statut,
  })
  return (await getCoachs()).find((coach) => coach.idCoach === idCoach)
    ?? { idCoach, ...input, niveau: selectedLevel?.nom ?? "", sexe: selectedSex.nom, avatarDriveId: current.avatarDriveId, avatarDriveUrl: current.avatarDriveUrl }
}

export async function updateCoachAvatar(idCoach: string, avatarDriveId: string, avatarDriveUrl: string) {
  const current = (await getCoachs()).find((coach) => coach.idCoach === idCoach)
  if (!current) throw new Error("Coach introuvable.")
  await updateSheetRecordById(env.googleSheets.acteursSpreadsheetId, "COACHS", "id_coach", idCoach, {
    avatar_drive_id: avatarDriveId,
    avatar_drive_url: avatarDriveUrl,
  })
  return (await getCoachs()).find((coach) => coach.idCoach === idCoach)
    ?? { ...current, avatarDriveId, avatarDriveUrl }
}
