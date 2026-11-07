import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { isAffiliationsGoogleSheetsConfigured } from "@/lib/env"
import { createMedecinAffiliation } from "@/lib/medecin-affiliation-mutations"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isAffiliationsGoogleSheetsConfigured()) return NextResponse.json({ message: "Le classeur Affiliations n’est pas configuré." }, { status: 503 })
  try {
    const { id } = await context.params
    const result = await createMedecinAffiliation(decodeURIComponent(id), await request.json())
    revalidatePath("/medecins")
    return NextResponse.json({ message: "L’affiliation du médecin a été créée avec succès.", ...result }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Création impossible."
    return NextResponse.json({ message }, { status: message === "Médecin introuvable." ? 404 : 400 })
  }
}
