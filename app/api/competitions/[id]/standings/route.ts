import { NextResponse } from "next/server"
import { qualifyUnit, recalculateStandings } from "@/lib/competition-standings"
import { asDomainResponse } from "@/lib/competition-structure"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) { try { const { id } = await params, body = await request.json() as Record<string, unknown>; const result = body.action === "qualify" ? await qualifyUnit(decodeURIComponent(id), body) : await recalculateStandings(decodeURIComponent(id), String(body.id_phase_competition ?? ""), String(body.id_groupe ?? "")); return NextResponse.json(result, { status: 201 }) } catch (error) { const response = asDomainResponse(error); return NextResponse.json(response.body, { status: response.status }) } }
