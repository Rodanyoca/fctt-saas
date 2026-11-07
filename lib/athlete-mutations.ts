import "server-only"

import { env } from "@/lib/env"
import { getActorSexes } from "@/lib/actor-references"
import { getAthletes } from "@/lib/data"
import { appendSheetRecord, updateSheetRecordById } from "@/lib/google-sheets"
import { nextActorId } from "@/lib/actor-id"
import { assertValidDate } from "@/lib/date-validation"

const text = (value: unknown) => String(value ?? "").trim()
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const statuses = new Set(["ACTIF", "INACTIF"])

function normalizeStatus(value: unknown) {
  const status = text(value).toUpperCase()
  if (status === "ACTIVE") return "ACTIF"
  if (status === "INACTIVE") return "INACTIF"
  return status || "ACTIF"
}

type AthleteInput = {
  idNational: string; idFivb: string; nomComplet: string
  dateDeNaissance: string; lieuDeNaissance: string; idSexe: string
  nationalite: string; telephone: string; email: string; adresse: string
  observations: string; avatarDriveId: string; avatarDriveUrl: string; statut: string
}

function normalizeInput(payload: Record<string, unknown>): AthleteInput {
  return {
    idNational: text(payload.idNational), idFivb: text(payload.idFivb),
    nomComplet: text(payload.nomComplet), dateDeNaissance: text(payload.dateDeNaissance),
    lieuDeNaissance: text(payload.lieuDeNaissance), idSexe: text(payload.idSexe),
    nationalite: text(payload.nationalite), telephone: text(payload.telephone),
    email: text(payload.email), adresse: text(payload.adresse), observations: text(payload.observations),
    avatarDriveId: text(payload.avatarDriveId), avatarDriveUrl: text(payload.avatarDriveUrl),
    statut: normalizeStatus(payload.statut),
  }
}

async function validateInput(input: AthleteInput) {
  if (!input.nomComplet) throw new Error("Le nom complet est obligatoire.")
  if (!input.idSexe) throw new Error("Le sexe est obligatoire.")
  assertValidDate(input.dateDeNaissance, "La date de naissance")
  if (input.email && !emailPattern.test(input.email)) throw new Error("L’adresse e-mail est invalide.")
  if (!statuses.has(input.statut)) throw new Error("Le statut est invalide.")
  const sexes = await getActorSexes()
  const selectedSex = sexes.find((option) => option.id === input.idSexe)
  if (!selectedSex) throw new Error("Le sexe sélectionné est invalide.")
  return selectedSex
}

export async function createAthlete(payload: Record<string, unknown>) {
  const input = normalizeInput(payload)
  const selectedSex = await validateInput(input)
  const athletes = await getAthletes()
  const idAthlete = nextActorId(athletes.map((athlete) => athlete.idAthlete), "ATH")
  if (athletes.some((athlete) => athlete.idAthlete === idAthlete)) throw new Error("Cet identifiant d’athlète existe déjà.")
  await appendSheetRecord(env.googleSheets.acteursSpreadsheetId, "ATHLETES", {
    id_athlete: idAthlete, id_national: input.idNational, id_fivb: input.idFivb,
    nom_complet: input.nomComplet, date_de_naissance: input.dateDeNaissance,
    lieu_de_naissance: input.lieuDeNaissance, id_sexe: input.idSexe,
    nationalite: input.nationalite, telephone: input.telephone,
    email: input.email, adresse: input.adresse, observations: input.observations,
    avatar_drive_id: input.avatarDriveId, avatar_drive_url: input.avatarDriveUrl,
    statut: input.statut,
  })
  return (await getAthletes()).find((athlete) => athlete.idAthlete === idAthlete)
    ?? { idAthlete, ...input, sexe: selectedSex.nom }
}

export async function updateAthlete(idAthlete: string, payload: Record<string, unknown>) {
  const input = normalizeInput(payload)
  const selectedSex = await validateInput(input)
  const athletes = await getAthletes()
  const current = athletes.find((athlete) => athlete.idAthlete === idAthlete)
  if (!current) throw new Error("Athlète introuvable.")
  input.avatarDriveId = current.avatarDriveId
  input.avatarDriveUrl = current.avatarDriveUrl
  await updateSheetRecordById(env.googleSheets.acteursSpreadsheetId, "ATHLETES", "id_athlete", idAthlete, {
    id_national: input.idNational, id_fivb: input.idFivb,
    nom_complet: input.nomComplet, date_de_naissance: input.dateDeNaissance,
    lieu_de_naissance: input.lieuDeNaissance, id_sexe: input.idSexe,
    nationalite: input.nationalite, telephone: input.telephone,
    email: input.email, adresse: input.adresse, observations: input.observations,
    avatar_drive_id: input.avatarDriveId, avatar_drive_url: input.avatarDriveUrl,
    statut: input.statut,
  })
  return (await getAthletes()).find((athlete) => athlete.idAthlete === idAthlete)
    ?? { idAthlete, ...input, sexe: selectedSex.nom }
}

export async function updateAthleteAvatar(idAthlete: string, avatarDriveId: string, avatarDriveUrl: string) {
  const athletes = await getAthletes()
  const current = athletes.find((athlete) => athlete.idAthlete === idAthlete)
  if (!current) throw new Error("Athlète introuvable.")
  await updateSheetRecordById(env.googleSheets.acteursSpreadsheetId, "ATHLETES", "id_athlete", idAthlete, {
    avatar_drive_id: avatarDriveId,
    avatar_drive_url: avatarDriveUrl,
  })
  return (await getAthletes()).find((athlete) => athlete.idAthlete === idAthlete)
    ?? { ...current, avatarDriveId, avatarDriveUrl }
}
