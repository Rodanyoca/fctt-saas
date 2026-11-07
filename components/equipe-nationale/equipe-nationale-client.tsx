"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { formatSheetDate } from "@/lib/date-utils"
import type { EquipeNationale, EquipeNationaleCompetition, EquipeNationaleResultat, EquipeNationaleSelection, EquipeNationaleStaff } from "@/lib/types"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Eye, Medal, Search, Target, Trophy, Users } from "lucide-react"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { StatCard } from "@/components/dashboard/stat-card"

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
}

function isActive(value: string) {
  const v = normalize(value)
  return v.includes("actif") || v.includes("active") || v.includes("retenu") || v.includes("selection")
}

function EmptyRow({ colSpan, label }: { colSpan: number; label: string }) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="h-24 text-center text-sm text-muted-foreground">
        {label}
      </TableCell>
    </TableRow>
  )
}

export function EquipeNationaleClient({
  equipes,
  selections,
  staff,
  competitions,
}: {
  equipes: EquipeNationale[]
  selections: EquipeNationaleSelection[]
  staff: EquipeNationaleStaff[]
  competitions: EquipeNationaleCompetition[]
  resultats: EquipeNationaleResultat[]
}) {
  const [selectedEquipe, setSelectedEquipe] = useState<EquipeNationale | null>(null)
  const [search, setSearch] = useState("")
  const [filters, setFilters] = useState({ discipline: "all", categorie: "all", genre: "all", saison: "all", statutEquipe: "all" })

  const equipesActives = equipes.filter((equipe) => isActive(equipe.statutEquipe)).length
  const selectionsActives = selections.filter((selection) => isActive(selection.statutSelection)).length
  const filterValues = (field: keyof EquipeNationale) =>
    Array.from(new Set(equipes.map((item) => String(item[field] || "")).filter(Boolean))).sort()
  const filteredEquipes = equipes.filter((equipe) => {
    const text = `${equipe.nomEquipeNationale} ${equipe.discipline} ${equipe.categorie} ${equipe.genre} ${equipe.saison}`.toLowerCase()
    if (search && !text.includes(search.trim().toLowerCase())) return false
    return Object.entries(filters).every(([key, selected]) => selected === "all" || String(equipe[key as keyof EquipeNationale]) === selected)
  })

  const selectedSelections = useMemo(() => {
    if (!selectedEquipe) return []
    return selections.filter((selection) => selection.idEquipeNationale === selectedEquipe.idEquipeNationale)
  }, [selectedEquipe, selections])
  const selectedStaff = selectedEquipe ? staff.filter((item) => item.idEquipeNationale === selectedEquipe.idEquipeNationale) : []
  const selectedCompetitions = selectedEquipe ? competitions.filter((item) => item.idEquipeNationale === selectedEquipe.idEquipeNationale) : []

  if (selectedEquipe) {
    return (
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-center gap-4">
            <Button variant="outline" onClick={() => setSelectedEquipe(null)}>
              <ArrowLeft className="size-4" /> Retour aux équipes
            </Button>
            <div className="min-w-0">
              <h1 className="truncate text-2xl font-bold text-foreground">
                {selectedEquipe.nomEquipeNationale || "Équipe nationale"}
              </h1>
              <p className="font-mono text-sm text-muted-foreground">{selectedEquipe.idEquipeNationale || "-"}</p>
            </div>
          </div>
          <StatusBadge status={selectedEquipe.statutEquipe} />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Discipline</p>
              <p className="font-semibold">{selectedEquipe.discipline || "-"}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Catégorie</p>
              <p className="font-semibold">{selectedEquipe.categorie || "-"}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Genre</p>
              <p className="font-semibold">{selectedEquipe.genre || "-"}</p>
            </CardContent>
          </Card>
          <Card className="border-border/50">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Saison</p>
              <p className="font-semibold">{selectedEquipe.saison || "-"}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="selections" className="gap-4">
          <TabsList className="grid h-auto w-full grid-cols-2 sm:grid-cols-4">
            <TabsTrigger value="selections">Athlètes</TabsTrigger>
            <TabsTrigger value="staff">Staff</TabsTrigger>
            <TabsTrigger value="competitions">Compétitions</TabsTrigger>
            <TabsTrigger value="resultats">Résultats</TabsTrigger>
          </TabsList>
          <TabsContent value="selections">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Membres sélectionnés
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table className="min-w-[820px]">
                <TableHeader>
                  <TableRow>
                    <TableHead>Athlète</TableHead>
                    
                    <TableHead>Club</TableHead>
                    <TableHead>Maillot</TableHead>
                    <TableHead>Capitaine</TableHead>
                    <TableHead>Période</TableHead>
                    <TableHead>Statut</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedSelections.length === 0 ? (
                    <EmptyRow colSpan={7} label="Aucun membre sélectionné pour cette équipe." />
                  ) : (
                    selectedSelections.map((selection, index) => (
                      <TableRow key={`${selection.idSelection || "selection"}-${index}`}>
                        <TableCell className="font-medium">{selection.nomAthlete || "-"}</TableCell>
                        
                        <TableCell>{selection.nomClub || "-"}</TableCell>
                        <TableCell>{selection.numeroMaillot || "-"}</TableCell>
                        <TableCell>{selection.capitaine || "-"}</TableCell>
                        <TableCell className="whitespace-nowrap text-muted-foreground">
                          {formatSheetDate(selection.dateDebutSelection)} - {formatSheetDate(selection.dateFinSelection)}
                        </TableCell>
                        <TableCell>
                          <StatusBadge status={selection.statutSelection} />
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
          </TabsContent>
          <TabsContent value="staff">
            <Card><CardHeader><CardTitle>Staff</CardTitle></CardHeader><CardContent>
              <div className="overflow-x-auto"><Table><TableHeader><TableRow>
                <TableHead>Nom</TableHead><TableHead>Type</TableHead><TableHead>Fonction</TableHead><TableHead>Période</TableHead><TableHead>Statut</TableHead>
              </TableRow></TableHeader><TableBody>
                {selectedStaff.length === 0 ? <EmptyRow colSpan={5} label="Aucun membre du staff." /> : selectedStaff.map((item) => (
                  <TableRow key={item.idStaffSelection}><TableCell className="font-medium">{item.nomActeur || "-"}</TableCell><TableCell>{item.typeActeur || "-"}</TableCell><TableCell>{item.fonction || "-"}</TableCell><TableCell>{formatSheetDate(item.dateDebut)} - {formatSheetDate(item.dateFin)}</TableCell><TableCell><StatusBadge status={item.statutStaff} /></TableCell></TableRow>
                ))}
              </TableBody></Table></div>
            </CardContent></Card>
          </TabsContent>
          <TabsContent value="competitions">
            <Card><CardHeader><CardTitle>Compétitions</CardTitle></CardHeader><CardContent>
              <div className="overflow-x-auto"><Table><TableHeader><TableRow>
                <TableHead>Compétition</TableHead><TableHead>Niveau</TableHead><TableHead>Saison</TableHead><TableHead>Période</TableHead><TableHead>Lieu</TableHead><TableHead>Statut</TableHead>
              </TableRow></TableHeader><TableBody>
                {selectedCompetitions.length === 0 ? <EmptyRow colSpan={6} label="Aucune compétition." /> : selectedCompetitions.map((item) => (
                  <TableRow key={item.idParticipationEquipeNationale}><TableCell className="font-medium">{item.nomCompetition || "-"}</TableCell><TableCell>{item.niveauCompetition || "-"}</TableCell><TableCell>{item.saison || "-"}</TableCell><TableCell>{formatSheetDate(item.dateDebut)} - {formatSheetDate(item.dateFin)}</TableCell><TableCell>{item.lieu || "-"}</TableCell><TableCell><StatusBadge status={item.statutParticipation} /></TableCell></TableRow>
                ))}
              </TableBody></Table></div>
            </CardContent></Card>
          </TabsContent>
          <TabsContent value="resultats"><Card><CardHeader><CardTitle>Résultats</CardTitle></CardHeader><CardContent><p role="status" className="rounded-md border p-8 text-center text-sm text-muted-foreground">Résultats athlétisme à adapter : temps, distances, hauteurs et relais. Aucune performance officielle disponible.</p></CardContent></Card></TabsContent>
        </Tabs>
      </div>
    )
  }

  const cards = [
    { label: "Équipes", value: equipes.length, icon: Target },
    { label: "Équipes actives", value: equipesActives, icon: Trophy },
    { label: "Membres", value: selections.length, icon: Users },
    { label: "Membres actifs", value: selectionsActives, icon: Medal },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => <StatCard key={card.label} title={card.label} value={card.value} icon={card.icon} />)}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Équipes nationales</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher une équipe..." className="pl-9" />
            </div>
            {([
              ["discipline", "Discipline"], ["categorie", "Catégorie"], ["genre", "Genre"],
              ["saison", "Saison"], ["statutEquipe", "Statut"],
            ] as const).map(([field, label]) => (
              <Select key={field} value={filters[field]} onValueChange={(value) => setFilters((current) => ({ ...current, [field]: value }))}>
                <SelectTrigger><SelectValue placeholder={label} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  {filterValues(field).map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}
                </SelectContent>
              </Select>
            ))}
          </div>
          <div className="grid gap-3 md:hidden">
            {filteredEquipes.map((equipe, index) => (
              <article key={`${equipe.idEquipeNationale || "equipe"}-mobile-${index}`} className="rounded-xl border border-border/80 bg-card/95 p-4">
                <div className="flex items-start justify-between gap-3"><div className="min-w-0"><p className="font-medium">{equipe.nomEquipeNationale || "-"}</p><p className="mt-1 text-xs text-muted-foreground">{equipe.discipline || "-"} · {equipe.categorie || "-"} · {equipe.genre || "-"}</p></div><StatusBadge status={equipe.statutEquipe} /></div>
                <div className="mt-3 flex items-center justify-between"><span className="text-sm text-muted-foreground">Saison {equipe.saison || "-"}</span><Button variant="ghost" size="icon" onClick={() => setSelectedEquipe(equipe)} aria-label={`Voir ${equipe.nomEquipeNationale}`}><Eye className="size-4" /></Button></div>
              </article>
            ))}
            {!filteredEquipes.length && <p className="rounded-xl border border-dashed p-8 text-center text-sm text-muted-foreground">Aucune équipe nationale disponible.</p>}
          </div>
          <div className="hidden overflow-x-auto rounded-xl border border-border/80 md:block">
            <Table className="min-w-[960px]">
              <TableHeader>
                <TableRow className="bg-muted/70 hover:bg-muted/70">
                  <TableHead>ID</TableHead>
                  <TableHead>Équipe</TableHead>
                  <TableHead>Discipline</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Genre</TableHead>
                  <TableHead>Saison</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipes.length === 0 ? (
                  <EmptyRow colSpan={8} label="Aucune equipe nationale disponible." />
                ) : (
                  filteredEquipes.map((equipe, index) => (
                    <TableRow key={`${equipe.idEquipeNationale || "equipe"}-${index}`}>
                      <TableCell className="font-mono text-muted-foreground">
                        {equipe.idEquipeNationale || "-"}
                      </TableCell>
                      <TableCell className="font-medium">{equipe.nomEquipeNationale || "-"}</TableCell>
                      <TableCell>{equipe.discipline || "-"}</TableCell>
                      <TableCell>{equipe.categorie || "-"}</TableCell>
                      <TableCell>{equipe.genre || "-"}</TableCell>
                      <TableCell>{equipe.saison || "-"}</TableCell>
                      <TableCell>
                        <StatusBadge status={equipe.statutEquipe} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedEquipe(equipe)} aria-label={`Voir ${equipe.nomEquipeNationale}`}>
                          <Eye className="h-4 w-4" />
                          <span className="sr-only">Voir les détails</span>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
