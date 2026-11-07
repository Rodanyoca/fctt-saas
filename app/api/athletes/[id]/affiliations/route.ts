import { NextResponse } from "next/server"
import { getAthleteAffiliations } from "@/lib/actor-records"
export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const affiliations = (await getAthleteAffiliations()).filter(item => item.actorId === decodeURIComponent(id))
  return NextResponse.json({ affiliations, demonstration: true })
}
