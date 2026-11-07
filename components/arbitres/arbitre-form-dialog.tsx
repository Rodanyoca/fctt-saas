"use client"

import { useState } from "react"
import { Pencil } from "lucide-react"
import { toast } from "sonner"
import { AvatarFileField, uploadAvatarFile } from "@/components/actors/avatar-file-field"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import type { ActorSexOption, CoachReferenceOption } from "@/lib/actor-references"
import { formatSheetDate } from "@/lib/date-utils"
import type { Arbitre } from "@/lib/types"

export type SavedArbitre = Pick<Arbitre, "idArbitre" | "idNational" | "idFivb" | "idSexe" | "idGrade" | "nomComplet" | "sexe" | "dateDeNaissance" | "nationalite" | "niveau" | "grade" | "telephone" | "email" | "adresse" | "statut"> & {
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

export function ArbitreFormDialog({ arbitre, sexes, grades, onSaved }: {
  arbitre?: Arbitre
  sexes: ActorSexOption[]
  grades: CoachReferenceOption[]
  onSaved: (arbitre: SavedArbitre) => void
}) {
  const editing = Boolean(arbitre)
  const initialForm = () => ({
    idNational: arbitre?.idNational ?? "", idFivb: arbitre?.idFivb ?? "",
    nomComplet: arbitre?.nomComplet ?? "",
    idSexe: sexes.find((option) => option.id === arbitre?.idSexe || option.nom === arbitre?.sexe)?.id ?? "",
    dateNaissance: initialDateValue(arbitre?.dateDeNaissance), nationalite: arbitre?.nationalite ?? "",
    idGrade: grades.find((option) => option.id === arbitre?.idGrade || option.nom === arbitre?.grade)?.id ?? "",
    telephone: arbitre?.telephone ?? "", email: arbitre?.email ?? "", adresse: arbitre?.adresse ?? "",
    statut: arbitre?.statut || "actif",
  })
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [form, setForm] = useState(initialForm)

  const closeAfterSave = () => {
    setOpen(false); setAvatarFile(null); setError("")
    if (!editing) setForm(initialForm())
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setPending(true); setError("")
    try {
      const response = await fetch(editing ? `/api/arbitres/${encodeURIComponent(arbitre!.idArbitre)}` : "/api/arbitres", {
        method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Enregistrement impossible.")
      let savedArbitre: SavedArbitre = result.arbitre
      if (avatarFile) {
        try {
          savedArbitre = { ...savedArbitre, ...await uploadAvatarFile("arbitre", savedArbitre.idArbitre, avatarFile) }
        } catch (avatarError) {
          onSaved(savedArbitre)
          toast.warning(`${result.message} ${avatarError instanceof Error ? avatarError.message : "L’avatar n’a pas pu être enregistré."}`)
          closeAfterSave(); return
        }
      }
      onSaved(savedArbitre); toast.success(result.message); closeAfterSave()
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Enregistrement impossible."
      setError(message); toast.error(message)
    } finally { setPending(false) }
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild><Button variant={editing ? "outline" : "default"} className={editing ? undefined : "bg-brand-gold text-[#071827] hover:bg-brand-gold/90"}>{editing ? <><Pencil className="mr-2 h-4 w-4" />Modifier</> : "Créer un arbitre"}</Button></SheetTrigger>
      <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader><SheetTitle>{editing ? "Modifier l’arbitre" : "Créer un arbitre"}</SheetTitle><SheetDescription>Le nom complet et le sexe sont obligatoires. L’identifiant est généré automatiquement.</SheetDescription></SheetHeader>
        <form onSubmit={submit} className="space-y-6 px-4 pb-6">
          <div className="grid gap-4 md:grid-cols-2">
            {editing && <div className="space-y-2"><Label>Identifiant</Label><Input value={arbitre!.idArbitre} disabled /></div>}
            <div className="space-y-2"><Label>Nom complet *</Label><Input required value={form.nomComplet} onChange={(event) => setForm({ ...form, nomComplet: event.target.value })} /></div>
            <div className="space-y-2"><Label>Sexe *</Label><Select required value={form.idSexe} onValueChange={(value) => setForm({ ...form, idSexe: value })} disabled={!sexes.length}><SelectTrigger className="w-full"><SelectValue placeholder={sexes.length ? "Sélectionner le sexe" : "Référentiel non configuré"} /></SelectTrigger><SelectContent>{sexes.map((option) => <SelectItem key={option.id} value={option.id}>{option.nom}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>ID national</Label><Input value={form.idNational} onChange={(event) => setForm({ ...form, idNational: event.target.value })} /></div>
            
            <div className="space-y-2"><Label>Date de naissance</Label><Input type="text" inputMode="numeric" autoComplete="off" maxLength={10} pattern="(?:[0-9]{2}/[0-9]{2}/[0-9]{4})?" title="Saisissez uniquement 8 chiffres ; les séparateurs sont ajoutés automatiquement" value={form.dateNaissance} onChange={(event) => setForm({ ...form, dateNaissance: formatDateInput(event.target.value) })} placeholder="JJMMAAAA" /></div>
            <div className="space-y-2"><Label>Nationalité</Label><Input value={form.nationalite} onChange={(event) => setForm({ ...form, nationalite: event.target.value })} /></div>
            <div className="space-y-2"><Label>Grade</Label><Select value={form.idGrade} onValueChange={(value) => setForm({ ...form, idGrade: value })} disabled={!grades.length}><SelectTrigger className="w-full"><SelectValue placeholder={grades.length ? "Sélectionner le grade" : "Référentiel non configuré"} /></SelectTrigger><SelectContent>{grades.map((option) => <SelectItem key={option.id} value={option.id}>{option.nom}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>Téléphone</Label><Input type="tel" value={form.telephone} onChange={(event) => setForm({ ...form, telephone: event.target.value })} /></div>
            <div className="space-y-2"><Label>Adresse e-mail</Label><Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} /></div>
            <div className="space-y-2"><Label>Adresse</Label><Input value={form.adresse} onChange={(event) => setForm({ ...form, adresse: event.target.value })} /></div>
            <AvatarFileField editing={editing} onFileChange={setAvatarFile} />
            <div className="space-y-2"><Label>Statut</Label><Select value={form.statut} onValueChange={(value) => setForm({ ...form, statut: value })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="actif">Actif</SelectItem><SelectItem value="inactif">Inactif</SelectItem></SelectContent></Select></div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <SheetFooter><Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>Annuler</Button><Button type="submit" disabled={pending} className="bg-brand-gold text-[#071827] hover:bg-brand-gold/90">{pending ? "Enregistrement..." : editing ? "Enregistrer" : "Créer l’arbitre"}</Button></SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
