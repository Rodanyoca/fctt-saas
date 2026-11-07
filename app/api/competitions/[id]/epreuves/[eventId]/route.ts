import { NextResponse } from "next/server"
import { asDomainResponse, updateEvent } from "@/lib/competition-structure"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; eventId: string }> }) { try { const { id, eventId } = await params; return NextResponse.json(await updateEvent(decodeURIComponent(id), decodeURIComponent(eventId), await request.json())) } catch (error) { const response = asDomainResponse(error); return NextResponse.json(response.body, { status: response.status }) } }
