"use client"

import { useEffect, useMemo, useState } from "react"
import { ChevronLeft, ChevronRight, Eye } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { getActorAvatarUrl } from "@/lib/actor-avatar"
import { calculateAge } from "@/lib/date-utils"
import { normalize } from "@/lib/sheet-values"
import type { BaseActorLicence, Officiel } from "@/lib/types"

const PAGE_SIZE = 10
const shown = (value: unknown) => String(value ?? "").trim() || "-"
const initials = (name: string) => { const parts = name.trim().split(/\s+/).filter(Boolean); return parts.length ? `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}`.toUpperCase() : "OF" }
const sex = (value: string) => { const v = normalize(value); return v === "M" || v === "MASCULIN" ? "M" : v === "F" || v === "FEMININ" ? "F" : "-" }

export function OfficielsTable({ officiels, onViewOfficiel }: { officiels: Officiel[]; licences: BaseActorLicence[]; onViewOfficiel: (item: Officiel) => void }) {
  const [page, setPage] = useState(1)
  const pageCount = Math.max(1, Math.ceil(officiels.length / PAGE_SIZE))
  useEffect(() => setPage(1), [officiels])
  const rows = useMemo(() => officiels.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [officiels, page])

  const identity = (item: Officiel) => {
    const avatar = getActorAvatarUrl(item.avatarDriveUrl, item.avatarDriveId)
    return <div className="flex min-w-0 items-center gap-3"><Avatar className="size-10 shrink-0"><AvatarImage src={avatar || undefined} alt={item.nomComplet || "Avatar"} /><AvatarFallback className="text-xs">{initials(item.nomComplet)}</AvatarFallback></Avatar><span className="min-w-0 whitespace-normal break-words font-medium leading-snug">{shown(item.nomComplet)}</span></div>
  }
  const sexAge = (item: Officiel) => { const age = calculateAge(item.dateDeNaissance); return <div className="space-y-1"><span className="block">{sex(item.sexe)}</span><span className="block text-xs text-muted-foreground">{age === null ? "-" : `${age} ans`}</span></div> }
  const identifiers = (item: Officiel) => <div className="space-y-1 font-mono text-xs"><span className="block break-all">National : {shown(item.idNational)}</span></div>
  const contact = (item: Officiel) => <div className="space-y-1 text-sm"><span className="block break-all">{shown(item.email)}</span><span className="block text-xs text-muted-foreground">{shown(item.telephone)}</span></div>

  return <section className="space-y-3" aria-label="Liste des officiels">
    <h2 className="text-sm font-medium text-muted-foreground">Liste des officiels</h2>
    <div className="grid gap-3 md:hidden">{rows.map(item => <article key={item.idOfficiel} className="rounded-xl border bg-card p-4 shadow-sm"><div className="flex items-start justify-between gap-3">{identity(item)}<StatusBadge status={item.statut} /></div><div className="mt-4 grid grid-cols-2 gap-4 text-sm"><div><p className="text-xs text-muted-foreground">ID</p><p className="break-all font-mono">{shown(item.idOfficiel)}</p></div><div><p className="text-xs text-muted-foreground">Sexe / Âge</p>{sexAge(item)}</div><div><p className="text-xs text-muted-foreground">Identifiants</p>{identifiers(item)}</div><div><p className="text-xs text-muted-foreground">Contact</p>{contact(item)}</div></div><div className="mt-3 flex justify-end"><Button variant="ghost" size="icon" onClick={() => onViewOfficiel(item)} aria-label={`Voir ${item.nomComplet}`}><Eye className="size-4" /></Button></div></article>)}{!rows.length && <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Aucun officiel enregistré.</p>}</div>
    <div className="hidden overflow-hidden rounded-xl border bg-card md:block"><Table className="min-w-[980px] table-fixed"><TableHeader><TableRow className="bg-muted/70 hover:bg-muted/70"><TableHead className="w-[11%]">ID</TableHead><TableHead className="w-[24%]">Nom complet</TableHead><TableHead className="w-[14%]">Sexe / Âge</TableHead><TableHead className="w-[17%]">Identifiants</TableHead><TableHead className="w-[20%]">Contact</TableHead><TableHead className="w-[10%]">Statut</TableHead><TableHead className="w-[8%] text-center">Actions</TableHead></TableRow></TableHeader><TableBody>{rows.map(item => <TableRow key={item.idOfficiel} className="hover:bg-muted/30"><TableCell className="whitespace-normal break-all font-mono text-sm">{shown(item.idOfficiel)}</TableCell><TableCell>{identity(item)}</TableCell><TableCell>{sexAge(item)}</TableCell><TableCell>{identifiers(item)}</TableCell><TableCell>{contact(item)}</TableCell><TableCell><StatusBadge status={item.statut} /></TableCell><TableCell className="text-center"><Button variant="ghost" size="icon" onClick={() => onViewOfficiel(item)} aria-label={`Voir ${item.nomComplet}`}><Eye className="size-4" /></Button></TableCell></TableRow>)}{!rows.length && <TableRow><TableCell colSpan={7} className="h-24 text-center text-muted-foreground">Aucun officiel enregistré.</TableCell></TableRow>}</TableBody></Table></div>
    {officiels.length > PAGE_SIZE && <div className="flex items-center justify-end gap-2"><span className="text-sm text-muted-foreground">Page {page} sur {pageCount}</span><Button variant="outline" size="icon" disabled={page === 1} onClick={() => setPage(value => value - 1)} aria-label="Page précédente"><ChevronLeft className="size-4" /></Button><Button variant="outline" size="icon" disabled={page === pageCount} onClick={() => setPage(value => value + 1)} aria-label="Page suivante"><ChevronRight className="size-4" /></Button></div>}
  </section>
}
