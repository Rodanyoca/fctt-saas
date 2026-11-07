import { env } from "@/lib/env"
import "server-only"

import { Readable } from "node:stream"
import { google } from "googleapis"

export const AVATAR_ENTITY_TYPES = ["athlete", "coach", "arbitre", "medecin", "officiel"] as const
export type AvatarEntityType = (typeof AVATAR_ENTITY_TYPES)[number]

const MAX_AVATAR_SIZE = 5 * 1024 * 1024
const extensions: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
}
const folderVariables: Record<AvatarEntityType, string> = {
  athlete: "GOOGLE_DRIVE_ATHLETES_FOLDER_ID",
  coach: "GOOGLE_DRIVE_ENTRAINEURS_FOLDER_ID",
  arbitre: "GOOGLE_DRIVE_ARBITRES_FOLDER_ID",
  medecin: "GOOGLE_DRIVE_MEDECINS_FOLDER_ID",
  officiel: "GOOGLE_DRIVE_OFFICIELS_FOLDER_ID",
}

const requiredEnv = (name: string) => {
  const value = (process.env[name] ?? "").trim()
  if (!value) throw new Error(`Configuration Google incomplète : ${name} est obligatoire.`)
  return value
}

export function isAvatarEntityType(value: string): value is AvatarEntityType {
  return AVATAR_ENTITY_TYPES.includes(value as AvatarEntityType)
}

function driveClient(entityType?: AvatarEntityType) {
  if (!env.googleSheets.clientEmail) throw new Error("Service de fichiers non connecté dans la démonstration FEACO.")

  const auth = new google.auth.OAuth2(
    requiredEnv("GOOGLE_CLIENT_ID"),
    requiredEnv("GOOGLE_CLIENT_SECRET"),
  )
  auth.setCredentials({ refresh_token: requiredEnv("GOOGLE_REFRESH_TOKEN") })
  const rootFolderId = requiredEnv("GOOGLE_DRIVE_ROOT_FOLDER_ID")
  const folderId = entityType
    ? (process.env[folderVariables[entityType]] ?? "").trim() || rootFolderId
    : rootFolderId
  return { drive: google.drive({ version: "v3", auth }), folderId }
}

export async function uploadActorAvatar(entityType: AvatarEntityType, entityId: string, file: File) {
  const extension = extensions[file.type]
  if (!extension) throw new Error("L’avatar doit être une image JPEG, PNG ou WebP.")
  if (!file.size) throw new Error("Le fichier image est vide.")
  if (file.size > MAX_AVATAR_SIZE) throw new Error("L’avatar ne peut pas dépasser 5 Mo.")

  const { drive, folderId } = driveClient(entityType)
  const buffer = Buffer.from(await file.arrayBuffer())
  const result = await drive.files.create({
    supportsAllDrives: true,
    requestBody: {
      name: `${entityId}.${extension}`,
      parents: [folderId],
      appProperties: { entityType, entityId, mediaType: "avatar" },
    },
    media: { mimeType: file.type, body: Readable.from(buffer) },
    fields: "id,name,mimeType,size",
  })
  if (!result.data.id) throw new Error("Google Drive n’a pas retourné l’identifiant de l’avatar.")
  return {
    driveFileId: result.data.id,
    avatarUrl: `/api/avatars/${entityType}/${encodeURIComponent(result.data.id)}`,
  }
}

export async function trashDriveAvatar(driveFileId: string) {
  const { drive } = driveClient()
  await drive.files.update({
    fileId: driveFileId,
    supportsAllDrives: true,
    requestBody: { trashed: true },
    fields: "id,trashed",
  })
}

export async function downloadDriveAvatar(driveFileId: string) {
  const { drive } = driveClient()
  const metadata = await drive.files.get({
    fileId: driveFileId,
    supportsAllDrives: true,
    fields: "mimeType,size",
  })
  if (!metadata.data.mimeType?.startsWith("image/")) throw new Error("Le fichier demandé n’est pas une image.")
  const content = await drive.files.get(
    { fileId: driveFileId, supportsAllDrives: true, alt: "media" },
    { responseType: "arraybuffer" },
  )
  return {
    content: Buffer.from(content.data as ArrayBuffer),
    mimeType: metadata.data.mimeType,
  }
}
