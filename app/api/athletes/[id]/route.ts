import { playerResponse } from "@/lib/fctt/api"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export async function GET(request: Request, context: { params: Promise<{ id: string }> }) { return playerResponse(request, (await context.params).id) }
