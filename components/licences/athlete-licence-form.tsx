"use client"

import { useEffect, useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { CompactDateInput } from "@/components/ui/compact-date-input"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { formatDateForDisplay } from "@/lib/compact-date"
import type { AthleteLicenceCandidate } from "@/lib/athlete-licence-creation"

type Option = { id: string; label: string }
const isActiveStatus = (value: string) => ["ACTIF", "ACTIVE"].includes(value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").trim().toUpperCase())

export function AthleteLicenceForm({ clubs, seasons, statuses, candidates, onSaved }: {
  clubs: Option[]
  seasons: Option[]
  statuses: Option[]
  candidates: AthleteLicenceCandidate[]
  onSaved: () => void
}) {
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [clubId, setClubId] = useState("")
  const [affiliationId, setAffiliationId] = useState("")
  const [seasonId, setSeasonId] = useState("")
  const [numeroLicence, setNumeroLicence] = useState("")
  const [dateDelivrance, setDateDelivrance] = useState("")
  const [statusId, setStatusId] = useState("")
  const [observations, setObservations] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})
  const available = useMemo(() => candidates.filter((item) => item.clubId === clubId), [candidates, clubId])
  const selected = available.find((item) => item.affiliationId === affiliationId)

  useEffect(() => {
    if (!open) return
    setClubId("")
    setAffiliationId("")
    setSeasonId(seasons[0]?.id ?? "")
    setNumeroLicence("")
    setDateDelivrance("")
    setStatusId(statuses.find((item) => isActiveStatus(item.label))?.id ?? statuses[0]?.id ?? "")
    setObservations("")
    setErrors({})
  }, [open, seasons, statuses])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!selected || pending) return
    setPending(true)
    setErrors({})
    try {
      const response = await fetch("/api/licences/athletes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id_athlete: selected.athleteId,
          id_affiliation_athlete: selected.affiliationId,
          id_saison: seasonId,
          numero_licence: numeroLicence,
          date_delivrance: dateDelivrance,
          id_statut_licence: statusId,
          observations,
        }),
      })
      const payload = await response.json()
      if (!response.ok) {
        setErrors({ ...(payload.fields ?? {}), form: payload.message ?? "Création impossible." })
        return
      }
      toast.success("Licence créée")
      setOpen(false)
      onSaved()
    } catch {
      setErrors({ form: "Service temporairement indisponible." })
    } finally {
      setPending(false)
    }
  }

  return <Sheet open={open} onOpenChange={(value) => !pending && setOpen(value)}>
    <SheetTrigger asChild><Button className="bg-brand-gold text-slate-950 hover:bg-brand-gold/90"><Plus className="size-4" />Créer une licence</Button></SheetTrigger>
    <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
      <SheetHeader><SheetTitle>Créer une licence d’athlète</SheetTitle><SheetDescription>La licence sera liée à une affiliation existante. Son statut est affiché à titre informatif.</SheetDescription></SheetHeader>
      <form onSubmit={submit} className="space-y-5 px-4 pb-28">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2"><Label>Club *</Label><Select value={clubId} onValueChange={(value) => { setClubId(value); setAffiliationId("") }}><SelectTrigger><SelectValue placeholder="Sélectionner un club" /></SelectTrigger><SelectContent>{clubs.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Saison *</Label><Select value={seasonId} onValueChange={setSeasonId}><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{seasons.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2 sm:col-span-2"><Label>Athlète affilié *</Label><Select value={affiliationId} onValueChange={setAffiliationId} disabled={!clubId}><SelectTrigger><SelectValue placeholder={clubId ? "Sélectionner un athlète" : "Sélectionnez d’abord un club"} /></SelectTrigger><SelectContent>{available.map((item) => <SelectItem key={item.affiliationId} value={item.affiliationId}>{item.athleteName} · {item.affiliationStatus} · {formatDateForDisplay(item.dateDebut) || "?"} — {formatDateForDisplay(item.dateFin) || "En cours"}</SelectItem>)}</SelectContent></Select>{clubId && !available.length ? <p className="text-sm text-muted-foreground">Aucune affiliation enregistrée pour ce club.</p> : null}{selected ? <p className="text-xs text-muted-foreground">Affiliation {selected.affiliationId} · Statut : {selected.affiliationStatus} · {formatDateForDisplay(selected.dateDebut) || "Date inconnue"} — {formatDateForDisplay(selected.dateFin) || "Sans date de fin"}</p> : null}</div>
          <div className="space-y-2"><Label>Numéro de licence *</Label><Input value={numeroLicence} onChange={(event) => setNumeroLicence(event.target.value)} aria-invalid={Boolean(errors.numero_licence)} />{errors.numero_licence ? <p className="text-sm text-destructive">{errors.numero_licence}</p> : null}</div>
          <div className="space-y-2"><Label>Date de délivrance *</Label><CompactDateInput value={dateDelivrance} onValueChange={setDateDelivrance} aria-invalid={Boolean(errors.date_delivrance)} />{errors.date_delivrance ? <p className="text-sm text-destructive">{errors.date_delivrance}</p> : null}</div>
          <div className="space-y-2"><Label>Statut de la licence *</Label><Select value={statusId} onValueChange={setStatusId}><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{statuses.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2 sm:col-span-2"><Label>Observations</Label><Textarea value={observations} onChange={(event) => setObservations(event.target.value)} /></div>
        </div>
        {errors.form ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{errors.form}</p> : null}
        <SheetFooter className="absolute inset-x-0 bottom-0 border-t bg-background"><Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>Annuler</Button><Button type="submit" disabled={pending || !selected || !seasonId || !numeroLicence || dateDelivrance.length !== 10 || !statusId} className="bg-brand-gold text-slate-950 hover:bg-brand-gold/90">{pending ? "Enregistrement..." : "Créer la licence"}</Button></SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
}
