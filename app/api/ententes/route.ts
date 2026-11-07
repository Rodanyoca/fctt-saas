import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { isTerritorialGoogleSheetsConfigured } from "@/lib/env"
import { createEntente } from "@/lib/territorial-mutations"

export const runtime = "nodejs"

export async function POST(request: Request) {
  if (!isTerritorialGoogleSheetsConfigured()) {
    return NextResponse.json({ message: "Le classeur territorial n’est pas configuré." }, { status: 503 })
  }
  try {
    const entente = await createEntente(await request.json())
    revalidatePath("/ententes")
    revalidatePath("/ligues")
    return NextResponse.json({ message: "L’entente a été créée avec succès.", entente }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Création impossible."
    const status = message === "Ligue introuvable." ? 404 : message.includes("existe déjà") ? 409 : 400
    if (status === 400) console.error("Échec de la création d’une entente:", error)
    return NextResponse.json({ message }, { status })
  }
}
