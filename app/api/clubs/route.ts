import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { createClub } from "@/lib/club-mutations"
import { isTerritorialGoogleSheetsConfigured } from "@/lib/env"

export const runtime = "nodejs"

export async function POST(request: Request) {
  if (!isTerritorialGoogleSheetsConfigured()) {
    return NextResponse.json({ message: "Le classeur territorial n’est pas configuré." }, { status: 503 })
  }
  try {
    const club = await createClub(await request.json())
    revalidatePath("/clubs")
    revalidatePath("/ligues")
    return NextResponse.json({ message: "Le club a été créé avec succès.", club }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Création impossible."
    const status = message === "Entente introuvable." ? 404 : message.includes("existe déjà") ? 409 : 400
    return NextResponse.json({ message }, { status })
  }
}
