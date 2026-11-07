import { NextResponse } from "next/server"
import { asDomainResponse, createEvent } from "@/lib/competition-structure"

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) { try { const { id } = await params; return NextResponse.json(await createEvent(decodeURIComponent(id), await request.json()), { status: 201 }) } catch (error) { const response = asDomainResponse(error); return NextResponse.json(response.body, { status: response.status }) } }
