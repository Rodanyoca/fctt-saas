"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { CompactDateInput } from "@/components/ui/compact-date-input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { TransferTypeOption } from "@/lib/actor-references"
import type { Athlete, Club, Transfert } from "@/lib/types"

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/gi, "_").toUpperCase()

export function TransfertFormDialog({ athletes, clubs, types, affiliations, onSaved }: {
  athletes: Athlete[]
  clubs: Club[]
  types: TransferTypeOption[]
  affiliations: Transfert[]
  onSaved: (transfert: Transfert, deactivatedAffiliationId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [form, setForm] = useState({
    saison: "", typeAffiliation: "", idAthlete: "", idClubOrigine: "",
    idClubBeneficiaire: "", dateDebut: "", dateFin: "",
    statutAffiliation: "actif", observation: "",
  })
  const normalizedType = normalize(form.typeAffiliation)
  const firstAffiliation = normalizedType.includes("PREMIERE") && normalizedType.includes("AFFILIATION")
  const temporary = normalizedType.includes("TEMPORAIRE")
  const uniqueAthletes = useMemo(
    () => Array.from(new Map(athletes.filter((item) => item.idAthlete).map((item) => [item.idAthlete, item])).values()),
    [athletes],
  )
  const uniqueClubs = useMemo(
    () => Array.from(new Map(clubs.filter((item) => item.idClub).map((item) => [item.idClub, item])).values()),
    [clubs],
  )
  const availableBeneficiaries = useMemo(
    () => uniqueClubs.filter((club) => club.idClub !== form.idClubOrigine),
    [uniqueClubs, form.idClubOrigine],
  )

  const latestClubFor = (athleteId: string) => {
    const time = (value: string) => {
      const french = value.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
      if (french) return new Date(Number(french[3]), Number(french[2]) - 1, Number(french[1])).getTime()
      const parsed = Date.parse(value)
      return Number.isNaN(parsed) ? 0 : parsed
    }
    return affiliations
      .filter((item) => item.athleteId === athleteId)
      .sort((left, right) => time(right.dateDebut) - time(left.dateDebut))[0]
      ?.clubBeneficiaireId ?? ""
  }

  const changeType = (value: string) => {
    const kind = normalize(value)
    setForm((current) => ({
      ...current,
      typeAffiliation: value,
      idClubOrigine: kind.includes("PREMIERE") && kind.includes("AFFILIATION") ? "" : latestClubFor(current.idAthlete),
      dateFin: kind.includes("TEMPORAIRE") ? current.dateFin : "",
    }))
  }

  const changeAthlete = (value: string) => {
    setForm((current) => ({
      ...current,
      idAthlete: value,
      idClubOrigine: firstAffiliation ? "" : latestClubFor(value),
      idClubBeneficiaire: "",
    }))
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setPending(true)
    setError("")
    try {
      const response = await fetch("/api/transferts", {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Création impossible.")
      onSaved(result.transfert, result.deactivatedAffiliationId || "")
      toast.success(result.message)
      setOpen(false)
      setForm({ saison: "", typeAffiliation: "", idAthlete: "", idClubOrigine: "", idClubBeneficiaire: "", dateDebut: "", dateFin: "", statutAffiliation: "actif", observation: "" })
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Création impossible."
      setError(message)
      toast.error(message)
    } finally {
      setPending(false)
    }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild><Button>Créer une affiliation</Button></SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>Créer une affiliation d’athlète</SheetTitle>
          <SheetDescription>Les clubs et les dates demandés s’adaptent automatiquement au type d’affiliation.</SheetDescription>
        </SheetHeader>
        <form onSubmit={submit} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2"><Label>Type d’affiliation *</Label><Select required value={form.typeAffiliation} onValueChange={changeType} disabled={!types.length}><SelectTrigger><SelectValue placeholder={types.length ? "Sélectionner un type" : "Référentiel non configuré"} /></SelectTrigger><SelectContent>{types.map((type) => <SelectItem key={type.id} value={type.nom}>{type.nom}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Saison *</Label><Input required value={form.saison} onChange={(e) => setForm({ ...form, saison: e.target.value })} placeholder="2026-2027" /></div>
            <div className="space-y-2"><Label>Athlète *</Label><Select required value={form.idAthlete} onValueChange={changeAthlete}><SelectTrigger><SelectValue placeholder="Sélectionner l’athlète" /></SelectTrigger><SelectContent>{uniqueAthletes.map((athlete) => <SelectItem key={athlete.idAthlete} value={athlete.idAthlete}>{athlete.nomComplet}</SelectItem>)}</SelectContent></Select></div>
            {!firstAffiliation && <div className="space-y-2"><Label>Club d’origine *</Label><Select required disabled value={form.idClubOrigine}><SelectTrigger><SelectValue placeholder={form.idAthlete ? "Aucune affiliation précédente" : "Sélectionnez d’abord l’athlète"} /></SelectTrigger><SelectContent>{uniqueClubs.map((club) => <SelectItem key={club.idClub} value={club.idClub}>{club.nomClub}</SelectItem>)}</SelectContent></Select></div>}
            <div className="space-y-2"><Label>Club bénéficiaire *</Label><Select required value={form.idClubBeneficiaire} onValueChange={(value) => setForm({ ...form, idClubBeneficiaire: value })}><SelectTrigger><SelectValue placeholder="Sélectionner le club bénéficiaire" /></SelectTrigger><SelectContent>{availableBeneficiaries.map((club) => <SelectItem key={club.idClub} value={club.idClub}>{club.nomClub}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Date de début *</Label><CompactDateInput required value={form.dateDebut} onValueChange={(dateDebut) => setForm({ ...form, dateDebut })} /></div>
            {temporary && <div className="space-y-2"><Label>Date de fin *</Label><CompactDateInput required value={form.dateFin} onValueChange={(dateFin) => setForm({ ...form, dateFin })} /></div>}
            <div className="space-y-2"><Label>Statut</Label><Select value={form.statutAffiliation} onValueChange={(value) => setForm({ ...form, statutAffiliation: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="actif">Actif</SelectItem><SelectItem value="inactif">Inactif</SelectItem><SelectItem value="en attente">En attente</SelectItem></SelectContent></Select></div>
            <div className="space-y-2 md:col-span-2"><Label>Observation</Label><Input value={form.observation} onChange={(e) => setForm({ ...form, observation: e.target.value })} /></div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <SheetFooter><Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>Annuler</Button><Button type="submit" disabled={pending || !types.length}>{pending ? "Enregistrement..." : "Créer l’affiliation"}</Button></SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
