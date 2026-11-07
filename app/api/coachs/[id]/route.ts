import { revalidatePath } from "next/cache"
import { NextResponse } from "next/server"
import { updateCoach } from "@/lib/coach-mutations"
import { isActeursGoogleSheetsConfigured } from "@/lib/env"

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  if (!isActeursGoogleSheetsConfigured()) return NextResponse.json({ message: "Le classeur Acteurs n’est pas configuré." }, { status: 503 })
  try {
    const { id } = await context.params
    const coach = await updateCoach(decodeURIComponent(id), await request.json())
    revalidatePath("/coachs")
    return NextResponse.json({ message: "Le coach a été modifié avec succès.", coach })
  } catch (error) {
    const message = error instanceof Error ? error.message : "Modification impossible."
    return NextResponse.json({ message }, { status: message === "Coach introuvable." ? 404 : 400 })
  }
}
