"use client"

import { useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable, type Column, type Filter } from "@/components/dashboard/data-table"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { CompetitionForm } from "@/components/competitions/competition-form"
import { formatDateForDisplay } from "@/lib/compact-date"
import type { CompetitionView, Option } from "@/lib/competitions-v2"

const columns: Column<CompetitionView>[] = [
  { key: "saison", header: "Saison" },
  { key: "nom", header: "Nom de la compétition", className: "font-medium" },
  { key: "dateDebut", header: "Début", render: (item) => formatDateForDisplay(item.dateDebut) || "—" },
  { key: "dateFin", header: "Fin", render: (item) => formatDateForDisplay(item.dateFin) || "—" },
  { key: "pays", header: "Pays", render: (item) => item.pays || "—" },
  { key: "statut", header: "Statut", render: (item) => <StatusBadge status={item.statut} /> },
]

export function CompetitionsClient({ competitions, references, initialError }: { competitions: CompetitionView[]; references: Record<string, Option[]>; initialError: string }) {
  const [createOpen, setCreateOpen] = useState(false)
  const filters: Filter[] = useMemo(() => [
    { key: "saison", label: "Saison", options: [...new Map(competitions.map((item) => [item.saison, { value: item.saison, label: item.saison }])).values()] },
    { key: "pays", label: "Pays", options: [...new Map(competitions.filter((item) => item.pays).map((item) => [item.pays, { value: item.pays, label: item.pays }])).values()] },
    { key: "statut", label: "Statut", options: [...new Map(competitions.filter((item) => item.statut).map((item) => [item.statut, { value: item.statut, label: item.statut }])).values()] },
  ], [competitions])
  return <div className="space-y-4">
    {initialError ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{initialError}</p> : null}
    <div className="flex justify-end"><Button onClick={() => setCreateOpen(true)} className="bg-brand-gold text-slate-950 hover:bg-brand-gold/90"><Plus className="size-4" />Créer une compétition</Button></div>
    <DataTable data={competitions} columns={columns} filters={filters} searchPlaceholder="Rechercher une compétition..." detailHref={(item) => `/competitions/${encodeURIComponent(item.id)}?tab=general`} idKey="id" />
    <CompetitionForm open={createOpen} onOpenChange={setCreateOpen} references={references} />
  </div>
}
