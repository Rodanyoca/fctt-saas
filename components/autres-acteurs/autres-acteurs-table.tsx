"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { calculateAge } from "@/lib/date-utils"
import type { AutreActeur } from "@/lib/types"

const PAGE_SIZE = 10
const shown = (value: unknown) => String(value ?? "").trim() || "-"
export function AutresActeursTable({ acteurs, onView }: { acteurs: AutreActeur[]; onView: (item: AutreActeur) => void }) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(acteurs.length / PAGE_SIZE))
  useEffect(() => setPage(1), [acteurs])
  const rows = useMemo(() => acteurs.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [acteurs, page])
  const sexAge = (item: AutreActeur) => { const age = calculateAge(item.dateNaissance); return <div className="space-y-1"><span className="block">{shown(item.sexe)}</span><span className="block text-xs text-muted-foreground">{age === null ? "-" : `${age} ans`}</span></div> }
  const action = (item: AutreActeur) => <Button variant="ghost" size="icon" onClick={() => onView(item)} aria-label={`Voir ${item.nomComplet}`}><Eye className="size-4" /></Button>
  return <section className="space-y-3" aria-label="Liste des autres acteurs"><h2 className="text-sm font-medium text-muted-foreground">Liste des autres acteurs</h2>
    <div className="grid gap-3 md:hidden">{rows.map((item) => <article key={item.idAutreActeur} className="rounded-xl border bg-card p-4 shadow-sm"><div className="flex justify-between gap-3"><div><p className="font-medium">{shown(item.nomComplet)}</p><p className="font-mono text-xs text-muted-foreground">{item.idAutreActeur}</p></div><StatusBadge status={item.statut} /></div><div className="mt-4 grid grid-cols-2 gap-4 text-sm"><div><p className="text-xs text-muted-foreground">Sexe / Âge</p>{sexAge(item)}</div><div><p className="text-xs text-muted-foreground">Type</p><p>{shown(item.typeAutreActeur)}</p></div><div><p className="text-xs text-muted-foreground">Téléphone</p><p>{shown(item.telephone)}</p></div></div><div className="flex justify-end">{action(item)}</div></article>)}{!rows.length && <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Aucun autre acteur enregistré.</p>}</div>
    <div className="hidden overflow-hidden rounded-xl border bg-card md:block"><Table className="min-w-[850px] table-fixed"><TableHeader><TableRow className="bg-muted/70 hover:bg-muted/70"><TableHead className="w-[15%]">ID</TableHead><TableHead className="w-[24%]">Nom complet</TableHead><TableHead className="w-[16%]">Sexe / Âge</TableHead><TableHead className="w-[20%]">Type</TableHead><TableHead className="w-[14%]">Téléphone</TableHead><TableHead className="w-[11%]">Statut</TableHead><TableHead className="w-[8%] text-center">Actions</TableHead></TableRow></TableHeader><TableBody>{rows.map((item) => <TableRow key={item.idAutreActeur}><TableCell className="break-all font-mono text-sm">{item.idAutreActeur}</TableCell><TableCell className="font-medium">{shown(item.nomComplet)}</TableCell><TableCell>{sexAge(item)}</TableCell><TableCell>{shown(item.typeAutreActeur)}</TableCell><TableCell>{shown(item.telephone)}</TableCell><TableCell><StatusBadge status={item.statut} /></TableCell><TableCell className="text-center">{action(item)}</TableCell></TableRow>)}{!rows.length && <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Aucun autre acteur enregistré.</TableCell></TableRow>}</TableBody></Table></div>
    {acteurs.length > PAGE_SIZE && <div className="flex items-center justify-end gap-2"><span className="text-sm text-muted-foreground">Page {page} sur {pageCount}</span><Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage((value) => value - 1)} aria-label="Page précédente"><ChevronLeft className="size-4" /></Button><Button variant="outline" size="icon" disabled={page === pageCount} onClick={() => setPage((value) => value + 1)} aria-label="Page suivante"><ChevronRight className="size-4" /></Button></div>}
  </section>
}
