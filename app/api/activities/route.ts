import { NextResponse } from "next/server"
import { createActivity, loadActivities } from "@/lib/activities"

export async function GET() {
  try { return NextResponse.json(await loadActivities()) }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Lecture impossible." }, { status: 503 }) }
}

export async function POST(request: Request) {
  try {
    const result = await createActivity(await request.json() as Record<string, unknown>)
    if (Object.keys(result.errors).length) return NextResponse.json({ error: "Veuillez corriger les champs indiqués.", fields: result.errors }, { status: 422 })
    return NextResponse.json({ id: result.id }, { status: 201 })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Création impossible." }, { status: 503 }) }
}
