import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { getAthletes } from "@/lib/data"
import { updateAthleteAvatar } from "@/lib/athlete-mutations"
import { trashDriveAvatar, uploadActorAvatar } from "@/lib/google-actor-avatar"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"

export const runtime = "nodejs"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isActeursGoogleSheetsConfigured()) {
    return NextResponse.json({ message: "Le classeur Acteurs n’est pas configuré." }, { status: 503 })
  }
  let newDriveFileId = ""
  try {
    const { id } = await context.params
    const idAthlete = decodeURIComponent(id)
    const athlete = (await getAthletes()).find((item) => item.idAthlete === idAthlete)
    if (!athlete) return NextResponse.json({ message: "Athlète introuvable." }, { status: 404 })
    const formData = await request.formData()
    const file = formData.get("avatar")
    if (!(file instanceof File)) return NextResponse.json({ message: "L’image de l’avatar est obligatoire." }, { status: 400 })
    const uploaded = await uploadActorAvatar("athlete", idAthlete, file)
    newDriveFileId = uploaded.driveFileId
    const updated = await updateAthleteAvatar(idAthlete, uploaded.driveFileId, uploaded.avatarUrl)
    if (athlete.avatarDriveId && athlete.avatarDriveId !== uploaded.driveFileId) {
      await trashDriveAvatar(athlete.avatarDriveId).catch(() => undefined)
    }
    revalidatePath("/athletes")
    return NextResponse.json({ message: "L’avatar de l’athlète a été enregistré.", athlete: updated })
  } catch (error) {
    if (newDriveFileId) await trashDriveAvatar(newDriveFileId).catch(() => undefined)
    const message = error instanceof Error ? error.message : "Envoi de l’avatar impossible."
    return NextResponse.json({ message }, { status: message.startsWith("Configuration Google incomplète") ? 503 : 400 })
  }
}
