import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { getLigues } from "@/lib/data"
import { isTerritorialGoogleSheetsConfigured } from "@/lib/env"
import { createLigue } from "@/lib/territorial-mutations"

export const runtime = "nodejs"

export async function GET() {
  try {
    const ligues = await getLigues()
    const configured = isTerritorialGoogleSheetsConfigured()
    return NextResponse.json({
      ligues,
      configured,
      message: configured ? undefined : "Le référentiel territorial n’est pas encore connecté.",
    })
  } catch {
    return NextResponse.json({
      ligues: [],
      configured: isTerritorialGoogleSheetsConfigured(),
      message: "Les données de cette section sont momentanément indisponibles.",
    })
  }
}

export async function POST(request: Request) {
  if (!isTerritorialGoogleSheetsConfigured()) {
    return NextResponse.json({ message: "Le classeur territorial n’est pas configuré." }, { status: 503 })
  }
  try {
    const ligue = await createLigue(await request.json())
    revalidatePath("/ligues")
    revalidatePath("/")
    return NextResponse.json({ message: "Ligue créée avec succès.", ligue }, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Création impossible."
    return NextResponse.json({ message }, { status: 400 })
  }
}
