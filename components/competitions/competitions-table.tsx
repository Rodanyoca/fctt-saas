"use client"

import { CalendarDays, Eye } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { formatSheetDate } from "@/lib/date-utils"
import type { Competition } from "@/lib/types"

export function CompetitionsTable({ competitions, totalCount, onViewCompetition }: { competitions: Competition[]; totalCount: number; onViewCompetition: (competition: Competition) => void }) {
  return (
    <section className="space-y-3" aria-label="Liste des compétitions">
      <div className="flex items-center justify-between gap-3"><h2 className="text-sm font-medium text-muted-foreground">Liste des compétitions</h2><span className="text-sm text-muted-foreground">{totalCount} résultat{totalCount > 1 ? "s" : ""}</span></div>
      <div className="grid gap-3 md:hidden">
        {competitions.map((competition, index) => <article key={`${competition.idCompetition || "competition"}-${index}`} className="rounded-xl border border-border/80 bg-card/95 p-4 shadow-[0_12px_30px_rgba(1,10,20,0.12)]">
          <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="break-words font-medium">{competition.nomCompetition || "-"}</p><p className="mt-1 text-xs text-muted-foreground">{competition.saison || "-"} · {competition.nomDiscipline || "-"}</p></div><StatusBadge status={competition.statutCompetition} /></div>
          <div className="mt-4 grid gap-2 text-sm"><p><span className="text-muted-foreground">Niveau :</span> {competition.niveau || "-"}</p><p><span className="text-muted-foreground">Lieu :</span> {competition.lieu || "-"}</p><p className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="size-4" />{formatSheetDate(competition.dateDebut)} — {formatSheetDate(competition.dateFin)}</p></div>
          <div className="mt-3 flex justify-end"><Button variant="ghost" size="icon" onClick={() => onViewCompetition(competition)} aria-label={`Voir ${competition.nomCompetition}`} title="Voir le détail"><Eye className="size-4" /></Button></div>
        </article>)}
        {!competitions.length && <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Aucune compétition enregistrée.</p>}
      </div>
      <div className="hidden overflow-hidden rounded-xl border border-border/80 bg-card/90 shadow-[0_12px_30px_rgba(1,10,20,0.12)] md:block">
        <Table className="min-w-[920px] table-fixed">
          <TableHeader><TableRow className="bg-muted/70 hover:bg-muted/70"><TableHead className="w-[22%]">Compétition</TableHead><TableHead className="w-[10%]">Saison</TableHead><TableHead className="w-[11%]">Discipline</TableHead><TableHead className="w-[20%]">Période</TableHead><TableHead className="w-[16%]">Niveau / lieu</TableHead><TableHead className="w-[13%]">Organisation</TableHead><TableHead className="w-[8%]">Statut</TableHead><TableHead className="w-12" /></TableRow></TableHeader>
          <TableBody>
            {competitions.map((competition, index) => <TableRow key={`${competition.idCompetition || "competition"}-${competition.nomCompetition || "sans-nom"}-${index}`} className="hover:bg-muted/30">
              <TableCell className="whitespace-normal break-words font-medium">{competition.nomCompetition || "-"}</TableCell><TableCell>{competition.saison || "-"}</TableCell><TableCell><Badge variant="outline">{competition.nomDiscipline || "-"}</Badge></TableCell>
              <TableCell><span className="flex items-center gap-2 whitespace-nowrap text-xs"><CalendarDays className="size-4" />{formatSheetDate(competition.dateDebut)} — {formatSheetDate(competition.dateFin)}</span></TableCell>
              <TableCell><p>{competition.niveau || "-"}</p><p className="text-xs text-muted-foreground">{competition.lieu || "-"}</p></TableCell><TableCell>{competition.nomStructureOrganisatrice || "-"}</TableCell><TableCell><StatusBadge status={competition.statutCompetition} /></TableCell>
              <TableCell><Button variant="ghost" size="icon" onClick={() => onViewCompetition(competition)} aria-label={`Voir ${competition.nomCompetition}`} title="Voir le détail"><Eye className="size-4" /></Button></TableCell>
            </TableRow>)}
            {!competitions.length && <TableRow><TableCell colSpan={8} className="h-24 text-center text-muted-foreground">Aucune compétition enregistrée.</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
