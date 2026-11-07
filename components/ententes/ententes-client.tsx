"use client"

import { useEffect, useMemo, useState } from "react"
import { Eye, Network } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable, type Column, type Filter } from "@/components/dashboard/data-table"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { CreateEntenteDialog, EditEntenteDialog, type SavedEntente } from "@/components/ententes/entente-form-dialog"
import { EntenteDetail } from "@/components/ententes/entente-detail"
import { Header } from "@/components/dashboard/header"
import { DataLoadNotice } from "@/components/dashboard/data-load-notice"
import type { Athlete, Club, Entente, Ligue } from "@/lib/types"

export function EntentesClient({ ententes, ligues, clubs, athletes, dataLoadError = false }: { ententes: Entente[]; ligues: Ligue[]; clubs: Club[]; athletes: Athlete[]; dataLoadError?: boolean }) {
  const [rows, setRows] = useState(ententes)
  const [selectedEntente, setSelectedEntente] = useState<Entente | null>(null)

  useEffect(() => setRows(ententes), [ententes])
  useEffect(() => {
    const returnToList = (event: Event) => {
      if ((event as CustomEvent<string>).detail === "/ententes") setSelectedEntente(null)
    }
    window.addEventListener("feaco:navigate", returnToList)
    return () => window.removeEventListener("feaco:navigate", returnToList)
  }, [])

  const applySavedEntente = (saved: SavedEntente) => {
    setRows((current) => {
      const previousId = saved.previousIdEntente || saved.idEntente
      const existing = current.find((item) => item.idEntente === previousId)
      const merged: Entente = { ...existing, ...saved, id: saved.idEntente, numeroOrdre: saved.codeEntente, nom: saved.nomEntente, pseudo: saved.pseudoEntente, ligueId: saved.idLigue, ligueNom: saved.nomLigue }
      return existing ? current.map((item) => item.idEntente === previousId ? merged : item) : [merged, ...current]
    })
    setSelectedEntente((current) => current?.idEntente === (saved.previousIdEntente || saved.idEntente) ? { ...current, ...saved, id: saved.idEntente, nom: saved.nomEntente, pseudo: saved.pseudoEntente, ligueId: saved.idLigue, ligueNom: saved.nomLigue } : current)
  }

  const columns: Column<Entente>[] = [
    { key: "idEntente", header: "ID", className: "font-mono text-sm" },
    { key: "nomEntente", header: "Entente", className: "font-medium" },
    { key: "pseudoEntente", header: "Pseudo" },
    { key: "nomLigue", header: "Ligue" },
    { key: "statut", header: "Statut", render: (entente) => <StatusBadge status={entente.statut} /> },
  ]
  const filters: Filter[] = useMemo(() => [
    { key: "nomLigue", label: "Ligue", options: Array.from(new Set(rows.map((entente) => entente.nomLigue).filter(Boolean))).sort().map((label) => ({ value: label, label })) },
    { key: "statut", label: "Statut", options: Array.from(new Set(rows.map((entente) => entente.statut).filter(Boolean))).sort().map((label) => ({ value: label, label })) },
  ], [rows])

  if (selectedEntente) return <><Header title={`Fiche Entente : ${selectedEntente.nomEntente || selectedEntente.idEntente}`} subtitle={selectedEntente.nomLigue || "Détail de l’entente"} /><main className="space-y-6 p-4 sm:p-6"><EntenteDetail entente={selectedEntente} ligues={ligues} clubs={clubs} athletes={athletes} onBack={() => setSelectedEntente(null)} onUpdated={applySavedEntente} /></main></>

  return <><Header title="Ententes" subtitle="Administration des ententes territoriales FEACO" /><main className="space-y-5 p-4 sm:p-6">
    <DataLoadNotice visible={dataLoadError} description="Une partie des données Ententes n’a pas pu être chargée. Les données disponibles restent affichées sans contenu fictif." />
    <div className="flex justify-end"><CreateEntenteDialog ligues={ligues} onSaved={applySavedEntente} /></div>
    <DataTable data={rows} columns={columns} filters={filters} searchPlaceholder="Rechercher une entente..." idKey="idEntente"
      renderActions={(entente) => <><Button variant="ghost" size="icon" onClick={() => setSelectedEntente(entente)} aria-label={`Voir ${entente.nomEntente}`} title="Voir"><Eye className="size-4" /></Button><EditEntenteDialog entente={entente} ligues={ligues} onSaved={applySavedEntente} /></>}
      renderMobileCard={(entente) => <div className="rounded-xl border border-border/80 bg-card p-4"><div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="truncate font-semibold">{entente.nomEntente || "Entente non renseignée"}</p><p className="mt-1 font-mono text-xs text-muted-foreground">{entente.idEntente || "-"}</p></div><StatusBadge status={entente.statut} /></div><p className="mt-3 flex items-center gap-2 text-sm text-muted-foreground"><Network className="size-4 text-primary" />{entente.nomLigue || "Ligue non renseignée"}</p><p className="mt-2 text-sm text-muted-foreground">Pseudo : {entente.pseudoEntente || "-"}</p><div className="mt-4 flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => setSelectedEntente(entente)} aria-label={`Voir ${entente.nomEntente}`}><Eye className="size-4" /></Button><EditEntenteDialog entente={entente} ligues={ligues} onSaved={applySavedEntente} /></div></div>}
    />
  </main></>
}
