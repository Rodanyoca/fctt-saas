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
import { compactDateFromSheet, compareDateValues, formatCompactDateInput, formatDateForSheet, validateBirthDate } from "@/lib/compact-date"
import type { Medecin } from "@/lib/types"

export type SavedMedecin = Pick<Medecin, "idMedecin" | "idNational" | "idFivb" | "idSexe" | "idSpecialite" | "nomComplet" | "sexe" | "dateDeNaissance" | "nationalite" | "telephone" | "email" | "adresse" | "specialite" | "numeroPasseport" | "dateDelivrancePasseport" | "dateExpirationPasseport" | "statut"> & {
  avatarDriveId?: string
  avatarDriveUrl?: string
}

type FieldErrors = Partial<Record<"nomComplet" | "idSexe" | "dateNaissance" | "dateDelivrancePasseport" | "dateExpirationPasseport" | "email", string>>

function dateError(value: string, label: string) {
  if (!value) return ""
  try { formatDateForSheet(value); return "" } catch { return `${label} doit contenir une date valide sur 8 chiffres.` }
}

export function MedecinFormDialog({ medecin, sexes, specialties, onSaved }: {
  medecin?: Medecin
  sexes: ActorSexOption[]
  specialties: CoachReferenceOption[]
  onSaved: (medecin: SavedMedecin) => void
}) {
  const editing = Boolean(medecin)
  const initialForm = () => ({
    idNational: medecin?.idNational ?? "", idFivb: medecin?.idFivb ?? "", nomComplet: medecin?.nomComplet ?? "",
    idSexe: sexes.find((option) => option.id === medecin?.idSexe || option.nom === medecin?.sexe)?.id ?? medecin?.idSexe ?? "",
    dateNaissance: compactDateFromSheet(medecin?.dateDeNaissance ?? ""), nationalite: medecin?.nationalite ?? "",
    idSpecialite: specialties.find((option) => option.id === medecin?.idSpecialite || option.nom === medecin?.specialite)?.id ?? medecin?.idSpecialite ?? "",
    telephone: medecin?.telephone ?? "", email: medecin?.email ?? "", adresse: medecin?.adresse ?? "",
    numeroPasseport: medecin?.numeroPasseport ?? "", dateDelivrancePasseport: compactDateFromSheet(medecin?.dateDelivrancePasseport ?? ""),
    dateExpirationPasseport: compactDateFromSheet(medecin?.dateExpirationPasseport ?? ""), statut: medecin?.statut || "actif",
  })
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [errors, setErrors] = useState<FieldErrors>({})
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [form, setForm] = useState(initialForm)

  const validate = () => {
    const next: FieldErrors = {}
    if (!form.nomComplet.trim()) next.nomComplet = "Le nom complet est obligatoire."
    if (!form.idSexe) next.idSexe = "Le sexe est obligatoire."
    const birthError = validateBirthDate(form.dateNaissance)
    if (birthError) next.dateNaissance = birthError
    const deliveryError = dateError(form.dateDelivrancePasseport, "La date de délivrance")
    const expirationError = dateError(form.dateExpirationPasseport, "La date d’expiration")
    if (deliveryError) next.dateDelivrancePasseport = deliveryError
    if (expirationError) next.dateExpirationPasseport = expirationError
    if (!deliveryError && !expirationError && form.dateDelivrancePasseport && form.dateExpirationPasseport && compareDateValues(form.dateDelivrancePasseport, form.dateExpirationPasseport)! > 0) next.dateExpirationPasseport = "L’expiration ne peut pas précéder la délivrance."
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) next.email = "L’adresse e-mail est invalide."
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const finish = () => {
    setOpen(false); setAvatarFile(null); setError(""); setErrors({})
    if (!editing) setForm(initialForm())
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!validate()) return
    setPending(true); setError("")
    try {
      const response = await fetch(editing ? `/api/medecins/${encodeURIComponent(medecin!.idMedecin)}` : "/api/medecins", {
        method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Enregistrement impossible.")
      let savedMedecin: SavedMedecin = result.medecin
      if (avatarFile) {
        try { savedMedecin = { ...savedMedecin, ...await uploadAvatarFile("medecin", savedMedecin.idMedecin, avatarFile) } }
        catch (avatarError) {
          onSaved(savedMedecin); toast.warning(`${result.message} ${avatarError instanceof Error ? avatarError.message : "L’avatar n’a pas pu être enregistré."}`); finish(); return
        }
      }
      onSaved(savedMedecin); toast.success(result.message); finish()
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Enregistrement impossible."
      setError(message); toast.error(message)
    } finally { setPending(false) }
  }

  const dateField = (key: "dateNaissance" | "dateDelivrancePasseport" | "dateExpirationPasseport", label: string) => (
    <div className="space-y-2"><Label htmlFor={`medecin-${key}`}>{label}</Label><Input id={`medecin-${key}`} inputMode="numeric" maxLength={10} value={form[key]} onChange={(event) => setForm({ ...form, [key]: formatCompactDateInput(event.target.value) })} placeholder="JJMMAAAA" aria-invalid={Boolean(errors[key])} />{errors[key] && <p className="text-xs text-destructive">{errors[key]}</p>}</div>
  )

  const historicalSpecialty = Boolean(form.idSpecialite && !specialties.some((option) => option.id === form.idSpecialite))

  return <Sheet open={open} onOpenChange={(next) => { if (!pending) { if (next) { setForm(initialForm()); setAvatarFile(null); setError(""); setErrors({}) } setOpen(next) } }}>
    <SheetTrigger asChild><Button variant={editing ? "outline" : "default"} className={editing ? undefined : "bg-brand-gold text-[#071827] hover:bg-brand-gold/90"}>{editing ? <><Pencil className="mr-2 size-4" />Modifier</> : "Créer un médecin"}</Button></SheetTrigger>
    <SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
      <SheetHeader><SheetTitle>{editing ? "Modifier le médecin" : "Créer un médecin"}</SheetTitle><SheetDescription>Identité, coordonnées et informations médicales. Les dates se saisissent sur huit chiffres.</SheetDescription></SheetHeader>
      <form onSubmit={submit} className="space-y-6 px-4 pb-6">
        <fieldset className="grid gap-4 md:grid-cols-2"><legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground md:col-span-2">Identification</legend>
          {editing && <div className="space-y-2"><Label>Identifiant</Label><Input value={medecin!.idMedecin} disabled /></div>}
          <div className="space-y-2"><Label htmlFor="medecin-nom">Nom complet *</Label><Input id="medecin-nom" required value={form.nomComplet} onChange={(event) => setForm({ ...form, nomComplet: event.target.value })} aria-invalid={Boolean(errors.nomComplet)} />{errors.nomComplet && <p className="text-xs text-destructive">{errors.nomComplet}</p>}</div>
          <div className="space-y-2"><Label>Sexe *</Label><Select required value={form.idSexe} onValueChange={(value) => setForm({ ...form, idSexe: value })} disabled={!sexes.length}><SelectTrigger className="w-full" aria-invalid={Boolean(errors.idSexe)}><SelectValue placeholder={sexes.length ? "Sélectionner le sexe" : "Référentiel non configuré"} /></SelectTrigger><SelectContent>{sexes.map((option) => <SelectItem key={option.id} value={option.id}>{option.nom}</SelectItem>)}</SelectContent></Select>{errors.idSexe && <p className="text-xs text-destructive">{errors.idSexe}</p>}</div>
          {dateField("dateNaissance", "Date de naissance")}
          <div className="space-y-2"><Label>Nationalité</Label><Input value={form.nationalite} onChange={(event) => setForm({ ...form, nationalite: event.target.value })} /></div>
          <div className="space-y-2"><Label>ID national</Label><Input value={form.idNational} onChange={(event) => setForm({ ...form, idNational: event.target.value })} /></div>
          
          <div className="space-y-2"><Label>Spécialité</Label><Select value={form.idSpecialite} onValueChange={(value) => setForm({ ...form, idSpecialite: value })} disabled={!specialties.length}><SelectTrigger className="w-full"><SelectValue placeholder={specialties.length ? "Sélectionner la spécialité" : "Référentiel non configuré"} /></SelectTrigger><SelectContent>{historicalSpecialty && <SelectItem value={form.idSpecialite}>Valeur historique</SelectItem>}{specialties.map((option) => <SelectItem key={option.id} value={option.id}>{option.nom}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Statut</Label><Select value={form.statut} onValueChange={(value) => setForm({ ...form, statut: value })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="actif">Actif</SelectItem><SelectItem value="inactif">Inactif</SelectItem></SelectContent></Select></div>
        </fieldset>
        <fieldset className="grid gap-4 md:grid-cols-2"><legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground md:col-span-2">Coordonnées</legend>
          <div className="space-y-2"><Label>Téléphone</Label><Input type="tel" value={form.telephone} onChange={(event) => setForm({ ...form, telephone: event.target.value })} /></div>
          <div className="space-y-2"><Label>Adresse e-mail</Label><Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} aria-invalid={Boolean(errors.email)} />{errors.email && <p className="text-xs text-destructive">{errors.email}</p>}</div>
          <div className="space-y-2 md:col-span-2"><Label>Adresse</Label><Input value={form.adresse} onChange={(event) => setForm({ ...form, adresse: event.target.value })} /></div>
        </fieldset>
        <fieldset className="grid gap-4 md:grid-cols-2"><legend className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground md:col-span-2">Passeport et média</legend>
          <div className="space-y-2"><Label>Numéro de passeport</Label><Input value={form.numeroPasseport} onChange={(event) => setForm({ ...form, numeroPasseport: event.target.value })} /></div>
          {dateField("dateDelivrancePasseport", "Date de délivrance")}{dateField("dateExpirationPasseport", "Date d’expiration")}
          <AvatarFileField editing={editing} onFileChange={setAvatarFile} />
        </fieldset>
        {error && <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
        <SheetFooter><Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>Annuler</Button><Button type="submit" disabled={pending} className="bg-brand-gold text-[#071827] hover:bg-brand-gold/90">{pending ? "Enregistrement…" : "Enregistrer"}</Button></SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
}
