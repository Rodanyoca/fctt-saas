import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"
import { createOfficiel } from "@/lib/officiel-mutations"

export async function POST(request: Request) {
  if (!isActeursGoogleSheetsConfigured()) return NextResponse.json({ message: "Le classeur Acteurs n’est pas configuré." }, { status: 503 })
  try {
    const officiel = await createOfficiel(await request.json())
    revalidatePath("/officiels")
    return NextResponse.json({ message: "L’officiel a été créé avec succès.", officiel }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Création impossible."
    return NextResponse.json({ message }, { status: message.includes("existe déjà") ? 409 : 400 })
  }
}
