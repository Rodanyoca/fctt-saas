import "server-only"

import { env } from "@/lib/env"
import { appendSheetRecord, formatSheetDateColumn, updateSheetRecordById } from "@/lib/google-sheets"
import { getEntentes, getLigues, getProvinceOptions } from "@/lib/data"
import { formatDateForSheet } from "@/lib/compact-date"

const statuses = new Set(["ACTIF", "INACTIF"])
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const text = (value: unknown) => String(value ?? "").trim()
const buildEntenteId = (idLigue: string, codeEntente: string) => `${idLigue}${codeEntente}`
const normalizeStatus = (value: unknown) => {
  const status = text(value).toUpperCase()
  if (status === "ACTIVE") return "ACTIF"
  if (status === "INACTIVE") return "INACTIF"
  return status
}

export type LigueInput = {
  nomLigue: string
  sigleLigue: string
  telephone: string
  emailLigue: string
  idProvince: string
  anneeCreation: string
  dateAffiliation: string
  idLigueCoc: string
  statut: string
  observations: string
}

function validateLigue(input: LigueInput) {
  if (!input.nomLigue) throw new Error("Le nom de la ligue est obligatoire.")
  if (!input.idProvince) throw new Error("La province est obligatoire.")
  if (input.emailLigue && !emailPattern.test(input.emailLigue)) throw new Error("L’adresse e-mail est invalide.")
  if (input.dateAffiliation) {
    try { formatDateForSheet(input.dateAffiliation) } catch { throw new Error("La date d’affiliation est invalide.") }
  }
  if (!statuses.has(input.statut)) throw new Error("Le statut doit être ACTIF ou INACTIF.")
}

function ligueResult(idLigue: string, input: LigueInput, province: { idProvince: string; nomProvince: string }) {
  return {
    idLigue,
    nomLigue: input.nomLigue,
    sigleLigue: input.sigleLigue,
    telephone: input.telephone,
    emailLigue: input.emailLigue,
    idProvince: province.idProvince,
    nomProvince: province.nomProvince,
    anneeCreation: input.anneeCreation,
    dateAffiliation: input.dateAffiliation,
    idLigueCoc: input.idLigueCoc,
    statut: input.statut,
    observations: input.observations,
  }
}

export async function createLigue(payload: Record<string, unknown>) {
  const input: LigueInput = {
    nomLigue: text(payload.nomLigue),
    sigleLigue: text(payload.sigleLigue),
    telephone: text(payload.telephone),
    emailLigue: text(payload.emailLigue),
    idProvince: text(payload.idProvince),
    anneeCreation: text(payload.anneeCreation),
    dateAffiliation: text(payload.dateAffiliation),
    idLigueCoc: text(payload.idLigueCoc),
    statut: normalizeStatus(payload.statut),
    observations: text(payload.observations),
  }
  validateLigue(input)
  input.dateAffiliation = input.dateAffiliation ? formatDateForSheet(input.dateAffiliation) : ""
  const [ligues, provinces] = await Promise.all([getLigues(), getProvinceOptions()])
  const province = provinces.find((item) => item.idProvince === input.idProvince)
  if (!province) throw new Error("La province sélectionnée est introuvable.")
  if (ligues.some((item) => item.idProvince === input.idProvince && item.nomLigue.toLowerCase() === input.nomLigue.toLowerCase())) {
    throw new Error("Une ligue portant ce nom existe déjà dans cette province.")
  }
  const maxId = ligues.reduce((max, item) => {
    const numeric = /^\d+$/.test(item.idLigue) ? Number(item.idLigue) : 0
    return Math.max(max, numeric)
  }, 0)
  const idLigue = String(maxId + 1).padStart(2, "0")
  await formatSheetDateColumn(env.googleSheets.territorialSpreadsheetId, "LIGUES", "date_affiliation_ligue", "yyyy-mm-dd")
  await appendSheetRecord(env.googleSheets.territorialSpreadsheetId, "LIGUES", {
    id_ligue: idLigue,
    nom_ligue: input.nomLigue,
    sigle_ligue: input.sigleLigue,
    telephone: input.telephone,
    email: input.emailLigue,
    id_province: province.idProvince,
    "année_creation": input.anneeCreation,
    date_affiliation_ligue: input.dateAffiliation,
    id_ligue_coc: input.idLigueCoc,
    statut: input.statut,
    observations: input.observations,
  })
  return (await getLigues()).find((item) => item.idLigue === idLigue)
    ?? ligueResult(idLigue, input, province)
}

