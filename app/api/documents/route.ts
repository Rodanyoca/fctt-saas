import { NextResponse } from "next/server"
import { createDocument, loadDocuments } from "@/lib/documents"
export async function GET() { try { return NextResponse.json(await loadDocuments()) } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Lecture impossible." }, { status: 503 }) } }
export async function POST(request: Request) {
  try {
    const form = await request.formData(); const metadata = JSON.parse(String(form.get("metadata") ?? "{}")) as Record<string, unknown>; const entry = form.get("file"); const file = entry instanceof File && entry.size ? entry : undefined
    const result = await createDocument(metadata, file)
    if (Object.keys(result.errors).length) return NextResponse.json({ error: "Veuillez corriger les champs indiqués.", fields: result.errors }, { status: 422 })
    return NextResponse.json({ id: result.id }, { status: 201 })
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Création impossible." }, { status: 503 }) }
}
