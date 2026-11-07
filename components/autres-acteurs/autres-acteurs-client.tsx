"use client"

import { useEffect, useMemo, useState } from "react"
import { Search, UserRoundCog } from "lucide-react"
import { AutreActeurDetail } from "@/components/autres-acteurs/autre-acteur-detail"
import { AutreActeurFormDialog } from "@/components/autres-acteurs/autre-acteur-form-dialog"
import { AutresActeursTable } from "@/components/autres-acteurs/autres-acteurs-table"
import { StatCard } from "@/components/dashboard/stat-card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { compareLabels } from "@/lib/sort-utils"
import type { ActorSexOption } from "@/lib/actor-references"
import type { AutreActeur, TypeAutreActeur } from "@/lib/types"

export function AutresActeursClient({ acteurs, types, sexes }: { acteurs: AutreActeur[]; types: TypeAutreActeur[]; sexes: ActorSexOption[] }) {
  const [rows, setRows] = useState(acteurs)
  const [selected, setSelected] = useState<AutreActeur | null>(null)
  const [search, setSearch] = useState("")
  const [type, setType] = useState("all")
  const [sexe, setSexe] = useState("all")
  const [statut, setStatut] = useState("all")
  useEffect(() => setRows(acteurs), [acteurs])
  useEffect(() => { const back = (event: Event) => { if ((event as CustomEvent<string>).detail === "/autres-acteurs") setSelected(null) }; window.addEventListener("feaco:navigate", back); return () => window.removeEventListener("feaco:navigate", back) }, [])
  const save = (saved: AutreActeur) => { setRows((current) => current.some((item) => item.idAutreActeur === saved.idAutreActeur) ? current.map((item) => item.idAutreActeur === saved.idAutreActeur ? saved : item) : [saved, ...current]); setSelected((current) => current?.idAutreActeur === saved.idAutreActeur ? saved : current) }
  const filtered = useMemo(() => rows.filter((item) => {
    if (type !== "all" && item.idTypeAutreActeur !== type) return false
    if (sexe !== "all" && item.idSexe !== sexe) return false
    if (statut !== "all" && item.statut.toUpperCase() !== statut) return false
    const term = search.trim().toLowerCase()
    return !term || `${item.idAutreActeur} ${item.nomComplet} ${item.telephone} ${item.typeAutreActeur}`.toLowerCase().includes(term)
  }).sort((a, b) => compareLabels(a.nomComplet, b.nomComplet)), [rows, search, sexe, statut, type])
  if (selected) return <AutreActeurDetail acteur={selected} sexes={sexes} types={types} onBack={() => setSelected(null)} onUpdated={save} />
  const activeCount = rows.filter((item) => item.statut.toUpperCase() === "ACTIF").length
  const representedTypes = new Set(rows.map((item) => item.idTypeAutreActeur).filter(Boolean)).size
  return <div className="space-y-6"><div className="flex justify-end"><AutreActeurFormDialog sexes={sexes} types={types} onSaved={save} /></div>
    <div className="grid gap-4 sm:grid-cols-3"><StatCard title="Autres acteurs" value={rows.length} icon={UserRoundCog} /><StatCard title="Actifs" value={activeCount} icon={UserRoundCog} /><StatCard title="Types représentés" value={representedTypes} icon={UserRoundCog} /></div>
    <div className="grid gap-3 md:grid-cols-[minmax(240px,1fr)_200px_180px_140px]"><div className="relative"><Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" /><Input className="pl-9" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Rechercher un autre acteur..." /></div>
      <Select value={type} onValueChange={setType}><SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger><SelectContent><SelectItem value="all">Tous les types</SelectItem>{types.map((item) => <SelectItem key={item.id} value={item.id}>{item.nom}</SelectItem>)}</SelectContent></Select>
      <Select value={sexe} onValueChange={setSexe}><SelectTrigger><SelectValue placeholder="Sexe" /></SelectTrigger><SelectContent><SelectItem value="all">Tous les sexes</SelectItem>{sexes.map((item) => <SelectItem key={item.id} value={item.id}>{item.nom}</SelectItem>)}</SelectContent></Select>
      <Select value={statut} onValueChange={setStatut}><SelectTrigger><SelectValue placeholder="Statut" /></SelectTrigger><SelectContent><SelectItem value="all">Tous</SelectItem><SelectItem value="ACTIF">Actif</SelectItem><SelectItem value="INACTIF">Inactif</SelectItem></SelectContent></Select>
    </div><AutresActeursTable acteurs={filtered} onView={setSelected} /></div>
}
