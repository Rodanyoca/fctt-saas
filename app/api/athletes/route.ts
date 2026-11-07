import { playerResponse } from "@/lib/fctt/api"
export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export async function GET(request: Request) { return playerResponse(request) }
