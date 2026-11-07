import { NextRequest, NextResponse } from "next/server"
import { localReadAccess } from "./lib/fctt/access"
export function proxy(request: NextRequest) {
  if (!localReadAccess(request)) return NextResponse.json({ error: { code: "access", message: "Acces local uniquement." } }, { status: 403 })
  if (!["GET", "HEAD", "OPTIONS"].includes(request.method)) return NextResponse.json({ error: { code: "readonly", message: "Les ecritures FCTT ne sont pas activees dans ce point de controle." } }, { status: 409 })
  const path = request.nextUrl.pathname
  if (/^\/(ligues|ententes|clubs|transferts|equipe-nationale|suivi-equipe-nationale|parametres)(?:\/|$)/.test(path)) return NextResponse.json({ message: "Module hors perimetre FCTT." }, { status: 404 })
  if (path.startsWith("/api/")) {
    if (/licences(?:\/|$)/.test(path)) return NextResponse.json({ message: "Bientot disponible" }, { status: 410 })
    if (!/^\/api\/athletes(?:\/[^/]+)?$/.test(path)) return NextResponse.json({ error: { code: "pending", message: "Ce service FCTT n'est pas encore raccorde." } }, { status: 503 })
  }
  const response = NextResponse.next()
  response.headers.set("Cache-Control", "private, no-store")
  return response
}
export const config = { matcher: ["/:path*"] }
