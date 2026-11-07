import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { isTerritorialGoogleSheetsConfigured } from "@/lib/env"
import { updateLigue } from "@/lib/territorial-mutations"

export const runtime = "nodejs"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isTerritorialGoogleSheetsConfigured()) {
    return NextResponse.json({ message: "Le classeur territorial n’est pas configuré." }, { status: 503 })
  }
  try {
    const { id } = await context.params
    const ligue = await updateLigue(decodeURIComponent(id), await request.json())
    revalidatePath("/ligues")
    revalidatePath("/")
    return NextResponse.json({ message: "Ligue modifiée avec succès.", ligue })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Modification impossible."
    return NextResponse.json({ message }, { status: 400 })
  }
}
