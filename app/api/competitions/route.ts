import { NextResponse } from "next/server"
import { appendSheetRecord } from "@/lib/google-sheets"
import { env } from "@/lib/env"
import { loadCompetitionBundle, nextCompetitionId, validateCompetitionInput } from "@/lib/competitions-v2"

export async function GET() {
  try { return NextResponse.json(await loadCompetitionBundle()) } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Lecture impossible." }, { status: 503 }) }
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>
    const { values, errors } = validateCompetitionInput(body)
    if (Object.keys(errors).length) return NextResponse.json({ error: "Veuillez corriger les champs indiqués.", fields: errors }, { status: 400 })
    if (values.statut === "TERMINEE") return NextResponse.json({ error: "Une nouvelle compétition ne peut pas être créée comme clôturée.", fields: { statut: "Statut initial invalide." } }, { status: 400 })
    const bundle = await loadCompetitionBundle()
    for (const [field, sheet] of [["id_type_competition", "TYPES_COMPETITIONS"], ["id_discipline", "DISCIPLINES"], ["id_saison", "SAISON"]] as const) {
      if (!(bundle.references[sheet] ?? []).some((item) => item.id === values[field])) return NextResponse.json({ error: "Valeur de référentiel inconnue.", fields: { [field]: "Valeur inconnue." } }, { status: 400 })
    }
    const season = bundle.references.SAISON.find((item) => item.id === values.id_saison)?.label ?? values.id_saison
    const id = nextCompetitionId(bundle.competitions.map((item) => item.id), season)
    await appendSheetRecord(env.googleSheets.competitionsSpreadsheetId, "COMPETITIONS", { id_competition: id, ...values })
    return NextResponse.json({ id }, { status: 201 })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Création impossible." }, { status: 503 }) }
}
