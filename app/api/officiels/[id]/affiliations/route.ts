import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { isAffiliationsGoogleSheetsConfigured } from "@/lib/env"
import { createOfficielAffiliation } from "@/lib/officiel-affiliation-mutations"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isAffiliationsGoogleSheetsConfigured()) return NextResponse.json({ message: "Le classeur Affiliations n’est pas configuré." }, { status: 503 })
  try {
    const { id } = await context.params
    const result = await createOfficielAffiliation(decodeURIComponent(id), await request.json())
    revalidatePath("/officiels")
    return NextResponse.json({ message: "L’affiliation de l’officiel a été créée avec succès.", ...result }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Création impossible."
    return NextResponse.json({ message }, { status: message === "Officiel introuvable." ? 404 : 400 })
  }
}
