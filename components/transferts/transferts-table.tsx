"use client"

import { ArrowRight, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatSheetDate } from "@/lib/date-utils"
import type { Transfert } from "@/lib/types"

export function TransfertsTable({ transferts, totalCount, onViewTransfert }: {
  transferts: Transfert[]
  totalCount: number
  onViewTransfert: (transfert: Transfert) => void
}) {
  return (
    <section className="space-y-3" aria-label="Liste des mouvements">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">Liste des mouvements</h2>
        <span className="text-sm text-muted-foreground">{totalCount} résultat{totalCount > 1 ? "s" : ""}</span>
      </div>

      <div className="grid gap-3 md:hidden">
        {transferts.map((transfert, index) => (
          <article key={`${transfert.id || "transfert"}-${index}`} className="rounded-xl border border-border/80 bg-card/95 p-4 shadow-[0_12px_30px_rgba(1,10,20,0.12)]">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0"><p className="font-medium">{transfert.athleteNom || "-"}</p><p className="mt-1 font-mono text-xs text-muted-foreground">{transfert.id || "-"}</p></div>
              <StatusBadge status={transfert.statut} />
            </div>
            <div className="mt-4 grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2">
              <div><p className="text-xs text-muted-foreground">Origine</p><p className="break-words text-sm font-medium">{transfert.clubOrigineNom || "-"}</p></div>
              <ArrowRight className="size-4 text-muted-foreground" />
              <div><p className="text-xs text-muted-foreground">Bénéficiaire</p><p className="break-words text-sm font-medium">{transfert.clubBeneficiaireNom || "-"}</p></div>
            </div>
            <div className="mt-4 flex items-end justify-between gap-3 text-xs text-muted-foreground">
              <p>{transfert.typeTransfert || "-"} · {transfert.saison || "-"}</p>
              <Button variant="ghost" size="icon" onClick={() => onViewTransfert(transfert)} aria-label={`Voir le mouvement de ${transfert.athleteNom}`} title="Voir le détail"><Eye className="size-4" /></Button>
            </div>
          </article>
        ))}
        {!transferts.length && <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Aucun mouvement enregistré.</p>}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-border/80 bg-card/90 shadow-[0_12px_30px_rgba(1,10,20,0.12)] md:block">
        <Table className="min-w-[980px]">
          <TableHeader><TableRow className="bg-muted/70 hover:bg-muted/70"><TableHead>Athlète</TableHead><TableHead>Origine</TableHead><TableHead className="w-14" /><TableHead>Bénéficiaire</TableHead><TableHead>Type / saison</TableHead><TableHead>Début</TableHead><TableHead>Fin</TableHead><TableHead>Statut</TableHead><TableHead className="text-center">Actions</TableHead></TableRow></TableHeader>
          <TableBody>
            {transferts.map((transfert, index) => <TableRow key={`${transfert.id || "transfert"}-${transfert.athleteId || "sans-athlete"}-${index}`} className="hover:bg-muted/30">
              <TableCell><p className="font-medium">{transfert.athleteNom || "-"}</p><p className="font-mono text-xs text-muted-foreground">{transfert.athleteId || "-"}</p></TableCell>
              <TableCell><p className="font-medium">{transfert.clubOrigineNom || "-"}</p><p className="font-mono text-xs text-muted-foreground">{transfert.clubOrigineId || "-"}</p></TableCell>
              <TableCell><ArrowRight className="mx-auto size-4 text-muted-foreground" /></TableCell>
              <TableCell><p className="font-medium">{transfert.clubBeneficiaireNom || "-"}</p><p className="font-mono text-xs text-muted-foreground">{transfert.clubBeneficiaireId || "-"}</p></TableCell>
              <TableCell><p className="font-medium">{transfert.typeTransfert || "-"}</p><p className="text-xs text-muted-foreground">{transfert.saison || "-"}</p></TableCell>
              <TableCell className="whitespace-nowrap">{formatSheetDate(transfert.dateDebut)}</TableCell><TableCell className="whitespace-nowrap">{formatSheetDate(transfert.dateFin)}</TableCell>
              <TableCell><StatusBadge status={transfert.statut} /></TableCell>
              <TableCell className="text-center"><Button variant="ghost" size="icon" onClick={() => onViewTransfert(transfert)} aria-label={`Voir le mouvement de ${transfert.athleteNom}`} title="Voir le détail"><Eye className="size-4" /></Button></TableCell>
            </TableRow>)}
            {!transferts.length && <TableRow><TableCell colSpan={9} className="h-24 text-center text-muted-foreground">Aucun mouvement enregistré.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
