import "server-only"
import { Readable } from "node:stream"
import { google } from "googleapis"
import { env } from "@/lib/env"

export const DOCUMENT_MAX_SIZE_BYTES = 25 * 1024 * 1024
const allowedTypes = new Set(["application/pdf"])
const required = (name: string, value: string | undefined) => { const clean = (value ?? "").trim(); if (!clean) throw new Error(`Configuration Google incomplète : ${name} est obligatoire.`); return clean }

function driveClient() {
  if (!env.googleSheets.clientEmail) throw new Error("Service de fichiers non connecté dans la démonstration FEACO.")

  const auth = new google.auth.OAuth2(required("GOOGLE_CLIENT_ID", process.env.GOOGLE_CLIENT_ID), required("GOOGLE_CLIENT_SECRET", process.env.GOOGLE_CLIENT_SECRET))
  auth.setCredentials({ refresh_token: required("GOOGLE_REFRESH_TOKEN", process.env.GOOGLE_REFRESH_TOKEN) })
  return google.drive({ version: "v3", auth })
}

export function validateDocumentFile(file: File) {
  if (!allowedTypes.has(file.type) && !file.name.toLowerCase().endsWith(".pdf")) throw new Error("Le fichier doit être au format PDF.")
  if (file.size < 5) throw new Error("Le fichier PDF est vide ou invalide.")
  if (file.size > DOCUMENT_MAX_SIZE_BYTES) throw new Error("Le fichier dépasse la taille maximale de 25 Mo.")
}

export async function uploadDocumentFile(documentId: string, title: string, file: File) {
  validateDocumentFile(file)
  const buffer = Buffer.from(await file.arrayBuffer())
  if (buffer.subarray(0, 5).toString("ascii") !== "%PDF-") throw new Error("Le fichier sélectionné n’est pas un PDF valide.")
  const safeTitle = title.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "").slice(0, 80)
  const drive = driveClient()
  const response = await drive.files.create({ supportsAllDrives: true, requestBody: { name: `${documentId}_${safeTitle || "DOCUMENT"}.pdf`, parents: [required("GOOGLE_DRIVE_DOCUMENTS_FOLDER_ID", env.googleSheets.documentsDriveFolderId)], appProperties: { entityType: "document", entityId: documentId } }, media: { mimeType: "application/pdf", body: Readable.from(buffer) }, fields: "id,name,mimeType,webViewLink" })
  if (!response.data.id) throw new Error("Google Drive n’a pas retourné l’identifiant du fichier.")
  return { id: response.data.id, name: response.data.name || file.name, mimeType: response.data.mimeType || "application/pdf", url: response.data.webViewLink || `https://drive.google.com/file/d/${response.data.id}/view` }
}

export async function deleteDocumentFile(fileId: string) {
  if (!fileId.trim()) return
  await driveClient().files.delete({ fileId, supportsAllDrives: true })
}
