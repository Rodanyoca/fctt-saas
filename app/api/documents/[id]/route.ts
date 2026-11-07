import { NextResponse } from "next/server"
import { replaceDocumentFile, updateDocument } from "@/lib/documents"
export const runtime = "nodejs"
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try { const { id } = await context.params; const result = await updateDocument(id, await request.json() as Record<string, unknown>); const errors: Record<string, string> = result.errors; const formError = errors._form; if (Object.keys(errors).length) return NextResponse.json({ error: formError ?? "Veuillez corriger les champs indiqués.", fields: errors }, { status: formError ? 404 : 422 }); return NextResponse.json({ id }) }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Modification impossible." }, { status: 503 }) }
}
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try { const { id } = await context.params; const form = await request.formData(); const file = form.get("file"); if (!(file instanceof File) || !file.size) return NextResponse.json({ error: "Le fichier PDF est obligatoire." }, { status: 422 }); return NextResponse.json(await replaceDocumentFile(id, file)) }
  catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : "Remplacement impossible." }, { status: 503 }) }
}
