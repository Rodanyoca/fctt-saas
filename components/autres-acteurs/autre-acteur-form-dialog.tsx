"use client"

import { useMemo, useState } from "react"
import { Pencil } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { CompactDateInput } from "@/components/ui/compact-date-input"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { autreActeurFormSchema, type AutreActeurFormValues } from "@/lib/autres-acteurs-schema"
import { compactDateFromSheet } from "@/lib/compact-date"
import type { ActorSexOption } from "@/lib/actor-references"
import type { AutreActeur, TypeAutreActeur } from "@/lib/types"
import { selectableAutreActeurTypes } from "@/lib/autres-acteurs-domain"

export type SavedAutreActeur = AutreActeur
type Errors = Partial<Record<keyof AutreActeurFormValues, string>>

export function AutreActeurFormDialog({ acteur, sexes, types, onSaved }: { acteur?: AutreActeur; sexes: ActorSexOption[]; types: TypeAutreActeur[]; onSaved: (acteur: SavedAutreActeur) => void }) {
  const editing = Boolean(acteur)
  const initial = (): AutreActeurFormValues => ({
    nomComplet: acteur?.nomComplet ?? "", idSexe: acteur?.idSexe ?? "", dateNaissance: compactDateFromSheet(acteur?.dateNaissance ?? ""),
    lieuNaissance: acteur?.lieuNaissance ?? "", nationalite: acteur?.nationalite ?? "", idTypeAutreActeur: acteur?.idTypeAutreActeur ?? "",
    telephone: acteur?.telephone ?? "", email: acteur?.email ?? "", adresse: acteur?.adresse ?? "", numeroPasseport: acteur?.numeroPasseport ?? "",
    dateDelivrancePasseport: compactDateFromSheet(acteur?.dateDelivrancePasseport ?? ""), dateExpirationPasseport: compactDateFromSheet(acteur?.dateExpirationPasseport ?? ""),
    statut: acteur?.statut?.toUpperCase() === "INACTIF" ? "INACTIF" : "ACTIF", observations: acteur?.observations ?? "",
  })
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [form, setForm] = useState<AutreActeurFormValues>(initial)
  const [errors, setErrors] = useState<Errors>({})
  const [error, setError] = useState("")
  const selectableTypes = useMemo(() => {
    const options = selectableAutreActeurTypes(types, acteur?.idTypeAutreActeur)
    if (acteur?.idTypeAutreActeur && !options.some((type) => type.id === acteur.idTypeAutreActeur)) return [...options, { id: acteur.idTypeAutreActeur, nom: `${acteur.typeAutreActeur || "Type non reconnu"} (${acteur.idTypeAutreActeur})`, statut: "INCONNU", observations: "" }]
    return options
  }, [acteur, types])
  const set = (key: keyof AutreActeurFormValues, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const fieldError = (key: keyof AutreActeurFormValues) => errors[key] ? <p className="text-xs text-destructive">{errors[key]}</p> : null

  const submit = async (event: React.FormEvent) => {
    event.preventDefault(); setError(""); setErrors({})
    const parsed = autreActeurFormSchema.safeParse(form)
    if (!parsed.success) {
      const next: Errors = {}
      parsed.error.issues.forEach((issue) => { const key = issue.path[0] as keyof AutreActeurFormValues; if (key && !next[key]) next[key] = issue.message })
      setErrors(next); return
    }
    setPending(true)
    try {
      const response = await fetch(editing ? `/api/autres-acteurs/${encodeURIComponent(acteur!.idAutreActeur)}` : "/api/autres-acteurs", { method: editing ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(parsed.data) })
      const result = await response.json()
      if (!response.ok) throw new Error(result.message || "Enregistrement impossible.")
      onSaved(result.acteur); toast.success(result.message); setOpen(false)
      if (!editing) setForm(initial())
    } catch (cause) { const message = cause instanceof Error ? cause.message : "Enregistrement impossible."; setError(message); toast.error(message) } finally { setPending(false) }
  }

  const dateField = (key: "dateNaissance" | "dateDelivrancePasseport" | "dateExpirationPasseport", label: string) => <div className="space-y-2"><Label htmlFor={`autre-${key}`}>{label}</Label><CompactDateInput id={`autre-${key}`} optional value={form[key]} onValueChange={(value) => set(key, value)} aria-invalid={Boolean(errors[key])} />{fieldError(key)}</div>
  return <Sheet open={open} onOpenChange={(next) => { if (!pending) { if (next) { setForm(initial()); setErrors({}); setError("") } setOpen(next) } }}>
    <SheetTrigger asChild><Button className={editing ? undefined : "bg-brand-gold text-[#071827] hover:bg-brand-gold/90"} variant={editing ? "outline" : "default"}>{editing ? <><Pencil className="mr-2 size-4" />Modifier</> : "Ajouter un autre acteur"}</Button></SheetTrigger>
    <SheetContent className="w-full overflow-y-auto sm:max-w-2xl"><SheetHeader><SheetTitle>{editing ? "Modifier l’autre acteur" : "Ajouter un autre acteur"}</SheetTitle><SheetDescription>L’identifiant est généré automatiquement et reste immuable.</SheetDescription></SheetHeader>
      <form onSubmit={submit} className="space-y-6 px-4 pb-8"><div className="grid gap-4 md:grid-cols-2">
        {editing && <div className="space-y-2"><Label>Identifiant</Label><Input disabled value={acteur!.idAutreActeur} /></div>}
        <div className="space-y-2"><Label htmlFor="autre-nom">Nom complet *</Label><Input id="autre-nom" required value={form.nomComplet} onChange={(event) => set("nomComplet", event.target.value)} aria-invalid={Boolean(errors.nomComplet)} />{fieldError("nomComplet")}</div>
        <div className="space-y-2"><Label>Sexe *</Label><Select required value={form.idSexe} onValueChange={(value) => set("idSexe", value)}><SelectTrigger aria-invalid={Boolean(errors.idSexe)}><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{sexes.map((item) => <SelectItem key={item.id} value={item.id}>{item.nom}</SelectItem>)}</SelectContent></Select>{fieldError("idSexe")}</div>
        <div className="space-y-2"><Label>Type d’autre acteur *</Label><Select required value={form.idTypeAutreActeur} onValueChange={(value) => set("idTypeAutreActeur", value)}><SelectTrigger aria-invalid={Boolean(errors.idTypeAutreActeur)}><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{selectableTypes.map((item) => <SelectItem key={item.id} value={item.id}>{item.nom}</SelectItem>)}</SelectContent></Select>{fieldError("idTypeAutreActeur")}</div>
        {dateField("dateNaissance", "Date de naissance")}
        {([['lieuNaissance','Lieu de naissance'],['nationalite','Nationalité'],['telephone','Téléphone'],['email','Adresse e-mail'],['adresse','Adresse'],['numeroPasseport','Numéro de passeport']] as const).map(([key, label]) => <div key={key} className="space-y-2"><Label htmlFor={`autre-${key}`}>{label}</Label><Input id={`autre-${key}`} type={key === "email" ? "email" : key === "telephone" ? "tel" : "text"} value={form[key]} onChange={(event) => set(key, event.target.value)} aria-invalid={Boolean(errors[key])} />{fieldError(key)}</div>)}
        {dateField("dateDelivrancePasseport", "Date de délivrance du passeport")}{dateField("dateExpirationPasseport", "Date d’expiration du passeport")}
        <div className="space-y-2"><Label>Statut</Label><Select value={form.statut} onValueChange={(value) => set("statut", value)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="ACTIF">Actif</SelectItem><SelectItem value="INACTIF">Inactif</SelectItem></SelectContent></Select></div>
        <div className="space-y-2 md:col-span-2"><Label htmlFor="autre-observations">Observations{form.idTypeAutreActeur === "TAU099" ? " *" : ""}</Label><Textarea id="autre-observations" value={form.observations} onChange={(event) => set("observations", event.target.value)} aria-invalid={Boolean(errors.observations)} />{fieldError("observations")}</div>
      </div>{error && <p className="text-sm text-destructive" role="alert">{error}</p>}<SheetFooter><Button type="button" variant="outline" disabled={pending} onClick={() => setOpen(false)}>Annuler</Button><Button disabled={pending} className="bg-brand-gold text-[#071827] hover:bg-brand-gold/90">{pending ? "Enregistrementâ€¦" : "Enregistrer"}</Button></SheetFooter></form>
    </SheetContent>
  </Sheet>
}
