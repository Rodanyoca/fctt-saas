"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { formatCompactDateInput } from "@/lib/compact-date"
import type { Option } from "@/lib/competitions-v2"

const empty = { numero_edition: "", nom_competition: "", id_type_competition: "", id_discipline: "", id_saison: "", date_debut: "", date_fin: "", pays: "", lieu: "", statut: "PLANIFIEE", observations: "" }

export function CompetitionForm({ open, onOpenChange, references }: { open: boolean; onOpenChange: (open: boolean) => void; references: Record<string, Option[]> }) {
  const router = useRouter()
  const [form, setForm] = useState(empty)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [pending, setPending] = useState(false)
  const set = (key: keyof typeof empty, value: string) => setForm((current) => ({ ...current, [key]: value }))
  async function submit(event: FormEvent) {
    event.preventDefault(); setPending(true); setErrors({})
    try {
      const response = await fetch("/api/competitions", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) })
      const payload = await response.json()
      if (!response.ok) { setErrors(payload.fields ?? {}); throw new Error(payload.error ?? "Création impossible.") }
      toast.success("Compétition créée")
      setForm(empty); onOpenChange(false); router.refresh()
    } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Création impossible.") } finally { setPending(false) }
  }
  return <Sheet open={open} onOpenChange={(next) => { onOpenChange(next); if (!next) { setForm(empty); setErrors({}) } }}><SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
    <SheetHeader><SheetTitle>Créer une compétition</SheetTitle><SheetDescription>Les libellés proviennent du référentiel FEACO.</SheetDescription></SheetHeader>
    <form id="competition-create" onSubmit={submit} className="grid gap-4 px-4 sm:grid-cols-2">
      <Field label="Nom" error={errors.nom_competition} wide><Input value={form.nom_competition} onChange={(e) => set("nom_competition", e.target.value)} /></Field>
      <Field label="Numéro d’édition" error={errors.numero_edition}><Input value={form.numero_edition} onChange={(e) => set("numero_edition", e.target.value)} /></Field>
      <Choice label="Type" value={form.id_type_competition} options={references.TYPES_COMPETITIONS ?? []} onChange={(v) => set("id_type_competition", v)} error={errors.id_type_competition} />
      <Choice label="Discipline" value={form.id_discipline} options={references.DISCIPLINES ?? []} onChange={(v) => set("id_discipline", v)} error={errors.id_discipline} />
      <Choice label="Saison" value={form.id_saison} options={references.SAISON ?? []} onChange={(v) => set("id_saison", v)} error={errors.id_saison} />
      <DateField label="Date de début" value={form.date_debut} onChange={(v) => set("date_debut", v)} error={errors.date_debut} />
      <DateField label="Date de fin" value={form.date_fin} onChange={(v) => set("date_fin", v)} error={errors.date_fin} />
      <Field label="Pays" error={errors.pays}><Input value={form.pays} onChange={(e) => set("pays", e.target.value)} /></Field>
      <Field label="Lieu" error={errors.lieu}><Input value={form.lieu} onChange={(e) => set("lieu", e.target.value)} /></Field>
      <Choice label="Statut" value={form.statut} options={["PLANIFIEE", "EN_COURS", "TERMINEE", "ANNULEE"].map((id) => ({ id, label: id.replaceAll("_", " ") }))} onChange={(v) => set("statut", v)} error={errors.statut} />
      <Field label="Observations" error={errors.observations} wide><Textarea value={form.observations} onChange={(e) => set("observations", e.target.value)} /></Field>
    </form>
    <SheetFooter><Button form="competition-create" disabled={pending} className="bg-brand-gold text-slate-950 hover:bg-brand-gold/90">{pending ? "Création..." : "Créer"}</Button></SheetFooter>
  </SheetContent></Sheet>
}

function Field({ label, error, wide, children }: { label: string; error?: string; wide?: boolean; children: React.ReactNode }) { return <div className={wide ? "space-y-2 sm:col-span-2" : "space-y-2"}><Label>{label}</Label>{children}{error ? <p className="text-xs text-destructive">{error}</p> : null}</div> }
function Choice({ label, value, options, onChange, error }: { label: string; value: string; options: Option[]; onChange: (value: string) => void; error?: string }) { return <Field label={label} error={error}><Select value={value} onValueChange={onChange}><SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{options.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select></Field> }
function DateField({ label, value, onChange, error }: { label: string; value: string; onChange: (value: string) => void; error?: string }) { return <Field label={label} error={error}><Input inputMode="numeric" maxLength={10} placeholder="JJMMAAAA" pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}" value={value} onChange={(e) => onChange(formatCompactDateInput(e.target.value))} /></Field> }
