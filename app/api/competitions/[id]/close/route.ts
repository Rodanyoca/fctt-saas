import { NextResponse } from "next/server"
import { closeCompetition } from "@/lib/competition-lifecycle"
import { asDomainResponse } from "@/lib/competition-structure"

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) { try { const { id } = await params; return NextResponse.json(await closeCompetition(decodeURIComponent(id))) } catch (error) { const response = asDomainResponse(error); return NextResponse.json(response.body, { status: response.status }) } }
