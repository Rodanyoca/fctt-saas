"use client"
import { useMemo, useState } from "react"
import { ExternalLink, Pencil, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable, type Column, type Filter } from "@/components/dashboard/data-table"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { formatDateForDisplay } from "@/lib/compact-date"
import { DocumentForm } from "@/components/documents/document-form"
import type { DocumentOption, DocumentView } from "@/lib/documents"

export function DocumentsClient({ documents, types, initialError }: { documents: DocumentView[]; types: DocumentOption[]; initialError: string }) {
  const [open, setOpen] = useState(false); const [selected, setSelected] = useState<DocumentView | undefined>()
  const columns: Column<DocumentView>[] = useMemo(() => [{ key: "type", header: "Type" }, { key: "title", header: "Titre", className: "font-medium" }, { key: "reference", header: "Référence", render: (item) => item.reference || "—" }, { key: "documentDate", header: "Date", render: (item) => formatDateForDisplay(item.documentDate) || "—" }, { key: "status", header: "Statut", render: (item) => <StatusBadge status={item.status} /> }, { key: "fileUrl", header: "Fichier", render: (item) => item.fileUrl ? <a href={item.fileUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-brand-blue hover:underline" onClick={(event) => event.stopPropagation()}>Ouvrir<ExternalLink className="size-3" /></a> : <span className="text-muted-foreground">Indisponible</span> }, { key: "id", header: "Actions", render: (item) => <Button variant="ghost" size="icon" aria-label={`Modifier ${item.title}`} onClick={(event) => { event.stopPropagation(); setSelected(item); setOpen(true) }}><Pencil className="size-4" /></Button> }], [])
  const filters: Filter[] = useMemo(() => [{ key: "type", label: "Type", options: types.map((item) => ({ value: item.label, label: item.label })) }, { key: "status", label: "Statut", options: [...new Set(documents.map((item) => item.status).filter(Boolean))].map((value) => ({ value, label: value.replaceAll("_", " ") })) }], [documents, types])
  return <div className="space-y-4">{initialError ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{initialError}</p> : null}<div className="flex justify-end"><Button className="bg-brand-gold text-slate-950 hover:bg-brand-gold/90" onClick={() => { setSelected(undefined); setOpen(true) }}><Plus className="size-4" />Ajouter un document</Button></div><DataTable data={documents} columns={columns} filters={filters} searchPlaceholder="Rechercher un document..." idKey="id" /><DocumentForm open={open} onOpenChange={(value) => { setOpen(value); if (!value) setSelected(undefined) }} types={types} document={selected} /></div>
}
