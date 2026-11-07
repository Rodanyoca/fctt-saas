"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Check, ChevronsUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { CompactDateInput } from "@/components/ui/compact-date-input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { CoachReferenceOption } from "@/lib/actor-references"
import type { Coach, CoachAffiliation } from "@/lib/types"
import { cn } from "@/lib/utils"

export type CoachStructureOption = { key: string; id: string; nom: string; type: string }
const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "_").toUpperCase()

export function CoachAffiliationFormDialog({ coach, structures, affiliationTypes, coachFunctions, onSaved }: {
  coach: Coach
  structures: CoachStructureOption[]
  affiliationTypes: CoachReferenceOption[]
  coachFunctions: CoachReferenceOption[]
  onSaved: (affiliation: CoachAffiliation, deactivatedAffiliationId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [structureOpen, setStructureOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    saison: "", typeAffiliation: "", structureKey: "", fonction: "",
    dateDebut: "", dateFin: "", statutAffiliation: "actif", observation: "",
  })
  const normalizedType = normalize(form.typeAffiliation)
  const matchingStructures = structures.filter((item) =>
    normalizedType === "CLUB" ? item.type === "Club" :
      normalizedType === "EQUIPE_NATIONALE" ? item.type === "Equipe nationale" : false,
  )
  const selectedStructure = matchingStructures.find((item) => item.key === form.structureKey)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setPending(true)
    setError("")
    try {
      const response = await fetch(`/api/coachs/${encodeURIComponent(coach.idCoach)}/affiliations`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Création impossible.")
      onSaved(result.affiliation, result.deactivatedAffiliationId || "")
      toast.success(result.message)
      setOpen(false)
      setForm({ saison: "", typeAffiliation: "", structureKey: "", fonction: "", dateDebut: "", dateFin: "", statutAffiliation: "actif", observation: "" })
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Création impossible."
      setError(message)
      toast.error(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild><Button variant="outline">Ajouter une affiliation</Button></DialogTrigger>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
        <DialogHeader><DialogTitle>Affilier {coach.nomComplet}</DialogTitle><DialogDescription>L’identifiant est généré automatiquement selon la saison.</DialogDescription></DialogHeader>
        <form onSubmit={submit} className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2"><Label>Saison *</Label><Input required value={form.saison} onChange={(event) => setForm({ ...form, saison: event.target.value })} placeholder="2026-2027" /></div>
            <div className="space-y-2"><Label>Type d’affiliation *</Label><Select required value={form.typeAffiliation} onValueChange={(value) => setForm({ ...form, typeAffiliation: value, structureKey: "" })} disabled={!affiliationTypes.length}><SelectTrigger><SelectValue placeholder={affiliationTypes.length ? "Sélectionner le type" : "Référentiel non configuré"} /></SelectTrigger><SelectContent>{affiliationTypes.map((item) => <SelectItem key={`${item.id}:${item.nom}`} value={item.nom}>{item.nom}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2">
              <Label>Structure *</Label>
              <Popover open={structureOpen} onOpenChange={setStructureOpen}>
                <PopoverTrigger asChild><Button type="button" variant="outline" role="combobox" disabled={!normalizedType || !matchingStructures.length} className="w-full justify-between font-normal"><span className="truncate">{selectedStructure ? `${selectedStructure.id} — ${selectedStructure.nom}` : normalizedType ? "Rechercher par ID ou nom" : "Sélectionnez d’abord le type"}</span><ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" /></Button></PopoverTrigger>
                <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                  <Command><CommandInput placeholder="Rechercher un ID ou un nom..." /><CommandList><CommandEmpty>Aucune structure trouvée.</CommandEmpty><CommandGroup>{matchingStructures.map((item) => <CommandItem key={item.key} value={`${item.id} ${item.nom}`} onSelect={() => { setForm({ ...form, structureKey: item.key }); setStructureOpen(false) }}><Check className={cn("mr-2 h-4 w-4", form.structureKey === item.key ? "opacity-100" : "opacity-0")} /><span className="font-mono text-xs">{item.id}</span><span className="ml-2">{item.nom}</span></CommandItem>)}</CommandGroup></CommandList></Command>
                </PopoverContent>
              </Popover>
            </div>
            <div className="space-y-2"><Label>Fonction *</Label><Select required value={form.fonction} onValueChange={(value) => setForm({ ...form, fonction: value })} disabled={!coachFunctions.length}><SelectTrigger><SelectValue placeholder={coachFunctions.length ? "Sélectionner la fonction" : "Référentiel non configuré"} /></SelectTrigger><SelectContent>{coachFunctions.map((item) => <SelectItem key={`${item.id}:${item.nom}`} value={item.nom}>{item.nom}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Date de début *</Label><CompactDateInput required value={form.dateDebut} onValueChange={(dateDebut) => setForm({ ...form, dateDebut })} /></div>
            <div className="space-y-2"><Label>Date de fin</Label><CompactDateInput optional value={form.dateFin} onValueChange={(dateFin) => setForm({ ...form, dateFin })} /></div>
            <div className="space-y-2"><Label>Statut</Label><Select value={form.statutAffiliation} onValueChange={(value) => setForm({ ...form, statutAffiliation: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="actif">Actif</SelectItem><SelectItem value="inactif">Inactif</SelectItem><SelectItem value="en attente">En attente</SelectItem></SelectContent></Select></div>
            <div className="space-y-2 sm:col-span-2"><Label>Observation</Label><Input value={form.observation} onChange={(event) => setForm({ ...form, observation: event.target.value })} /></div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <DialogFooter><Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>Annuler</Button><Button type="submit" disabled={pending || !matchingStructures.length || !affiliationTypes.length || !coachFunctions.length}>{pending ? "Enregistrement..." : "Créer l’affiliation"}</Button></DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
