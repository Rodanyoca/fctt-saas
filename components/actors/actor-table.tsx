"use client"

import { Eye } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { getActorAvatarUrl } from "@/lib/actor-avatar"
import { calculateAge } from "@/lib/date-utils"
import { normalize } from "@/lib/sheet-values"

export interface ActorListRow {
  id: string
  nomComplet: string
  sexe: string
  dateNaissance: string
  idNational: string
  idFivb: string
  avatarDriveId: string
  avatarDriveUrl: string
  statut: string
  niveau?: string
  grade?: string
  specialite?: string
  nationalite?: string
}

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  return parts.length ? `${parts[0]?.[0] ?? ""}${parts.at(-1)?.[0] ?? ""}`.toUpperCase() : "?"
}

function sexeAge(row: ActorListRow) {
  const value = normalize(row.sexe)
  const sexe = value === "M" || value === "MASCULIN" ? "M" : value === "F" || value === "FEMININ" ? "F" : "—"
  const age = calculateAge(row.dateNaissance)
  return { sexe, age: age === null ? "—" : `${age} ans` }
}

function SexAge({ row, stacked = false, ageFirst = false }: { row: ActorListRow; stacked?: boolean; ageFirst?: boolean }) {
  const values = sexeAge(row)
  return stacked ? (
    <div className="flex flex-col items-center leading-tight">
      <span className="text-sm font-semibold">{values.sexe}</span>
      <span className="text-xs tabular-nums text-muted-foreground">{values.age}</span>
    </div>
  ) : <>{ageFirst ? `${values.age} / ${values.sexe}` : `${values.sexe} · ${values.age}`}</>
}

