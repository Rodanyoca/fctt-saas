import "server-only"

import { getActorSexes, getMedecinSpecialties } from "@/lib/actor-references"
import { nextActorId } from "@/lib/actor-id"
import { compareDateValues, formatDateForSheet, validateBirthDate } from "@/lib/compact-date"
import { getMedecins } from "@/lib/data"
import { env } from "@/lib/env"
import { appendSheetRecord, formatSheetDateColumn, updateSheetRecordById } from "@/lib/google-sheets"

const text = (value: unknown) => String(value ?? "").trim()
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const statuses = new Set(["actif", "inactif", "active", "inactive"])

type MedecinInput = {
  idNational: string; idFivb: string; nomComplet: string; idSexe: string
  dateNaissance: string; nationalite: string; idSpecialite: string
  telephone: string; email: string; adresse: string; numeroPasseport: string
  dateDelivrancePasseport: string; dateExpirationPasseport: string; statut: string
}

function normalizeInput(payload: Record<string, unknown>): MedecinInput {
  return {
    idNational: text(payload.idNational), idFivb: text(payload.idFivb), nomComplet: text(payload.nomComplet),
    idSexe: text(payload.idSexe), dateNaissance: text(payload.dateNaissance), nationalite: text(payload.nationalite),
    idSpecialite: text(payload.idSpecialite), telephone: text(payload.telephone), email: text(payload.email),
    adresse: text(payload.adresse), numeroPasseport: text(payload.numeroPasseport),
    dateDelivrancePasseport: text(payload.dateDelivrancePasseport), dateExpirationPasseport: text(payload.dateExpirationPasseport),
    statut: text(payload.statut).toLowerCase() || "actif",
  }
}

async function validateInput(input: MedecinInput) {
  if (!input.nomComplet) throw new Error("Le nom complet est obligatoire.")
  if (!input.idSexe) throw new Error("Le sexe est obligatoire.")
  const birthError = validateBirthDate(input.dateNaissance)
  if (birthError) throw new Error(birthError)
  for (const [value, label] of [[input.dateDelivrancePasseport, "La date de délivrance"], [input.dateExpirationPasseport, "La date d’expiration"]] as const) {
    if (value) {
      try { formatDateForSheet(value) } catch { throw new Error(`${label} est invalide.`) }
    }
  }
  if (input.dateDelivrancePasseport && input.dateExpirationPasseport && compareDateValues(input.dateDelivrancePasseport, input.dateExpirationPasseport)! > 0) {
    throw new Error("La date d’expiration ne peut pas précéder la date de délivrance.")
  }
  if (input.email && !emailPattern.test(input.email)) throw new Error("L’adresse e-mail est invalide.")
  if (!statuses.has(input.statut)) throw new Error("Le statut est invalide.")
  const [sexes, specialties] = await Promise.all([getActorSexes(), getMedecinSpecialties()])
  const sexe = sexes.find((option) => option.id === input.idSexe)
  if (!sexe) throw new Error("Le sexe sélectionné est invalide.")
  const specialty = input.idSpecialite ? specialties.find((option) => option.id === input.idSpecialite) : undefined
  if (input.idSpecialite && !specialty) throw new Error("La spécialité sélectionnée est invalide.")
  return { sexe, specialty }
}

function sheetRecord(input: MedecinInput) {
  return {
    id_national: input.idNational, id_fivb: input.idFivb, nom_complet: input.nomComplet,
    id_sexe: input.idSexe, date_naissance: input.dateNaissance ? formatDateForSheet(input.dateNaissance) : "",
    nationalite: input.nationalite, id_specialite: input.idSpecialite, telephone: input.telephone,
    email: input.email, adresse: input.adresse, numéro_passeport: input.numeroPasseport,
    date_de_delivrance_passeport: input.dateDelivrancePasseport ? formatDateForSheet(input.dateDelivrancePasseport) : "",
    date_expiration_passeport: input.dateExpirationPasseport ? formatDateForSheet(input.dateExpirationPasseport) : "",
    statut: input.statut,
  }
}

async function formatDateColumns() {
  await Promise.all([
    formatSheetDateColumn(env.googleSheets.acteursSpreadsheetId, "MEDECINS", "date_naissance", "yyyy-mm-dd"),
    formatSheetDateColumn(env.googleSheets.acteursSpreadsheetId, "MEDECINS", "date_de_delivrance_passeport", "yyyy-mm-dd"),
    formatSheetDateColumn(env.googleSheets.acteursSpreadsheetId, "MEDECINS", "date_expiration passeport", "yyyy-mm-dd"),
  ])
}

export async function createMedecin(payload: Record<string, unknown>) {
  const input = normalizeInput(payload)
  const refs = await validateInput(input)
  const medecins = await getMedecins()
  const idMedecin = nextActorId(medecins.map((item) => item.idMedecin), "MED")
  if (medecins.some((item) => item.idMedecin === idMedecin)) throw new Error("Cet identifiant de médecin existe déjà.")
  await formatDateColumns()
  await appendSheetRecord(env.googleSheets.acteursSpreadsheetId, "MEDECINS", { id_medecin: idMedecin, ...sheetRecord(input) }, "OVERWRITE")
  return (await getMedecins()).find((item) => item.idMedecin === idMedecin) ?? {
    idMedecin, ...input, idSexe: input.idSexe, idSpecialite: input.idSpecialite,
    sexe: refs.sexe.nom, specialite: refs.specialty?.nom ?? "", dateDeNaissance: input.dateNaissance ? formatDateForSheet(input.dateNaissance) : "",
    avatarDriveId: "", avatarDriveUrl: "", passeportDriveId: "", passeportDriveUrl: "",
  }
}

export async function updateMedecin(idMedecin: string, payload: Record<string, unknown>) {
  const current = (await getMedecins()).find((item) => item.idMedecin === idMedecin)
  if (!current) throw new Error("Médecin introuvable.")
  const input = normalizeInput({
    idNational: current.idNational, idFivb: current.idFivb, nomComplet: current.nomComplet,
    idSexe: current.idSexe, dateNaissance: current.dateDeNaissance, nationalite: current.nationalite,
    idSpecialite: current.idSpecialite, telephone: current.telephone, email: current.email, adresse: current.adresse,
    numeroPasseport: current.numeroPasseport, dateDelivrancePasseport: current.dateDelivrancePasseport,
    dateExpirationPasseport: current.dateExpirationPasseport, statut: current.statut, ...payload,
  })
  const refs = await validateInput(input)
  await formatDateColumns()
  await updateSheetRecordById(env.googleSheets.acteursSpreadsheetId, "MEDECINS", "id_medecin", idMedecin, sheetRecord(input))
  return (await getMedecins()).find((item) => item.idMedecin === idMedecin) ?? {
    ...current, ...input, sexe: refs.sexe.nom, specialite: refs.specialty?.nom ?? "",
    dateDeNaissance: input.dateNaissance ? formatDateForSheet(input.dateNaissance) : "",
  }
}

export async function updateMedecinAvatar(idMedecin: string, avatarDriveId: string, avatarDriveUrl: string) {
  const current = (await getMedecins()).find((item) => item.idMedecin === idMedecin)
  if (!current) throw new Error("Médecin introuvable.")
  await updateSheetRecordById(env.googleSheets.acteursSpreadsheetId, "MEDECINS", "id_medecin", idMedecin, { avatar_drive_id: avatarDriveId, avatar_drive_url: avatarDriveUrl })
  return (await getMedecins()).find((item) => item.idMedecin === idMedecin) ?? { ...current, avatarDriveId, avatarDriveUrl }
}
