import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { getArbitres, getAthletes, getCoachs, getMedecins, getOfficiels } from "@/lib/data"
import { updateAthleteAvatar } from "@/lib/athlete-mutations"
import { updateCoachAvatar } from "@/lib/coach-mutations"
import { updateArbitreAvatar } from "@/lib/arbitre-mutations"
import { updateMedecinAvatar } from "@/lib/medecin-mutations"
import { updateOfficielAvatar } from "@/lib/officiel-mutations"
import { isAvatarEntityType, trashDriveAvatar, uploadActorAvatar, type AvatarEntityType } from "@/lib/google-actor-avatar"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"

export const runtime = "nodejs"

async function actorContext(entityType: AvatarEntityType, entityId: string) {
  if (entityType === "athlete") {
    const actor = (await getAthletes()).find((item) => item.idAthlete === entityId)
    return { actor, update: updateAthleteAvatar, path: "/athletes" }
  }
  if (entityType === "coach") {
    const actor = (await getCoachs()).find((item) => item.idCoach === entityId)
    return { actor, update: updateCoachAvatar, path: "/coachs" }
  }
  if (entityType === "arbitre") {
    const actor = (await getArbitres()).find((item) => item.idArbitre === entityId)
    return { actor, update: updateArbitreAvatar, path: "/arbitres" }
  }
  if (entityType === "medecin") {
    const actor = (await getMedecins()).find((item) => item.idMedecin === entityId)
    return { actor, update: updateMedecinAvatar, path: "/medecins" }
  }
  const actor = (await getOfficiels()).find((item) => item.idOfficiel === entityId)
  return { actor, update: updateOfficielAvatar, path: "/officiels" }
}

export async function POST(request: Request, context: { params: Promise<{ type: string; id: string }> }) {
  if (!isActeursGoogleSheetsConfigured()) {
    return NextResponse.json({ message: "Le classeur Acteurs n’est pas configuré." }, { status: 503 })
  }
  let newDriveFileId = ""
  try {
    const params = await context.params
    if (!isAvatarEntityType(params.type)) {
      return NextResponse.json({ message: "Type d’acteur invalide." }, { status: 400 })
    }
    const entityId = decodeURIComponent(params.id)
    const current = await actorContext(params.type, entityId)
    if (!current.actor) return NextResponse.json({ message: "Acteur introuvable." }, { status: 404 })
    const formData = await request.formData()
    const file = formData.get("avatar")
    if (!(file instanceof File)) return NextResponse.json({ message: "L’image de l’avatar est obligatoire." }, { status: 400 })

    const uploaded = await uploadActorAvatar(params.type, entityId, file)
    newDriveFileId = uploaded.driveFileId
    const updated = await current.update(entityId, uploaded.driveFileId, uploaded.avatarUrl)
    if (current.actor.avatarDriveId && current.actor.avatarDriveId !== uploaded.driveFileId) {
      await trashDriveAvatar(current.actor.avatarDriveId).catch(() => undefined)
    }
    revalidatePath(current.path)
    return NextResponse.json({ message: "L’avatar a été enregistré.", actor: updated })
  } catch (error) {
    if (newDriveFileId) await trashDriveAvatar(newDriveFileId).catch(() => undefined)
    const message = error instanceof Error ? error.message : "Envoi de l’avatar impossible."
    return NextResponse.json({ message }, { status: message.startsWith("Configuration Google incomplète") ? 503 : 400 })
  }
}
