import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { getClubs } from "@/lib/data"
import { updateClubLogo } from "@/lib/club-mutations"
import { trashDriveAvatar } from "@/lib/google-actor-avatar"
import { uploadClubLogo } from "@/lib/google-club-logo"
import { isTerritorialGoogleSheetsConfigured } from "@/lib/env"

export const runtime = "nodejs"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isTerritorialGoogleSheetsConfigured()) return NextResponse.json({ message: "Le classeur territorial n’est pas configuré." }, { status: 503 })
  let newDriveFileId = ""
  try {
    const { id } = await context.params
    const idClub = decodeURIComponent(id)
    const club = (await getClubs()).find((item) => item.idClub === idClub)
    if (!club) return NextResponse.json({ message: "Club introuvable." }, { status: 404 })
    const file = (await request.formData()).get("logo")
    if (!(file instanceof File)) return NextResponse.json({ message: "L’image du logo est obligatoire." }, { status: 400 })
    const uploaded = await uploadClubLogo(idClub, file)
    newDriveFileId = uploaded.driveFileId
    const updated = await updateClubLogo(idClub, uploaded.driveFileId, uploaded.logoUrl)
    if (club.logoDriveId && club.logoDriveId !== uploaded.driveFileId) await trashDriveAvatar(club.logoDriveId).catch(() => undefined)
    revalidatePath("/clubs")
    return NextResponse.json({ message: "Le logo du club a été enregistré.", club: updated })
  } catch (error) {
    if (newDriveFileId) await trashDriveAvatar(newDriveFileId).catch(() => undefined)
    const message = error instanceof Error ? error.message : "Envoi du logo impossible."
    return NextResponse.json({ message }, { status: message.startsWith("Configuration Google incomplète") ? 503 : 400 })
  }
}
