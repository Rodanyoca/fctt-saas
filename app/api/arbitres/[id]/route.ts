import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"
import { updateArbitre } from "@/lib/arbitre-mutations"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isActeursGoogleSheetsConfigured()) return NextResponse.json({ message: "Le classeur Acteurs n’est pas configuré." }, { status: 503 })
  try {
    const { id } = await context.params
    const arbitre = await updateArbitre(decodeURIComponent(id), await request.json())
    revalidatePath("/arbitres")
    return NextResponse.json({ message: "L’arbitre a été modifié avec succès.", arbitre })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Modification impossible."
    return NextResponse.json({ message }, { status: message === "Arbitre introuvable." ? 404 : 400 })
  }
}
