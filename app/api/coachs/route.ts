import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { createCoach } from "@/lib/coach-mutations"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"

export async function POST(request: Request) {
  if (!isActeursGoogleSheetsConfigured()) return NextResponse.json({ message: "Le classeur Acteurs n’est pas configuré." }, { status: 503 })
  try {
    const coach = await createCoach(await request.json())
    revalidatePath("/coachs")
    return NextResponse.json({ message: "Le coach a été créé avec succès.", coach }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Création impossible."
    return NextResponse.json({ message }, { status: message.includes("existe déjà") ? 409 : 400 })
  }
}
