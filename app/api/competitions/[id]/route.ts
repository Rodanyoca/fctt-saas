import { NextResponse } from "next/server"
import { env } from "@/lib/env"
import { updateSheetRecordById } from "@/lib/google-sheets"
import { loadCompetitionBundle, validateCompetitionInput } from "@/lib/competitions-v2"

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  try {
    const bundle = await loadCompetitionBundle()
    const competition = bundle.competitions.find((item) => item.id === decodeURIComponent(id))
    return competition ? NextResponse.json({ competition }) : NextResponse.json({ error: "Compétition introuvable." }, { status: 404 })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Lecture impossible." }, { status: 503 }) }
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const competitionId = decodeURIComponent(id)
  try {
    const [body, bundle] = await Promise.all([request.json() as Promise<Record<string, unknown>>, loadCompetitionBundle()])
    const current = bundle.competitions.find((item) => item.id === competitionId)
    if (!current) return NextResponse.json({ error: "Compétition introuvable." }, { status: 404 })
    if (current.statut === "TERMINEE") return NextResponse.json({ error: "Cette compétition est clôturée." }, { status: 409 })
    const { values, errors } = validateCompetitionInput(body)
    if (Object.keys(errors).length) return NextResponse.json({ error: "Veuillez corriger les champs indiqués.", fields: errors }, { status: 400 })
    if (values.statut === "TERMINEE") return NextResponse.json({ error: "Utilisez l’action de clôture afin d’exécuter les contrôles préalables.", fields: { statut: "Clôture contrôlée obligatoire." } }, { status: 409 })
    for (const [field, sheet] of [["id_type_competition", "TYPES_COMPETITIONS"], ["id_discipline", "DISCIPLINES"], ["id_saison", "SAISON"]] as const) if (!(bundle.references[sheet] ?? []).some((item) => item.id === values[field])) return NextResponse.json({ error: "Valeur de référentiel inconnue.", fields: { [field]: "Valeur inconnue." } }, { status: 400 })
    await updateSheetRecordById(env.googleSheets.competitionsSpreadsheetId, "COMPETITIONS", "id_competition", competitionId, values)
    return NextResponse.json({ id: competitionId })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Modification impossible." }, { status: 503 }) }
}
