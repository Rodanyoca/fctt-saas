import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"
import { createMedecin } from "@/lib/medecin-mutations"

export async function POST(request: Request) {
  if (!isActeursGoogleSheetsConfigured()) return NextResponse.json({ message: "Le classeur Acteurs n’est pas configuré." }, { status: 503 })
  try {
    const medecin = await createMedecin(await request.json())
    revalidatePath("/medecins")
    return NextResponse.json({ message: "Le médecin a été créé avec succès.", medecin }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Création impossible."
    return NextResponse.json({ message }, { status: message.includes("existe déjà") ? 409 : 400 })
  }
}
