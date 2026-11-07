"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2, Pencil } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Textarea } from "@/components/ui/textarea"
import { formatCompactDateInput, formatDateForDisplay } from "@/lib/compact-date"
import type { CompetitionView, Option } from "@/lib/competitions-v2"

type FormValues = {
  numero_edition: string; nom_competition: string; id_type_competition: string; id_discipline: string
  id_saison: string; date_debut: string; date_fin: string; pays: string; lieu: string; statut: string; observations: string
}

export function CompetitionEditSheet({ competition, references }: { competition: CompetitionView; references: Record<string, Option[]> }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [pending, setPending] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const initial = (): FormValues => ({
    numero_edition: competition.edition, nom_competition: competition.nom, id_type_competition: competition.typeId,
    id_discipline: competition.disciplineId, id_saison: competition.saisonId,
    date_debut: formatDateForDisplay(competition.dateDebut), date_fin: formatDateForDisplay(competition.dateFin),
    pays: competition.pays, lieu: competition.lieu, statut: competition.statut, observations: competition.observations,
  })
  const [form, setForm] = useState<FormValues>(initial)
  const set = (key: keyof FormValues, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const start = () => { setForm(initial()); setErrors({}); setOpen(true) }

  async function submit(event: FormEvent) {
    event.preventDefault(); setPending(true); setErrors({})
    try {
      const response = await fetch(`/api/competitions/${encodeURIComponent(competition.id)}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(form) })
      const payload = await response.json()
      if (!response.ok) { setErrors(payload.fields ?? { _form: payload.error ?? "Modification impossible." }); throw new Error(payload.error ?? "Modification impossible.") }
      toast.success("Compétition modifiée"); setOpen(false); router.refresh()
    } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Modification impossible.") } finally { setPending(false) }
  }

  return <><Button variant="outline" onClick={start}><Pencil className="size-4" />Modifier</Button><Sheet open={open} onOpenChange={(next) => { if (!pending) setOpen(next) }}><SheetContent className="w-full overflow-y-auto sm:max-w-2xl">
    <SheetHeader><SheetTitle>Modifier la compétition</SheetTitle><SheetDescription>L’identifiant {competition.id} est conservé et ne peut pas être modifié.</SheetDescription></SheetHeader>
    <form id="competition-edit" onSubmit={submit} className="grid gap-4 px-4 pb-6 sm:grid-cols-2">
      <Field label="Identifiant"><Input value={competition.id} disabled /></Field>
      <Field label="Numéro d’édition" error={errors.numero_edition}><Input value={form.numero_edition} onChange={(event) => set("numero_edition", event.target.value)} /></Field>
      <Field label="Nom" error={errors.nom_competition} wide><Input value={form.nom_competition} onChange={(event) => set("nom_competition", event.target.value)} /></Field>
      <Choice label="Type" value={form.id_type_competition} options={references.TYPES_COMPETITIONS ?? []} onChange={(value) => set("id_type_competition", value)} error={errors.id_type_competition} />
      <Choice label="Discipline" value={form.id_discipline} options={references.DISCIPLINES ?? []} onChange={(value) => set("id_discipline", value)} error={errors.id_discipline} />
      <Choice label="Saison" value={form.id_saison} options={references.SAISON ?? []} onChange={(value) => set("id_saison", value)} error={errors.id_saison} />
      <Choice label="Statut" value={form.statut} options={["PLANIFIEE", "EN_COURS", "ANNULEE"].map((id) => ({ id, label: id.replaceAll("_", " ") }))} onChange={(value) => set("statut", value)} error={errors.statut} />
      <DateField label="Date de début" value={form.date_debut} onChange={(value) => set("date_debut", value)} error={errors.date_debut} />
      <DateField label="Date de fin" value={form.date_fin} onChange={(value) => set("date_fin", value)} error={errors.date_fin} />
      <Field label="Pays" error={errors.pays}><Input value={form.pays} onChange={(event) => set("pays", event.target.value)} /></Field>
      <Field label="Lieu" error={errors.lieu}><Input value={form.lieu} onChange={(event) => set("lieu", event.target.value)} /></Field>
      <Field label="Observations" error={errors.observations} wide><Textarea value={form.observations} onChange={(event) => set("observations", event.target.value)} /></Field>
      {errors._form ? <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive sm:col-span-2">{errors._form}</p> : null}
    </form>
    <SheetFooter className="flex-row justify-end"><Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={pending}>Annuler</Button><Button form="competition-edit" disabled={pending} className="bg-brand-gold text-slate-950 hover:bg-brand-gold/90">{pending ? <><Loader2 className="size-4 animate-spin" />Modificationâ€¦</> : "Enregistrer"}</Button></SheetFooter>
  </SheetContent></Sheet></>
}

function Field({ label, error, wide, children }: { label: string; error?: string; wide?: boolean; children: React.ReactNode }) { return <div className={wide ? "space-y-2 sm:col-span-2" : "space-y-2"}><Label>{label}</Label>{children}{error ? <p className="text-xs text-destructive">{error}</p> : null}</div> }
function Choice({ label, value, options, onChange, error }: { label: string; value: string; options: Option[]; onChange: (value: string) => void; error?: string }) { return <Field label={label} error={error}><Select value={value} onValueChange={onChange}><SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{options.map((option) => <SelectItem key={option.id} value={option.id}>{option.label}</SelectItem>)}</SelectContent></Select></Field> }
function DateField({ label, value, onChange, error }: { label: string; value: string; onChange: (value: string) => void; error?: string }) { return <Field label={label} error={error}><Input inputMode="numeric" maxLength={10} placeholder="JJMMAAAA" pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}" value={value} onChange={(event) => onChange(formatCompactDateInput(event.target.value))} /></Field> }
