import "server-only"
import { env } from "@/lib/env"
import { appendSheetRecordsBatch, getSheetsDataFrom, updateSheetRecordById, type SheetRow } from "@/lib/google-sheets"
import { formatDateForSheet } from "@/lib/compact-date"
import { deleteDocumentFile, uploadDocumentFile } from "@/lib/google-document-file"

export type DocumentView = { id: string; typeId: string; type: string; title: string; reference: string; documentDate: string; receptionDate: string; description: string; status: string; observations: string; fileRecordId: string; fileId: string; fileName: string; fileUrl: string; relationId: string; entityTypeId: string; entityId: string; relationType: string }
export type DocumentOption = { id: string; label: string }
const text = (row: SheetRow, key: string) => String(row[key] ?? "").trim()

export async function loadDocuments() {
  const [business, refs] = await Promise.all([
    getSheetsDataFrom(env.googleSheets.documentsSpreadsheetId, ["DOCUMENTS!A:Z", "DOCUMENTS_FICHIERS!A:Z", "DOCUMENTS_RELATIONS!A:Z"]),
    getSheetsDataFrom(env.googleSheets.referentielsSpreadsheetId, ["TYPES_DOCUMENT!A:Z"]),
  ])
  const typeOptions: DocumentOption[] = (refs.TYPES_DOCUMENT ?? []).map((row) => ({ id: text(row, "id_type_document"), label: text(row, "nom_type_document") })).filter((item) => item.id && item.label)
  const types = new Map(typeOptions.map((item) => [item.id, item.label]))
  const files = new Map((business.DOCUMENTS_FICHIERS ?? []).map((row) => [text(row, "id_document"), row]))
  const relations = new Map((business.DOCUMENTS_RELATIONS ?? []).map((row) => [text(row, "id_document"), row]))
  const documents: DocumentView[] = (business.DOCUMENTS ?? []).map((row) => { const id = text(row, "id_document"); const typeId = text(row, "id_type_document"); const file = files.get(id); const relation = relations.get(id); return { id, typeId, type: types.get(typeId) ?? (typeId ? "Type non reconnu" : "—"), title: text(row, "titre_document"), reference: text(row, "numero_reference"), documentDate: text(row, "date_document"), receptionDate: text(row, "date_reception"), description: text(row, "description"), status: text(row, "statut"), observations: text(row, "observations"), fileRecordId: file ? text(file, "id_fichier") : "", fileId: file ? text(file, "id_fichier_drive") : "", fileName: file ? text(file, "nom_fichier") : "", fileUrl: file ? text(file, "url_fichier") : "", relationId: relation ? text(relation, "id_relation_document") : "", entityTypeId: relation ? text(relation, "id_type_entite") : "", entityId: relation ? text(relation, "id_entite") : "", relationType: relation ? text(relation, "type_relation") : "" } }).filter((item) => item.id)
  return { documents, typeOptions }
}

function dates(input: Record<string, unknown>, key: string, errors: Record<string, string>) { const raw = String(input[key] ?? "").trim(); if (!raw) return ""; try { return formatDateForSheet(raw) } catch { errors[key] = "Date invalide (JJMMAAAA)."; return raw } }
export function validateDocumentInput(input: Record<string, unknown>) {
  const value = (key: string) => String(input[key] ?? "").trim()
  const errors: Record<string, string> = {}
  const values = { id_type_document: value("id_type_document"), titre_document: value("titre_document"), numero_reference: value("numero_reference"), date_document: dates(input, "date_document", errors), date_reception: dates(input, "date_reception", errors), description: value("description"), statut: value("statut") || "ACTIF", observations: value("observations"), id_type_entite: value("id_type_entite"), id_entite: value("id_entite"), type_relation: value("type_relation") }
  if (!values.id_type_document) errors.id_type_document = "Le type est obligatoire."
  if (!values.titre_document) errors.titre_document = "Le titre est obligatoire."
  if (!!values.id_type_entite !== !!values.id_entite) errors.id_entite = "Le type et l’identifiant de rattachement doivent être renseignés ensemble."
  return { values, errors }
}
function nextId(existing: string[], prefix: string, now = new Date()) { const root = `VOL-${prefix}-${now.getFullYear()}-`; const max = existing.filter((id) => id.startsWith(root)).reduce((n, id) => Math.max(n, Number(id.slice(root.length)) || 0), 0); return `${root}${String(max + 1).padStart(6, "0")}` }

