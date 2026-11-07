import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { isTerritorialGoogleSheetsConfigured } from "@/lib/env"
import { updateEntente } from "@/lib/territorial-mutations"

export const runtime = "nodejs"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isTerritorialGoogleSheetsConfigured()) {
    return NextResponse.json({ message: "Le classeur territorial n’est pas configuré." }, { status: 503 })
  }
  try {
    const { id } = await context.params
    const decodedId = decodeURIComponent(id).trim()
    if (!decodedId) {
      return NextResponse.json({ message: "L’identifiant de l’entente est obligatoire." }, { status: 400 })
    }
    const entente = await updateEntente(decodedId, await request.json())
    revalidatePath("/ligues")
    revalidatePath("/ententes")
    return NextResponse.json({ message: "Entente modifiée avec succès.", entente })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Modification impossible."
    const status =
      message === "Entente introuvable." || message === "Ligue introuvable."
        ? 404
        : message.includes("existe déjà")
          ? 409
          : 400
    if (status === 400) console.error("Échec de la modification d’une entente:", error)
    return NextResponse.json({ message }, { status })
  }
}
