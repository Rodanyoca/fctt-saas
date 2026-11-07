import { NextResponse } from "next/server"
import { updateDistinction } from "@/lib/competition-distinctions"
import { asDomainResponse } from "@/lib/competition-structure"

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string; distinctionId: string }> }) { try { const { id, distinctionId } = await params; return NextResponse.json(await updateDistinction(decodeURIComponent(id), decodeURIComponent(distinctionId), await request.json())) } catch (error) { const response = asDomainResponse(error); return NextResponse.json(response.body, { status: response.status }) } }