export async function updateLigue(idLigue: string, payload: Record<string, unknown>) {
  const input: LigueInput = {
    nomLigue: text(payload.nomLigue),
    sigleLigue: text(payload.sigleLigue),
    telephone: text(payload.telephone),
    emailLigue: text(payload.emailLigue),
    idProvince: text(payload.idProvince),
    anneeCreation: text(payload.anneeCreation),
    dateAffiliation: text(payload.dateAffiliation),
    idLigueCoc: text(payload.idLigueCoc),
    statut: normalizeStatus(payload.statut),
    observations: text(payload.observations),
  }
  validateLigue(input)
  input.dateAffiliation = input.dateAffiliation ? formatDateForSheet(input.dateAffiliation) : ""
  const [ligues, provinces] = await Promise.all([getLigues(), getProvinceOptions()])
  const province = provinces.find((item) => item.idProvince === input.idProvince)
  if (!province) throw new Error("La province sélectionnée est introuvable.")
  if (ligues.some((item) => item.idLigue !== idLigue && item.idProvince === input.idProvince && item.nomLigue.toLowerCase() === input.nomLigue.toLowerCase())) {
    throw new Error("Une ligue portant ce nom existe déjà dans cette province.")
  }
  await formatSheetDateColumn(env.googleSheets.territorialSpreadsheetId, "LIGUES", "date_affiliation_ligue", "yyyy-mm-dd")
  await updateSheetRecordById(env.googleSheets.territorialSpreadsheetId, "LIGUES", "id_ligue", idLigue, {
    nom_ligue: input.nomLigue, sigle_ligue: input.sigleLigue,
    telephone: input.telephone, email: input.emailLigue,
    id_province: province.idProvince,
    "année_creation": input.anneeCreation,
    date_affiliation_ligue: input.dateAffiliation,
    id_ligue_coc: input.idLigueCoc,
    statut: input.statut, observations: input.observations,
  })
  return (await getLigues()).find((item) => item.idLigue === idLigue)
    ?? ligueResult(idLigue, input, province)
}

function ententeResult(input: {
  idEntente: string
  previousIdEntente?: string
  codeEntente: string
  nomEntente: string
  pseudoEntente: string
  ligue: { idLigue: string; nomLigue: string; idProvince: string; nomProvince: string }
  emailEntente: string
  telephone: string
  dateCreation: string
  dateReconnaissance: string
  idEntenteCoc: string
  statut: string
  observations: string
}) {
  return {
    idEntente: input.idEntente,
    previousIdEntente: input.previousIdEntente,
    codeEntente: input.codeEntente,
    nomEntente: input.nomEntente,
    pseudoEntente: input.pseudoEntente,
    idLigue: input.ligue.idLigue,
    nomLigue: input.ligue.nomLigue,
    provinceId: input.ligue.idProvince,
    provinceNom: input.ligue.nomProvince,
    emailEntente: input.emailEntente,
    telephone: input.telephone,
    dateCreation: input.dateCreation,
    dateReconnaissance: input.dateReconnaissance,
    idEntenteCoc: input.idEntenteCoc,
    statut: input.statut,
    observations: input.observations,
  }
}

export async function createEntente(payload: Record<string, unknown>) {
  const codeEntente = text(payload.codeEntente)
  const idLigue = text(payload.idLigue)
  const nomEntente = text(payload.nomEntente)
  const pseudoEntente = text(payload.pseudoEntente)
  const emailEntente = text(payload.emailEntente)
  const telephone = text(payload.telephone)
  let dateCreation = text(payload.dateCreation)
  let dateReconnaissance = text(payload.dateReconnaissance)
  const idEntenteCoc = text(payload.idEntenteCoc)
  const statut = normalizeStatus(payload.statut)
  const observations = text(payload.observations)
  if (!codeEntente) throw new Error("Le code de l’entente est obligatoire.")
  if (!idLigue) throw new Error("La ligue est obligatoire.")
  if (!nomEntente) throw new Error("Le nom de l’entente est obligatoire.")
  if (emailEntente && !emailPattern.test(emailEntente)) throw new Error("L’adresse e-mail est invalide.")
  try {
    dateCreation = dateCreation ? formatDateForSheet(dateCreation) : ""
    dateReconnaissance = dateReconnaissance ? formatDateForSheet(dateReconnaissance) : ""
  } catch { throw new Error("Les dates de l’entente sont invalides.") }
  if (dateCreation && dateReconnaissance && dateReconnaissance < dateCreation) throw new Error("La date de reconnaissance ne peut pas précéder la date de création.")
  if (!statuses.has(statut)) throw new Error("Le statut doit être ACTIF ou INACTIF.")

  const [ententes, ligues] = await Promise.all([getEntentes(), getLigues()])
  const ligue = ligues.find((item) => item.idLigue === idLigue)
  if (!ligue) throw new Error("Ligue introuvable.")
  const idEntente = buildEntenteId(ligue.idLigue, codeEntente)
  if (ententes.some((item) => item.idEntente === idEntente)) throw new Error("Cet identifiant d’entente existe déjà.")
  if (ententes.some((item) => item.idLigue === idLigue && item.codeEntente === codeEntente)) throw new Error("Ce code d’entente existe déjà dans cette ligue.")
  if (ententes.some((item) => item.idLigue === idLigue && item.nomEntente.toLowerCase() === nomEntente.toLowerCase())) {
    throw new Error("Une entente portant ce nom existe déjà dans cette ligue.")
  }

  await Promise.all([
    formatSheetDateColumn(env.googleSheets.territorialSpreadsheetId, "ENTENTES", "date_creation", "yyyy-mm-dd"),
    formatSheetDateColumn(env.googleSheets.territorialSpreadsheetId, "ENTENTES", "date_reconnaissance", "yyyy-mm-dd"),
  ])
  await appendSheetRecord(env.googleSheets.territorialSpreadsheetId, "ENTENTES", {
    id_entente: idEntente, code_entente: codeEntente,
    nom_entente: nomEntente, sigle_entente: pseudoEntente,
    id_ligue: ligue.idLigue,
    telephone, email: emailEntente, date_creation: dateCreation,
    date_reconnaissance: dateReconnaissance, id_entente_coc: idEntenteCoc,
    statut, observations,
  })
  return (await getEntentes()).find((item) => item.idEntente === idEntente)
    ?? ententeResult({ idEntente, codeEntente, nomEntente, pseudoEntente, ligue, telephone, emailEntente, dateCreation, dateReconnaissance, idEntenteCoc, statut, observations })
}

