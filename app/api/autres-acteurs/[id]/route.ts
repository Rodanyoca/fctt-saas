import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"
import { updateAutreActeur } from "@/lib/autres-acteurs-mutations"

export const runtime = "nodejs"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isActeursGoogleSheetsConfigured()) return NextResponse.json({ message: "Le classeur Acteurs n’est pas configuré." }, { status: 503 })
  try {
    const { id } = await context.params
    const acteur = await updateAutreActeur(decodeURIComponent(id), await request.json())
    revalidatePath("/autres-acteurs")
    return NextResponse.json({ message: "L’autre acteur a été modifié avec succès.", acteur })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Modification impossible."
    return NextResponse.json({ message }, { status: message.includes("introuvable") ? 404 : 400 })
  }
}
