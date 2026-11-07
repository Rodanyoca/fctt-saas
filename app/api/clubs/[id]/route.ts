import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { updateClub } from "@/lib/club-mutations"
import { isTerritorialGoogleSheetsConfigured } from "@/lib/env"

export const runtime = "nodejs"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isTerritorialGoogleSheetsConfigured()) {
    return NextResponse.json({ message: "Le classeur territorial n’est pas configuré." }, { status: 503 })
  }
  try {
    const { id } = await context.params
    const club = await updateClub(decodeURIComponent(id), await request.json())
    revalidatePath("/clubs")
    revalidatePath("/ligues")
    return NextResponse.json({ message: "Le club a été modifié avec succès.", club })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Modification impossible."
    const status = message.includes("introuvable") ? 404 : message.includes("existe déjà") ? 409 : 400
    return NextResponse.json({ message }, { status })
  }
}
