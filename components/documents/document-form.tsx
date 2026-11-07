"use client"
import { FormEvent, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { formatCompactDateInput, formatDateForDisplay } from "@/lib/compact-date"
import type { DocumentOption, DocumentView } from "@/lib/documents"

const blank = { id_type_document: "", titre_document: "", numero_reference: "", date_document: "", date_reception: "", description: "", statut: "ACTIF", observations: "", id_type_entite: "", id_entite: "", type_relation: "CONCERNE" }
type Values = typeof blank
const fromDocument = (item?: DocumentView): Values => item ? { id_type_document: item.typeId, titre_document: item.title, numero_reference: item.reference, date_document: formatDateForDisplay(item.documentDate), date_reception: formatDateForDisplay(item.receptionDate), description: item.description, statut: item.status || "ACTIF", observations: item.observations, id_type_entite: item.entityTypeId, id_entite: item.entityId, type_relation: item.relationType || "CONCERNE" } : blank

export function DocumentForm({ open, onOpenChange, types, document }: { open: boolean; onOpenChange: (value: boolean) => void; types: DocumentOption[]; document?: DocumentView }) {
  const router = useRouter(); const [form, setForm] = useState<Values>(() => fromDocument(document)); const [file, setFile] = useState<File | null>(null); const [errors, setErrors] = useState<Record<string, string>>({}); const [pending, setPending] = useState(false)
  useEffect(() => { if (open) { setForm(fromDocument(document)); setFile(null); setErrors({}) } }, [document, open])
  const set = (key: keyof Values, value: string) => setForm((current) => ({ ...current, [key]: value }))
  async function submit(event: FormEvent) {
    event.preventDefault(); setPending(true); setErrors({})
    try {
      let response: Response
      if (document) {
        response = await fetch(`/api/documents/${encodeURIComponent(document.id)}`, { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(form) })
        if (response.ok && file) { const files = new FormData(); files.append("file", file); response = await fetch(`/api/documents/${encodeURIComponent(document.id)}`, { method: "PATCH", body: files }) }
      } else { const body = new FormData(); body.append("metadata", JSON.stringify(form)); if (file) body.append("file", file); response = await fetch("/api/documents", { method: "POST", body }) }
      const payload = await response.json(); if (!response.ok) { setErrors(payload.fields ?? {}); throw new Error(payload.error ?? "Enregistrement impossible.") }
      toast.success(document ? "Document modifié" : "Document créé"); setForm(blank); setFile(null); onOpenChange(false); router.refresh()
    } catch (error) { toast.error(error instanceof Error ? error.message : "Enregistrement impossible.") } finally { setPending(false) }
  }
  const input = (label: string, key: keyof Values, wide = false) => <div className={`space-y-2 ${wide ? "sm:col-span-2" : ""}`}><Label htmlFor={`document-${key}`}>{label}</Label><Input id={`document-${key}`} value={form[key]} onChange={(e) => set(key, e.target.value)} />{errors[key] ? <p className="text-xs text-destructive">{errors[key]}</p> : null}</div>
  const date = (label: string, key: "date_document" | "date_reception") => <div className="space-y-2"><Label htmlFor={`document-${key}`}>{label}</Label><Input id={`document-${key}`} inputMode="numeric" maxLength={10} placeholder="JJMMAAAA" pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}" value={form[key]} onChange={(e) => set(key, formatCompactDateInput(e.target.value))} />{errors[key] ? <p className="text-xs text-destructive">{errors[key]}</p> : null}</div>
  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent className="w-full overflow-y-auto sm:max-w-2xl"><SheetHeader><SheetTitle>{document ? "Modifier le document" : "Ajouter un document"}</SheetTitle><SheetDescription>PDF facultatif, 25 Mo maximum. Les séparateurs des dates sont automatiques.</SheetDescription></SheetHeader><form id="document-form" onSubmit={submit} className="grid gap-4 px-4 sm:grid-cols-2"><div className="space-y-2"><Label>Type *</Label><Select value={form.id_type_document} onValueChange={(v) => set("id_type_document", v)}><SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{types.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select>{errors.id_type_document ? <p className="text-xs text-destructive">{errors.id_type_document}</p> : null}</div>{input("Titre *", "titre_document")}{input("Référence", "numero_reference")}{date("Date du document", "date_document")}{date("Date de réception", "date_reception")}<div className="space-y-2"><Label>Statut</Label><Select value={form.statut} onValueChange={(v) => set("statut", v)}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{["ACTIF", "ARCHIVE", "BROUILLON"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent></Select></div>{input("Type d’entité liée", "id_type_entite")}{input("Identifiant de l’entité", "id_entite")}{input("Type de relation", "type_relation", true)}<div className="space-y-2 sm:col-span-2"><Label>Description</Label><Textarea value={form.description} onChange={(e) => set("description", e.target.value)} /></div><div className="space-y-2 sm:col-span-2"><Label>Observations</Label><Textarea value={form.observations} onChange={(e) => set("observations", e.target.value)} /></div><div className="space-y-2 sm:col-span-2"><Label htmlFor="document-file">{document?.fileId ? "Remplacer le PDF" : "Fichier PDF"}</Label><Input id="document-file" type="file" accept="application/pdf,.pdf" onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div></form><SheetFooter><Button form="document-form" disabled={pending} className="bg-brand-gold text-slate-950 hover:bg-brand-gold/90">{pending ? "Enregistrement..." : document ? "Enregistrer" : "Créer"}</Button></SheetFooter></SheetContent></Sheet>
}
