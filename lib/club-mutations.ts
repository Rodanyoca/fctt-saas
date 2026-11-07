import "server-only"

import { env } from "@/lib/env"
import { getClubs, getEntentes } from "@/lib/data"
import { appendSheetRecord, formatSheetDateColumn, updateSheetRecordById } from "@/lib/google-sheets"
import { getClubCategories, getClubSexes } from "@/lib/club-references"
import { assertValidDate } from "@/lib/date-validation"
import { formatDateForSheet } from "@/lib/compact-date"

const text = (value: unknown) => String(value ?? "").trim()
const statuses = new Set(["ACTIF", "INACTIF"])
const buildClubId = (idEntente: string, codeClub: string) => `${idEntente}${codeClub}`

const normalizeStatus = (value: unknown) => {
  const status = text(value).toUpperCase()
  if (status === "ACTIVE") return "ACTIF"
  if (status === "INACTIVE") return "INACTIF"
  return status
}

type ClubInput = {
  codeClub: string
  nomClub: string
  idCategorieClub: string
  idSexe: string
  dateCreation: string
  dateAffiliationClub: string
  idEntente: string
  statut: string
  observations: string
}

function normalizeInput(payload: Record<string, unknown>): ClubInput {
  return {
    codeClub: text(payload.codeClub), nomClub: text(payload.nomClub),
    idCategorieClub: text(payload.idCategorieClub || payload.categorie),
    idSexe: text(payload.idSexe || payload.version),
    dateCreation: text(payload.dateCreation),
    dateAffiliationClub: text(payload.dateAffiliationClub), idEntente: text(payload.idEntente),
    statut: normalizeStatus(payload.statut), observations: text(payload.observations),
  }
}

function validateInput(input: ClubInput, editing: boolean) {
  if (!editing && !input.codeClub) throw new Error("Le code du club est obligatoire.")
  if (!input.nomClub) throw new Error("Le nom du club est obligatoire.")
  if (!input.idEntente) throw new Error("L’entente est obligatoire.")
  assertValidDate(input.dateCreation, "La date de création du club")
  assertValidDate(input.dateAffiliationClub, "La date d’affiliation du club")
  if (!statuses.has(input.statut)) throw new Error("Le statut du club est invalide.")
}

function validateReferences(input: ClubInput, categories: Array<{ id: string }>, sexes: Array<{ id: string }>) {
  if (categories.length && input.idCategorieClub && !categories.some((option) => option.id === input.idCategorieClub)) {
    throw new Error("La catégorie sélectionnée est invalide.")
  }
  if (sexes.length && input.idSexe && !sexes.some((option) => option.id === input.idSexe)) {
    throw new Error("Le sexe sélectionné est invalide.")
  }
}

function clubResult(idClub: string, input: ClubInput, entente: {
  idEntente: string; nomEntente: string; pseudoEntente: string; idLigue: string; nomLigue: string
}, previousIdClub?: string) {
  return {
    idClub, previousIdClub, codeClub: input.codeClub, nomClub: input.nomClub,
    categorie: input.idCategorieClub, idCategorieClub: input.idCategorieClub,
    version: input.idSexe, idSexe: input.idSexe,
    dateCreation: input.dateCreation, dateAffiliationClub: input.dateAffiliationClub,
    idEntente: entente.idEntente, nomEntente: entente.nomEntente,
    pseudoEntente: entente.pseudoEntente, idLigue: entente.idLigue, nomLigue: entente.nomLigue,
    statut: input.statut, observations: input.observations,
  }
}

