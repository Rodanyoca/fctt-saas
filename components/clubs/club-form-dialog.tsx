"use client"

import { useState, type ReactNode } from "react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { CompactDateInput } from "@/components/ui/compact-date-input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Club, Entente } from "@/lib/types"
import type { ClubReferenceOption } from "@/lib/club-references"
import { compactDateFromSheet } from "@/lib/compact-date"

export type SavedClub = Pick<Club, "idClub" | "codeClub" | "nomClub" | "categorie" | "idCategorieClub" | "version" | "idSexe" | "dateCreation" | "dateAffiliationClub" | "idEntente" | "nomEntente" | "pseudoEntente" | "idLigue" | "nomLigue" | "statut" | "observations" | "logoDriveId" | "logoDriveUrl"> & { previousIdClub?: string }

export function ClubFormDialog({ club, ententes, categories, sexes, onSaved, trigger }: {
  club?: Club; ententes: Entente[]; categories: ClubReferenceOption[]; sexes: ClubReferenceOption[]
  onSaved: (club: SavedClub) => void; trigger?: ReactNode
}) {
  const editing = Boolean(club)
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [error, setError] = useState("")
  const [logoFile, setLogoFile] = useState<File | null>(null)
  const [form, setForm] = useState({
    codeClub: club?.codeClub ?? "", nomClub: club?.nomClub ?? "",
    idCategorieClub: categories.some((option) => option.id === club?.idCategorieClub) ? club?.idCategorieClub ?? "" : "",
    idSexe: sexes.some((option) => option.id === club?.idSexe) ? club?.idSexe ?? "" : "",
    dateCreation: compactDateFromSheet(club?.dateCreation ?? ""),
    dateAffiliationClub: compactDateFromSheet(club?.dateAffiliationClub ?? ""), idEntente: club?.idEntente ?? "",
    statut: club?.statut ? club.statut.toUpperCase().replace("ACTIVE", "ACTIF").replace("INACTIVE", "INACTIF") : "ACTIF",
    observations: club?.observations ?? "",
  })

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setPending(true); setError("")
    try {
      const response = await fetch(editing ? `/api/clubs/${encodeURIComponent(club!.idClub)}` : "/api/clubs", {
        method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Enregistrement impossible.")
      let savedClub = result.club as SavedClub
      if (logoFile) {
        const logoForm = new FormData(); logoForm.set("logo", logoFile)
        const logoResponse = await fetch(`/api/clubs/${encodeURIComponent(savedClub.idClub)}/logo`, { method: "POST", body: logoForm })
        const logoResult = await logoResponse.json()
        if (!logoResponse.ok) throw new Error(logoResult.message || "Téléversement du logo impossible.")
        savedClub = logoResult.club
      }
      onSaved(savedClub)
      toast.success(logoFile ? "Le club et son logo ont été enregistrés." : result.message)
      setLogoFile(null); setOpen(false)
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Enregistrement impossible."
      setError(message); toast.error(message)
    } finally { setPending(false) }
  }

  return <Sheet open={open} onOpenChange={(value) => { if (!pending) setOpen(value) }}>
    <SheetTrigger asChild>{trigger ?? <Button variant={editing ? "outline" : "default"} className={editing ? "hover:border-brand-gold/60 hover:bg-brand-gold/10 hover:text-brand-gold" : "bg-brand-gold text-[#071827] hover:bg-brand-gold/90"}>{editing ? "Modifier le club" : "Ajouter un club"}</Button>}</SheetTrigger>
    <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
      <SheetHeader><SheetTitle>{editing ? "Modifier le club" : "Ajouter un club"}</SheetTitle><SheetDescription>{editing ? "Modifiez les informations du club." : "L’identifiant sera généré avec l’identifiant de l’entente et le code du club."}</SheetDescription></SheetHeader>
      <form onSubmit={submit} className="space-y-6 px-4 pb-24">
        <div className="grid gap-4 sm:grid-cols-2">
          {editing && <div className="space-y-2"><Label>Identifiant</Label><Input value={club!.idClub} disabled /></div>}
          <div className="space-y-2"><Label>Code du club *</Label><Input required disabled={editing} value={form.codeClub} onChange={(event) => setForm({ ...form, codeClub: event.target.value })} placeholder="Ex. 01" /></div>
          <div className="space-y-2 sm:col-span-2"><Label>Entente *</Label><Select required value={form.idEntente} onValueChange={(value) => setForm({ ...form, idEntente: value })}><SelectTrigger><SelectValue placeholder="Sélectionner une entente" /></SelectTrigger><SelectContent>{ententes.map((entente) => <SelectItem key={entente.idEntente} value={entente.idEntente}>{entente.pseudoEntente || entente.nomEntente}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2 sm:col-span-2"><Label>Nom du club *</Label><Input required value={form.nomClub} onChange={(event) => setForm({ ...form, nomClub: event.target.value })} /></div>
          <div className="space-y-2"><Label>Catégorie</Label><Select value={form.idCategorieClub} onValueChange={(value) => setForm({ ...form, idCategorieClub: value })} disabled={!categories.length}><SelectTrigger><SelectValue placeholder={categories.length ? "Sélectionner une catégorie" : "Référentiel non configuré"} /></SelectTrigger><SelectContent>{categories.map((option) => <SelectItem key={option.id} value={option.id}>{option.nom}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Sexe</Label><Select value={form.idSexe} onValueChange={(value) => setForm({ ...form, idSexe: value })} disabled={!sexes.length}><SelectTrigger><SelectValue placeholder={sexes.length ? "Sélectionner un sexe" : "Référentiel non configuré"} /></SelectTrigger><SelectContent>{sexes.map((option) => <SelectItem key={option.id} value={option.id}>{option.nom}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>Date de création</Label><CompactDateInput optional value={form.dateCreation} onValueChange={(dateCreation) => setForm({ ...form, dateCreation })} /></div>
          <div className="space-y-2"><Label>Date d’affiliation</Label><CompactDateInput optional value={form.dateAffiliationClub} onValueChange={(dateAffiliationClub) => setForm({ ...form, dateAffiliationClub })} /></div>
          <div className="space-y-2"><Label>Statut</Label><Select value={form.statut} onValueChange={(value) => setForm({ ...form, statut: value })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIF">Actif</SelectItem><SelectItem value="INACTIF">Inactif</SelectItem></SelectContent></Select></div>
          <div className="space-y-2 sm:col-span-2"><Label htmlFor={`club-logo-${club?.idClub ?? "new"}`}>Logo du club</Label>{club?.logoDriveUrl ? <img src={club.logoDriveUrl} alt={`Logo actuel de ${club.nomClub}`} className="h-20 w-20 rounded-lg border object-contain p-1" /> : null}<Input id={`club-logo-${club?.idClub ?? "new"}`} type="file" accept="image/jpeg,image/png,image/webp" onChange={(event) => setLogoFile(event.target.files?.[0] ?? null)} /><p className="text-xs text-muted-foreground">JPG, PNG ou WebP, 5 Mo maximum. Un nouveau fichier remplace le logo actuel.</p></div>
          <div className="space-y-2 sm:col-span-2"><Label>Observations</Label><Textarea value={form.observations} onChange={(event) => setForm({ ...form, observations: event.target.value })} /></div>
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <SheetFooter className="px-0"><Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>Annuler</Button><Button type="submit" disabled={pending} className="bg-brand-gold text-[#071827] hover:bg-brand-gold/90">{pending ? "Enregistrement..." : editing ? "Enregistrer" : "Créer le club"}</Button></SheetFooter>
      </form>
    </SheetContent>
  </Sheet>
}
