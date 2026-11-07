"use client"

import { useEffect, useState } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ActorTable } from "@/components/actors/actor-table"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { Medecin } from "@/lib/types"

export function MedecinsTable({ medecins, onViewMedecin }: { medecins: Medecin[]; onViewMedecin: (item: Medecin) => void }) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const pages = Math.max(1, Math.ceil(medecins.length / pageSize))
  useEffect(() => setPage((current) => Math.min(current, pages)), [pages])
  const visible = medecins.slice((page - 1) * pageSize, page * pageSize)

  return <div className="space-y-4">
    <ActorTable
      title="Liste des médecins"
      items={visible}
      onView={onViewMedecin}
      showId
      showCount={false}
      identityLayout="avatar-in-name"
      stackSexAge
      showSpecialite
      emptyMessage="Aucun médecin enregistré."
      toRow={(item) => ({
        id: item.idMedecin, nomComplet: item.nomComplet, sexe: item.sexe,
        dateNaissance: item.dateDeNaissance, specialite: item.specialite,
        idNational: item.idNational, idFivb: item.idFivb,
        avatarDriveId: item.avatarDriveId, avatarDriveUrl: item.avatarDriveUrl, statut: item.statut,
      })}
    />
    <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
      <div className="flex items-center gap-2"><span>Afficher</span><Select value={String(pageSize)} onValueChange={(value) => { setPageSize(Number(value)); setPage(1) }}><SelectTrigger className="w-[76px]"><SelectValue /></SelectTrigger><SelectContent>{[10, 25, 50, 100].map((value) => <SelectItem key={value} value={String(value)}>{value}</SelectItem>)}</SelectContent></Select><span>sur {medecins.length} résultat{medecins.length > 1 ? "s" : ""}</span></div>
      <div className="flex items-center gap-2"><Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((current) => Math.max(1, current - 1))}><ChevronLeft className="size-4" /><span className="sr-only">Page précédente</span></Button><span>Page {page} sur {pages}</span><Button variant="outline" size="sm" disabled={page === pages} onClick={() => setPage((current) => Math.min(pages, current + 1))}><ChevronRight className="size-4" /><span className="sr-only">Page suivante</span></Button></div>
    </div>
  </div>
}
