import { NextResponse } from "next/server"
import { asDomainResponse, createGroup, createPhase } from "@/lib/competition-structure"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) { try { const { id } = await params, body = await request.json() as Record<string, unknown>; const result = body.kind === "group" ? await createGroup(decodeURIComponent(id), body) : await createPhase(decodeURIComponent(id), body); return NextResponse.json(result, { status: 201 }) } catch (error) { const response = asDomainResponse(error); return NextResponse.json(response.body, { status: response.status }) } }
