"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { ActorSexOption, CoachReferenceOption } from "@/lib/actor-references"
import type { Coach } from "@/lib/types"
import { formatSheetDate } from "@/lib/date-utils"
import { AvatarFileField, uploadAvatarFile } from "@/components/actors/avatar-file-field"
import { Pencil } from "lucide-react"

export type SavedCoach = Pick<Coach, "idCoach" | "idNational" | "idFivb" | "idSexe" | "idNiveau" | "nomComplet" | "sexe" | "dateNaissance" | "nationalite" | "niveau" | "telephone" | "email" | "adresse" | "statut"> & {
  avatarDriveId?: string
  avatarDriveUrl?: string
}

function formatDateInput(value: string) {
  const digits = value.replace(/\D/g, "").slice(0, 8)
  if (digits.length <= 2) return digits
  if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`
  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`
}

function initialDateValue(value: string | undefined) {
  if (!value) return ""
  const formatted = formatSheetDate(value)
  return formatted === "-" ? "" : formatted
}

export function CoachFormDialog({ coach, sexes, levels, onSaved }: {
  coach?: Coach
  sexes: ActorSexOption[]
  levels: CoachReferenceOption[]
  onSaved: (coach: SavedCoach) => void
}) {
  const editing = Boolean(coach)
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    idNational: coach?.idNational ?? "", idFivb: coach?.idFivb ?? "",
    nomComplet: coach?.nomComplet ?? "",
    idSexe: sexes.find((option) => option.id === coach?.idSexe || option.nom === coach?.sexe)?.id ?? "",
    dateNaissance: initialDateValue(coach?.dateNaissance), nationalite: coach?.nationalite ?? "",
    idNiveau: levels.find((option) => option.id === coach?.idNiveau || option.nom === coach?.niveau)?.id ?? "", telephone: coach?.telephone ?? "",
    email: coach?.email ?? "", adresse: coach?.adresse ?? "",
    statut: coach?.statut || "actif",
  })

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setPending(true); setError("")
    try {
      const response = await fetch(editing ? `/api/coachs/${encodeURIComponent(coach!.idCoach)}` : "/api/coachs", {
        method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Enregistrement impossible.")
      let savedCoach: SavedCoach = result.coach
      if (avatarFile) {
        try {
          savedCoach = { ...savedCoach, ...await uploadAvatarFile("coach", savedCoach.idCoach, avatarFile) }
        } catch (avatarError) {
          onSaved(savedCoach)
          toast.warning(`${result.message} ${avatarError instanceof Error ? avatarError.message : "L’avatar n’a pas pu être enregistré."}`)
          setOpen(false); setAvatarFile(null); return
        }
      }
      onSaved(savedCoach); toast.success(result.message); setOpen(false); setAvatarFile(null)
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Enregistrement impossible."
      setError(message); toast.error(message)
    } finally { setPending(false) }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild><Button variant={editing ? "outline" : "default"} className={editing ? undefined : "bg-brand-gold text-[#071827] hover:bg-brand-gold/90"}>{editing ? <><Pencil className="mr-2 h-4 w-4" />Modifier</> : "Créer un coach"}</Button></SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader><SheetTitle>{editing ? "Modifier le coach" : "Créer un coach"}</SheetTitle><SheetDescription>Le nom complet et le sexe sont obligatoires. Les avatars sont gérés séparément.</SheetDescription></SheetHeader>
        <form onSubmit={submit} className="space-y-6 px-4 pb-6">
          <div className="grid gap-4 md:grid-cols-2">
            {editing && <div className="space-y-2"><Label>Identifiant</Label><Input value={coach!.idCoach} disabled /></div>}
            <div className="space-y-2"><Label>Nom complet *</Label><Input required value={form.nomComplet} onChange={(e) => setForm({ ...form, nomComplet: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Sexe *</Label>
              <Select required value={form.idSexe} onValueChange={(value) => setForm({ ...form, idSexe: value })} disabled={!sexes.length}>
                <SelectTrigger className="w-full"><SelectValue placeholder={sexes.length ? "Sélectionner le sexe" : "Référentiel non configuré"} /></SelectTrigger>
                <SelectContent>{sexes.map((option) => <SelectItem key={option.id} value={option.id}>{option.nom}</SelectItem>)}</SelectContent>
              </Select>
              {editing && !form.idSexe && sexes.length > 0 && <p className="text-xs text-muted-foreground">Sexe non renseigné dans le classeur. Sélectionnez une valeur pour compléter le profil.</p>}
            </div>
            <div className="space-y-2"><Label>ID national</Label><Input value={form.idNational} onChange={(e) => setForm({ ...form, idNational: e.target.value })} /></div>
            
            <div className="space-y-2"><Label>Date de naissance</Label><Input type="text" inputMode="numeric" autoComplete="off" maxLength={10} pattern="(?:[0-9]{2}/[0-9]{2}/[0-9]{4})?" title="Saisissez uniquement 8 chiffres ; les séparateurs sont ajoutés automatiquement" value={form.dateNaissance} onChange={(e) => setForm({ ...form, dateNaissance: formatDateInput(e.target.value) })} placeholder="JJMMAAAA" /></div>
            <div className="space-y-2"><Label>Nationalité</Label><Input value={form.nationalite} onChange={(e) => setForm({ ...form, nationalite: e.target.value })} /></div>
            <div className="space-y-2"><Label>Niveau</Label><Select value={form.idNiveau} onValueChange={(value) => setForm({ ...form, idNiveau: value })} disabled={!levels.length}><SelectTrigger className="w-full"><SelectValue placeholder={levels.length ? "Sélectionner le niveau" : "Référentiel non configuré"} /></SelectTrigger><SelectContent>{levels.map((option) => <SelectItem key={option.id} value={option.id}>{option.nom}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Téléphone</Label><Input type="tel" value={form.telephone} onChange={(e) => setForm({ ...form, telephone: e.target.value })} /></div>
            <div className="space-y-2"><Label>Adresse e-mail</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="space-y-2"><Label>Adresse</Label><Input value={form.adresse} onChange={(e) => setForm({ ...form, adresse: e.target.value })} /></div>
            <AvatarFileField editing={editing} onFileChange={setAvatarFile} />
            <div className="space-y-2"><Label>Statut</Label><Select value={form.statut} onValueChange={(value) => setForm({ ...form, statut: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="actif">Actif</SelectItem><SelectItem value="inactif">Inactif</SelectItem></SelectContent></Select></div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <SheetFooter><Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>Annuler</Button><Button type="submit" disabled={pending} className="bg-brand-gold text-[#071827] hover:bg-brand-gold/90">{pending ? "Enregistrement..." : editing ? "Enregistrer" : "Créer le coach"}</Button></SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
