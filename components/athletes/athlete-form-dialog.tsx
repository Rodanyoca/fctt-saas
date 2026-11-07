"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { ActorSexOption } from "@/lib/actor-references"
import type { Athlete } from "@/lib/types"
import { formatCompactDateInput, parseCompactDate } from "@/lib/compact-date"
import { formatSheetDate } from "@/lib/date-utils"
import { AvatarFileField, uploadAvatarFile } from "@/components/actors/avatar-file-field"

export type SavedAthlete = Pick<Athlete, "idAthlete" | "idNational" | "idFivb" | "idSexe" | "nomComplet" | "dateDeNaissance" | "lieuNaissance" | "sexe" | "nationalite" | "telephone" | "email" | "adresse" | "observations" | "avatarDriveId" | "avatarDriveUrl" | "statut">

function formStatus(value: string | undefined) {
  const status = String(value ?? "").trim().toUpperCase()
  if (status === "INACTIF" || status === "INACTIVE") return "INACTIF"
  return "ACTIF"
}

function formatDateInput(value: string) { return formatCompactDateInput(value) }

function initialDateValue(value: string | undefined) {
  if (!value) return ""
  const formatted = formatSheetDate(value)
  return formatted === "-" ? "" : formatted
}

function athleteFormValues(athlete: Athlete | undefined, sexes: ActorSexOption[]) {
  return {
    idNational: athlete?.idNational ?? "", idFivb: athlete?.idFivb ?? "",
    nomComplet: athlete?.nomComplet ?? "", dateDeNaissance: initialDateValue(athlete?.dateDeNaissance),
    lieuDeNaissance: athlete?.lieuNaissance ?? "",
    idSexe: sexes.find((option) => option.id === athlete?.idSexe || option.nom === athlete?.sexe)?.id ?? "",
    nationalite: athlete?.nationalite ?? "", telephone: athlete?.telephone ?? "",
    email: athlete?.email ?? "", adresse: athlete?.adresse ?? "", observations: athlete?.observations ?? "",
    statut: formStatus(athlete?.statut),
  }
}

export function AthleteFormDialog({ athlete, sexes, onSaved }: {
  athlete?: Athlete
  sexes: ActorSexOption[]
  onSaved: (athlete: SavedAthlete) => void
}) {
  const editing = Boolean(athlete)
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [form, setForm] = useState(() => athleteFormValues(athlete, sexes))

  const resetAfterCreate = () => {
    if (!editing) setForm(athleteFormValues(undefined, sexes))
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (form.dateDeNaissance && !parseCompactDate(form.dateDeNaissance)) { setError("Date de naissance invalide."); return }
    setPending(true); setError("")
    try {
      const response = await fetch(editing ? `/api/athletes/${encodeURIComponent(athlete!.idAthlete)}` : "/api/athletes", {
        method: editing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Enregistrement impossible.")
      let savedAthlete: SavedAthlete = result.athlete
      if (avatarFile) {
        try {
          savedAthlete = { ...savedAthlete, ...await uploadAvatarFile("athlete", savedAthlete.idAthlete, avatarFile) }
        } catch (avatarError) {
          onSaved(savedAthlete)
          toast.warning(`${result.message} ${avatarError instanceof Error ? avatarError.message : "L’avatar n’a pas pu être enregistré."}`)
          resetAfterCreate()
          setOpen(false)
          setAvatarFile(null)
          return
        }
      }
      onSaved(savedAthlete); toast.success(result.message); resetAfterCreate(); setOpen(false); setAvatarFile(null)
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Enregistrement impossible."
      setError(message); toast.error(message)
    } finally { setPending(false) }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild><Button variant={editing ? "outline" : "default"} className={editing ? undefined : "bg-brand-gold text-[#071827] hover:bg-brand-gold/90"}>{editing ? "Modifier l’athlète" : "Créer un athlète"}</Button></SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{editing ? "Modifier l’athlète" : "Créer un athlète"}</SheetTitle>
          <SheetDescription>{editing ? "Modifiez les informations générales de l’athlète." : "Le nom complet et le sexe sont obligatoires. L’identifiant sera généré automatiquement."}</SheetDescription>
        </SheetHeader>
        <form onSubmit={submit} className="space-y-6 px-4 pb-6">
          <div className="grid gap-4 md:grid-cols-2">
            {editing && <div className="space-y-2"><Label>Identifiant</Label><Input value={athlete!.idAthlete} disabled /></div>}
            <div className="space-y-2"><Label>Nom complet *</Label><Input required value={form.nomComplet} onChange={(e) => setForm({ ...form, nomComplet: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Sexe *</Label>
              <Select required value={form.idSexe} onValueChange={(value) => setForm({ ...form, idSexe: value })} disabled={!sexes.length}>
                <SelectTrigger><SelectValue placeholder={sexes.length ? "Sélectionner le sexe" : "Référentiel non configuré"} /></SelectTrigger>
                <SelectContent>{sexes.map((option) => <SelectItem key={option.id} value={option.id}>{option.nom}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>ID national</Label><Input value={form.idNational} onChange={(e) => setForm({ ...form, idNational: e.target.value })} /></div>
            
            <div className="space-y-2"><Label>Date de naissance</Label><Input type="text" inputMode="numeric" autoComplete="off" maxLength={10} pattern="(?:[0-9]{2}/[0-9]{2}/[0-9]{4})?" title="Saisissez uniquement 8 chiffres ; les séparateurs sont ajoutés automatiquement" value={form.dateDeNaissance} onChange={(e) => setForm({ ...form, dateDeNaissance: formatDateInput(e.target.value) })} placeholder="JJMMAAAA" /></div>
            <div className="space-y-2"><Label>Lieu de naissance</Label><Input value={form.lieuDeNaissance} onChange={(e) => setForm({ ...form, lieuDeNaissance: e.target.value })} /></div>
            <div className="space-y-2"><Label>Nationalité</Label><Input value={form.nationalite} onChange={(e) => setForm({ ...form, nationalite: e.target.value })} /></div>
            <div className="space-y-2"><Label>Téléphone</Label><Input type="tel" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Adresse e-mail</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Adresse</Label><Input value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} /></div>
            <div className="space-y-2 md:col-span-2"><Label>Observations</Label><Textarea value={form.observations} onChange={(e) => setForm({ ...form, observations: e.target.value })} /></div>
            <AvatarFileField editing={editing} onFileChange={setAvatarFile} />
            <div className="space-y-2">
              <Label>Statut</Label>
              <Select value={form.statut} onValueChange={(value) => setForm({ ...form, statut: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIF">Actif</SelectItem><SelectItem value="INACTIF">Inactif</SelectItem></SelectContent></Select>
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <SheetFooter><Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>Annuler</Button><Button type="submit" disabled={pending} className="bg-brand-gold text-[#071827] hover:bg-brand-gold/90">{pending ? "Enregistrement..." : editing ? "Enregistrer" : "Créer l’athlète"}</Button></SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