export async function updateEntente(idEntente: string, payload: Record<string, unknown>) {
  const [ententes, ligues] = await Promise.all([getEntentes(), getLigues()])
  if (!ententes.some((item) => item.idEntente === idEntente)) throw new Error("Entente introuvable.")
  const idLigue = text(payload.idLigue)
  if (!idLigue) throw new Error("La ligue est obligatoire.")
  const ligue = ligues.find((item) => item.idLigue === idLigue)
  if (!ligue) throw new Error("Ligue introuvable.")
  const nomEntente = text(payload.nomEntente)
  const currentEntente = ententes.find((item) => item.idEntente === idEntente)!
  const codeEntente = currentEntente.codeEntente
  if (!codeEntente) throw new Error("Le code de l’entente est introuvable.")
  const pseudoEntente = text(payload.pseudoEntente)
  if (!nomEntente) throw new Error("Le nom de l’entente est obligatoire.")
  if (ententes.some((item) =>
    item.idEntente !== idEntente &&
    item.idLigue === idLigue &&
    item.nomEntente.toLowerCase() === nomEntente.toLowerCase()
  )) {
    throw new Error("Une entente portant ce nom existe déjà dans cette ligue.")
  }
  const emailEntente = text(payload.emailEntente)
  const telephone = text(payload.telephone)
  let dateCreation = text(payload.dateCreation)
  let dateReconnaissance = text(payload.dateReconnaissance)
  const idEntenteCoc = text(payload.idEntenteCoc)
  if (emailEntente && !emailPattern.test(emailEntente)) throw new Error("L’adresse e-mail est invalide.")
  try {
    dateCreation = dateCreation ? formatDateForSheet(dateCreation) : ""
    dateReconnaissance = dateReconnaissance ? formatDateForSheet(dateReconnaissance) : ""
  } catch { throw new Error("Les dates de l’entente sont invalides.") }
  if (dateCreation && dateReconnaissance && dateReconnaissance < dateCreation) throw new Error("La date de reconnaissance ne peut pas précéder la date de création.")
  const statut = normalizeStatus(payload.statut)
  if (!statuses.has(statut)) throw new Error("Le statut doit être ACTIF ou INACTIF.")
  const observations = text(payload.observations)
  await Promise.all([
    formatSheetDateColumn(env.googleSheets.territorialSpreadsheetId, "ENTENTES", "date_creation", "yyyy-mm-dd"),
    formatSheetDateColumn(env.googleSheets.territorialSpreadsheetId, "ENTENTES", "date_reconnaissance", "yyyy-mm-dd"),
  ])
  await updateSheetRecordById(env.googleSheets.territorialSpreadsheetId, "ENTENTES", "id_entente", idEntente, {
    nom_entente: nomEntente,
    sigle_entente: pseudoEntente,
    id_ligue: ligue.idLigue,
    telephone,
    email: emailEntente,
    date_creation: dateCreation,
    date_reconnaissance: dateReconnaissance,
    id_entente_coc: idEntenteCoc,
    statut,
    observations,
  })
  const saved = (await getEntentes()).find((item) => item.idEntente === idEntente)
  return saved ?? ententeResult({
    idEntente,
    codeEntente,
    nomEntente,
    pseudoEntente,
    ligue,
    telephone,
    emailEntente,
    dateCreation,
    dateReconnaissance,
    idEntenteCoc,
    statut,
    observations,
  })
}