export async function createClub(payload: Record<string, unknown>) {
  const input = normalizeInput(payload)
  validateInput(input, false)
  input.dateCreation = input.dateCreation ? formatDateForSheet(input.dateCreation) : ""
  input.dateAffiliationClub = input.dateAffiliationClub ? formatDateForSheet(input.dateAffiliationClub) : ""
  if (input.dateCreation && input.dateAffiliationClub && input.dateAffiliationClub < input.dateCreation) throw new Error("La date d’affiliation ne peut pas précéder la date de création.")
  const [clubs, ententes, categories, sexes] = await Promise.all([
    getClubs(), getEntentes(), getClubCategories(), getClubSexes(),
  ])
  validateReferences(input, categories, sexes)
  const entente = ententes.find((item) => item.idEntente === input.idEntente)
  if (!entente) throw new Error("Entente introuvable.")
  const idClub = buildClubId(entente.idEntente, input.codeClub)
  if (clubs.some((club) => club.idClub === idClub)) throw new Error("Cet identifiant de club existe déjà.")
  if (clubs.some((club) => club.idEntente === input.idEntente && club.codeClub === input.codeClub)) {
    throw new Error("Ce code de club existe déjà dans cette entente.")
  }
  if (clubs.some((club) => club.idEntente === input.idEntente && club.nomClub.toLowerCase() === input.nomClub.toLowerCase())) {
    throw new Error("Un club portant ce nom existe déjà dans cette entente.")
  }
  await Promise.all([
    formatSheetDateColumn(env.googleSheets.territorialSpreadsheetId, "CLUBS", "date_creation", "yyyy-mm-dd"),
    formatSheetDateColumn(env.googleSheets.territorialSpreadsheetId, "CLUBS", "date_affiliation", "yyyy-mm-dd"),
  ])
  await appendSheetRecord(env.googleSheets.territorialSpreadsheetId, "CLUBS", {
    id_club: idClub, code_club: input.codeClub, nom_club: input.nomClub,
    id_categorie_club: input.idCategorieClub, id_sexe: input.idSexe,
    date_creation: input.dateCreation, date_affiliation: input.dateAffiliationClub, id_entente: entente.idEntente,
    statut: input.statut, observations: input.observations,
  })
  return (await getClubs()).find((club) => club.idClub === idClub) ?? clubResult(idClub, input, entente)
}

export async function updateClub(idClub: string, payload: Record<string, unknown>) {
  const input = normalizeInput(payload)
  const [clubs, ententes, categories, sexes] = await Promise.all([
    getClubs(), getEntentes(), getClubCategories(), getClubSexes(),
  ])
  const current = clubs.find((club) => club.idClub === idClub)
  if (!current) throw new Error("Club introuvable.")
  input.codeClub = current.codeClub
  validateInput(input, true)
  input.dateCreation = input.dateCreation ? formatDateForSheet(input.dateCreation) : ""
  input.dateAffiliationClub = input.dateAffiliationClub ? formatDateForSheet(input.dateAffiliationClub) : ""
  if (input.dateCreation && input.dateAffiliationClub && input.dateAffiliationClub < input.dateCreation) throw new Error("La date d’affiliation ne peut pas précéder la date de création.")
  validateReferences(input, categories, sexes)
  const entente = ententes.find((item) => item.idEntente === input.idEntente)
  if (!entente) throw new Error("Entente introuvable.")
  if (clubs.some((club) => club.idClub !== idClub && club.idEntente === input.idEntente &&
    club.nomClub.toLowerCase() === input.nomClub.toLowerCase())) {
    throw new Error("Un club portant ce nom existe déjà dans cette entente.")
  }
  await Promise.all([
    formatSheetDateColumn(env.googleSheets.territorialSpreadsheetId, "CLUBS", "date_creation", "yyyy-mm-dd"),
    formatSheetDateColumn(env.googleSheets.territorialSpreadsheetId, "CLUBS", "date_affiliation", "yyyy-mm-dd"),
  ])
  await updateSheetRecordById(env.googleSheets.territorialSpreadsheetId, "CLUBS", "id_club", idClub, {
    nom_club: input.nomClub, id_categorie_club: input.idCategorieClub, id_sexe: input.idSexe,
    date_creation: input.dateCreation, date_affiliation: input.dateAffiliationClub, id_entente: entente.idEntente,
    statut: input.statut, observations: input.observations,
  })
  return (await getClubs()).find((club) => club.idClub === idClub) ?? clubResult(idClub, input, entente)
}

export async function updateClubLogo(idClub: string, logoDriveId: string, logoDriveUrl: string) {
  const clubs = await getClubs()
  const current = clubs.find((club) => club.idClub === idClub)
  if (!current) throw new Error("Club introuvable.")
  await updateSheetRecordById(env.googleSheets.territorialSpreadsheetId, "CLUBS", "id_club", idClub, {
    logo_drive_id: logoDriveId,
    logo_drive_url: logoDriveUrl,
  })
  return (await getClubs()).find((club) => club.idClub === idClub)
    ?? { ...current, logoDriveId, logoDriveUrl }
}
