import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"
import { createAutreActeur } from "@/lib/autres-acteurs-mutations"

export const runtime = "nodejs"

export async function POST(request: Request) {
  if (!isActeursGoogleSheetsConfigured()) return NextResponse.json({ message: "Le classeur Acteurs n’est pas configuré." }, { status: 503 })
  try {
    const acteur = await createAutreActeur(await request.json())
    revalidatePath("/autres-acteurs")
    return NextResponse.json({ message: "L’autre acteur a été créé avec succès.", acteur }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Création impossible."
    return NextResponse.json({ message }, { status: message.includes("existe déjà") || message.includes("Collision") ? 409 : 400 })
  }
}