export async function createDocument(input: Record<string, unknown>, file?: File) {
  const { values, errors } = validateDocumentInput(input)
  if (Object.keys(errors).length) return { errors }
  const bundle = await loadDocuments()
  if (!bundle.typeOptions.some((item) => item.id === values.id_type_document)) return { errors: { id_type_document: "Type inconnu." } }
  const id = nextId(bundle.documents.map((item) => item.id), "DOC")
  let uploaded: Awaited<ReturnType<typeof uploadDocumentFile>> | undefined
  if (file?.size) uploaded = await uploadDocumentFile(id, values.titre_document, file)
  const records: Array<{ sheetName: string; record: Record<string, string> }> = [{ sheetName: "DOCUMENTS", record: { id_document: id, ...values } }]
  if (uploaded) records.push({ sheetName: "DOCUMENTS_FICHIERS", record: { id_fichier: nextId(bundle.documents.map((item) => item.fileId), "FIC"), id_document: id, nom_fichier: uploaded.name, type_fichier: uploaded.mimeType, url_fichier: uploaded.url, id_fichier_drive: uploaded.id, date_ajout: new Date().toISOString().slice(0, 10), observations: "" } })
  if (values.id_entite) records.push({ sheetName: "DOCUMENTS_RELATIONS", record: { id_relation_document: nextId(bundle.documents.map((item) => item.relationId), "RDO"), id_document: id, id_type_entite: values.id_type_entite, id_entite: values.id_entite, type_relation: values.type_relation || "CONCERNE", observations: "" } })
  try { await appendSheetRecordsBatch(env.googleSheets.documentsSpreadsheetId, records) } catch (error) { if (uploaded) await deleteDocumentFile(uploaded.id).catch(() => undefined); throw error }
  return { id, errors: {} }
}

export async function updateDocument(id: string, input: Record<string, unknown>) {
  const { values, errors } = validateDocumentInput(input); if (Object.keys(errors).length) return { errors }
  const bundle = await loadDocuments(); const current = bundle.documents.find((item) => item.id === id)
  if (!current) return { errors: { _form: "Document introuvable." } }
  if (!bundle.typeOptions.some((item) => item.id === values.id_type_document)) return { errors: { id_type_document: "Type inconnu." } }
  await updateSheetRecordById(env.googleSheets.documentsSpreadsheetId, "DOCUMENTS", "id_document", id, values)
  if (current.relationId) await updateSheetRecordById(env.googleSheets.documentsSpreadsheetId, "DOCUMENTS_RELATIONS", "id_relation_document", current.relationId, { id_type_entite: values.id_type_entite, id_entite: values.id_entite, type_relation: values.type_relation || "CONCERNE" })
  else if (values.id_entite) await appendSheetRecordsBatch(env.googleSheets.documentsSpreadsheetId, [{ sheetName: "DOCUMENTS_RELATIONS", record: { id_relation_document: nextId(bundle.documents.map((item) => item.relationId), "RDO"), id_document: id, id_type_entite: values.id_type_entite, id_entite: values.id_entite, type_relation: values.type_relation || "CONCERNE", observations: "" } }])
  return { id, errors: {} }
}

export async function replaceDocumentFile(id: string, file: File) {
  const bundle = await loadDocuments(); const current = bundle.documents.find((item) => item.id === id); if (!current) throw new Error("Document introuvable.")
  const uploaded = await uploadDocumentFile(id, current.title, file)
  try {
    if (current.fileRecordId) await updateSheetRecordById(env.googleSheets.documentsSpreadsheetId, "DOCUMENTS_FICHIERS", "id_fichier", current.fileRecordId, { nom_fichier: uploaded.name, type_fichier: uploaded.mimeType, url_fichier: uploaded.url, id_fichier_drive: uploaded.id, date_ajout: new Date().toISOString().slice(0, 10) })
    else await appendSheetRecordsBatch(env.googleSheets.documentsSpreadsheetId, [{ sheetName: "DOCUMENTS_FICHIERS", record: { id_fichier: nextId(bundle.documents.map((item) => item.fileId), "FIC"), id_document: id, nom_fichier: uploaded.name, type_fichier: uploaded.mimeType, url_fichier: uploaded.url, id_fichier_drive: uploaded.id, date_ajout: new Date().toISOString().slice(0, 10), observations: "" } }])
  } catch (error) { await deleteDocumentFile(uploaded.id).catch(() => undefined); throw error }
  if (current.fileId) await deleteDocumentFile(current.fileId).catch((error) => console.warn("Ancien fichier Drive non supprimé", error))
  return uploaded
}
