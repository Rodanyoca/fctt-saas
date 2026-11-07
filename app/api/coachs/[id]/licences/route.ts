import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { isAffiliationsGoogleSheetsConfigured } from "@/lib/env"
import { createCoachLicence } from "@/lib/coach-licence-mutations"

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isAffiliationsGoogleSheetsConfigured()) {
    return NextResponse.json({ message: "Le classeur Affiliations et licences n’est pas configuré." }, { status: 503 })
  }
  try {
    const { id } = await context.params
    const result = await createCoachLicence(decodeURIComponent(id), await request.json())
    revalidatePath("/coachs")
    return NextResponse.json({ message: "La licence du coach a été créée avec succès.", ...result }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Création impossible."
    return NextResponse.json({ message }, { status: message === "Coach introuvable." ? 404 : 400 })
  }
}
