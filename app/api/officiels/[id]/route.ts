import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"
import { updateOfficiel } from "@/lib/officiel-mutations"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isActeursGoogleSheetsConfigured()) return NextResponse.json({ message: "Le classeur Acteurs n’est pas configuré." }, { status: 503 })
  try {
    const { id } = await context.params
    const officiel = await updateOfficiel(decodeURIComponent(id), await request.json())
    revalidatePath("/officiels")
    return NextResponse.json({ message: "L’officiel a été modifié avec succès.", officiel })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Modification impossible."
    return NextResponse.json({ message }, { status: message === "Officiel introuvable." ? 404 : 400 })
  }
}