export function ActorTable<T>({ title, items, toRow, onView, emptyMessage, showId = true, firstColumn, stackSexAge = false, showNiveau = false, showGrade = false, showSpecialite = false, showNationalite = false, showCount = true, identityLayout = "separate" }: {
  title: string
  items: T[]
  toRow: (item: T) => ActorListRow
  onView?: (item: T) => void
  emptyMessage: string
  showId?: boolean
  firstColumn?: { label: string; value: (item: T) => string }
  stackSexAge?: boolean
  showNiveau?: boolean
  showGrade?: boolean
  showSpecialite?: boolean
  showNationalite?: boolean
  showCount?: boolean
  identityLayout?: "separate" | "combined" | "avatar-in-name"
}) {
  const columns = (showId ? 6 : 5) + (onView ? 1 : 0) + (firstColumn ? 1 : 0) + (showNiveau ? 1 : 0) + (showGrade ? 1 : 0) + (showSpecialite ? 1 : 0) + (showNationalite ? 1 : 0) - (identityLayout === "combined" ? 2 : identityLayout === "avatar-in-name" ? 1 : 0)

  return (
    <section className="space-y-3" aria-label={title}>
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-medium text-muted-foreground">{title}</h2>
        {showCount && <span className="text-sm text-muted-foreground">{items.length} résultat{items.length > 1 ? "s" : ""}</span>}
      </div>

      <div className="grid gap-3 md:hidden">
        {items.map((item, index) => {
          const row = toRow(item)
          const imageUrl = getActorAvatarUrl(row.avatarDriveUrl, row.avatarDriveId)
          return <article key={`${row.id || "acteur"}-${index}`} className="rounded-xl border border-border/80 bg-card/95 p-4 shadow-[0_12px_30px_rgba(1,10,20,0.12)]">
            <div className="flex items-start gap-3">
              <Avatar className="size-11 shrink-0"><AvatarImage src={imageUrl || undefined} alt={row.nomComplet || "Avatar"} /><AvatarFallback>{initials(row.nomComplet)}</AvatarFallback></Avatar>
              <div className="min-w-0 flex-1"><p className="break-words font-medium">{row.nomComplet || "Non renseigné"}</p><div className="mt-1 w-fit text-xs text-muted-foreground"><SexAge row={row} ageFirst={identityLayout === "combined"} /></div></div>
              <StatusBadge status={row.statut} />
            </div>
            <div className="mt-4 grid gap-2 text-xs text-muted-foreground sm:grid-cols-2">
              {firstColumn && <p><span className="font-medium text-foreground">{firstColumn.label} :</span> {firstColumn.value(item) || "Non renseigné"}</p>}
              {showId && <p className="break-all font-mono"><span className="font-sans font-medium text-foreground">ID :</span> {row.id || "Non renseigné"}</p>}
              {showNiveau && <p><span className="font-medium text-foreground">Niveau :</span> {row.niveau || "Non renseigné"}</p>}
              {showGrade && <p><span className="font-medium text-foreground">Grade :</span> {row.grade || "Non renseigné"}</p>}
              {showSpecialite && <p><span className="font-medium text-foreground">Spécialité :</span> {row.specialite || "Non renseignée"}</p>}
              {showNationalite && <p><span className="font-medium text-foreground">Nationalité :</span> {row.nationalite || "Non renseignée"}</p>}
              <p className="break-all font-mono"><span className="font-sans font-medium text-foreground">ID national :</span> {row.idNational || "Non renseigné"}</p>
              
            </div>
            {onView && <div className="mt-3 flex justify-end"><Button variant="ghost" size="icon" onClick={() => onView(item)} aria-label={`Voir ${row.nomComplet}`} title="Voir le détail"><Eye className="size-4" /></Button></div>}
          </article>
        })}
        {!items.length && <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">{emptyMessage}</p>}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-border/80 bg-card/90 shadow-[0_12px_30px_rgba(1,10,20,0.12)] md:block">
        <Table className={showNiveau || showGrade || showSpecialite || showNationalite ? "min-w-[1100px]" : showId ? "min-w-[900px]" : "min-w-[820px]"}>
          <TableHeader><TableRow className="bg-muted/70 hover:bg-muted/70">{firstColumn && <TableHead>{firstColumn.label}</TableHead>}{showId && <TableHead>ID</TableHead>}{identityLayout === "separate" && <TableHead>Avatar</TableHead>}<TableHead>Nom complet</TableHead>{showNiveau && <TableHead>Niveau</TableHead>}{showGrade && <TableHead>Grade</TableHead>}{identityLayout !== "combined" && <TableHead className={stackSexAge ? "text-center" : undefined}>Sexe / âge</TableHead>}{showSpecialite && <TableHead>Spécialité</TableHead>}{showNationalite && <TableHead>Nationalité</TableHead>}<TableHead>ID national</TableHead><TableHead>Statut</TableHead>{onView && <TableHead className="text-center">Actions</TableHead>}</TableRow></TableHeader>
          <TableBody>
            {items.map((item, index) => { const row = toRow(item); const imageUrl = getActorAvatarUrl(row.avatarDriveUrl, row.avatarDriveId); return <TableRow key={`${row.id || "acteur"}-${index}`} className="hover:bg-muted/30">{firstColumn && <TableCell className="font-mono">{firstColumn.value(item) || "-"}</TableCell>}{showId && <TableCell className="font-mono">{row.id || "-"}</TableCell>}{identityLayout === "separate" && <TableCell><Avatar className="size-10"><AvatarImage src={imageUrl || undefined} alt={row.nomComplet || "Avatar"} /><AvatarFallback>{initials(row.nomComplet)}</AvatarFallback></Avatar></TableCell>}<TableCell className="font-medium">{identityLayout === "combined" || identityLayout === "avatar-in-name" ? <div className="flex items-center gap-3"><Avatar className="size-10 shrink-0"><AvatarImage src={imageUrl || undefined} alt={row.nomComplet || "Avatar"} /><AvatarFallback>{initials(row.nomComplet)}</AvatarFallback></Avatar><div><p>{row.nomComplet || "-"}</p>{identityLayout === "combined" && <p className="mt-0.5 text-xs font-normal text-muted-foreground"><SexAge row={row} ageFirst /></p>}</div></div> : row.nomComplet || "-"}</TableCell>{showNiveau && <TableCell>{row.niveau || "-"}</TableCell>}{showGrade && <TableCell>{row.grade || "-"}</TableCell>}{identityLayout !== "combined" && <TableCell className={stackSexAge ? "text-center" : undefined}><SexAge row={row} stacked={stackSexAge} /></TableCell>}{showSpecialite && <TableCell>{row.specialite || "-"}</TableCell>}{showNationalite && <TableCell>{row.nationalite || "-"}</TableCell>}<TableCell className="font-mono">{row.idNational || "-"}</TableCell><TableCell><StatusBadge status={row.statut} /></TableCell>{onView && <TableCell className="text-center"><Button variant="ghost" size="icon" onClick={() => onView(item)} aria-label={`Voir ${row.nomComplet}`} title="Voir le détail"><Eye className="size-4" /></Button></TableCell>}</TableRow> })}
            {!items.length && <TableRow><TableCell colSpan={columns} className="h-24 text-center text-muted-foreground">{emptyMessage}</TableCell></TableRow>}
          </TableBody>
        </Table>
      </div>
    </section>
  )
}
