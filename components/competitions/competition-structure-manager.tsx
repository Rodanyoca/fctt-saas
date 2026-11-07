"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { Option } from "@/lib/competitions-v2"
import type { SheetRow } from "@/lib/google-sheets"

type Kind = "event" | "phase" | "group"
const clean = (value: unknown) => String(value ?? "").trim()

export function CompetitionStructureManager({ competitionId, closed, references, events, phases }: { competitionId: string; closed: boolean; references: Record<string, Option[]>; events: SheetRow[]; phases: SheetRow[] }) {
  const router = useRouter(), [kind, setKind] = useState<Kind | null>(null), [pending, setPending] = useState(false), [errors, setErrors] = useState<Record<string, string>>({})
  const [form, setForm] = useState<Record<string, string>>({})
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value }))
  const reset = (next: Kind | null) => { setKind(next); setForm({}); setErrors({}) }
  async function submit(event: FormEvent) {
    event.preventDefault(); if (!kind) return; setPending(true); setErrors({})
    const url = kind === "event" ? `/api/competitions/${encodeURIComponent(competitionId)}/epreuves` : `/api/competitions/${encodeURIComponent(competitionId)}/structure`
    try {
      const response = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...form, kind }) })
      const payload = await response.json(); if (!response.ok) { setErrors(payload.fields ?? {}); throw new Error(payload.error ?? "Enregistrement impossible.") }
      toast.success(kind === "event" ? "Épreuve créée" : kind === "phase" ? "Phase créée" : "Groupe créé"); reset(null); router.refresh()
    } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Enregistrement impossible.") } finally { setPending(false) }
  }
  if (closed) return <p className="rounded-lg border border-dashed p-3 text-sm text-muted-foreground">Cette édition est clôturée : les données restent consultables en lecture seule.</p>
  const groupPhases = phases.filter((row) => clean(row.id_mode_phase) === "MPH001" && clean(row.statut) === "ACTIF")
  return <>
    <div className="flex flex-wrap justify-end gap-2"><Button variant="outline" onClick={() => reset("group")} disabled={!groupPhases.length}><Plus className="size-4" />Groupe</Button><Button variant="outline" onClick={() => reset("phase")} disabled={!events.length}><Plus className="size-4" />Phase</Button><Button onClick={() => reset("event")} className="bg-brand-gold text-slate-950 hover:bg-brand-gold/90"><Plus className="size-4" />Épreuve</Button></div>
    <Dialog open={kind !== null} onOpenChange={(open) => !open && reset(null)}><DialogContent><DialogHeader><DialogTitle>{kind === "event" ? "Créer une épreuve" : kind === "phase" ? "Créer une phase" : "Créer un groupe"}</DialogTitle><DialogDescription>Les valeurs proposées proviennent du référentiel FEACO.</DialogDescription></DialogHeader>
      <form id="structure-form" className="grid gap-4 sm:grid-cols-2" onSubmit={submit}>
        {kind === "event" ? <><Field label="Nom" error={errors.nom_epreuve} wide><Input value={form.nom_epreuve ?? ""} onChange={(e) => set("nom_epreuve", e.target.value)} /></Field><Choice label="Discipline" value={form.id_discipline} options={references.DISCIPLINES ?? []} onChange={(v) => set("id_discipline", v)} error={errors.id_discipline} /><Choice label="Catégorie" value={form.id_categorie_age} options={references.CATEGORIES_AGE ?? []} onChange={(v) => set("id_categorie_age", v)} error={errors.id_categorie_age} /><Choice label="Sexe" value={form.id_sexe} options={references.SEXES ?? []} onChange={(v) => set("id_sexe", v)} error={errors.id_sexe} /></> : null}
        {kind === "phase" ? <><Choice label="Épreuve" value={form.id_epreuve_competition} options={events.map((row) => ({ id: clean(row.id_epreuve_competition), label: clean(row.nom_epreuve) }))} onChange={(v) => set("id_epreuve_competition", v)} error={errors.id_epreuve_competition} /><Choice label="Type" value={form.id_type_phase} options={references.TYPES_PHASES ?? []} onChange={(v) => set("id_type_phase", v)} error={errors.id_type_phase} /><Choice label="Mode" value={form.id_mode_phase} options={references.MODES_PHASES ?? []} onChange={(v) => set("id_mode_phase", v)} error={errors.id_mode_phase} /><Field label="Numéro" error={errors.numero_phase}><Input inputMode="numeric" value={form.numero_phase ?? ""} onChange={(e) => set("numero_phase", e.target.value.replace(/\D/g, ""))} /></Field><Field label="Nom" error={errors.nom_phase} wide><Input value={form.nom_phase ?? ""} onChange={(e) => set("nom_phase", e.target.value)} /></Field></> : null}
        {kind === "group" ? <><Choice label="Phase de groupes" value={form.id_phase_competition} options={groupPhases.map((row) => ({ id: clean(row.id_phase_competition), label: clean(row.nom_phase) }))} onChange={(v) => set("id_phase_competition", v)} error={errors.id_phase_competition} /><Field label="Nom" error={errors.nom_groupe}><Input value={form.nom_groupe ?? ""} onChange={(e) => set("nom_groupe", e.target.value)} /></Field></> : null}
        <Field label="Observations" error={errors.observations} wide><Textarea value={form.observations ?? ""} onChange={(e) => set("observations", e.target.value)} /></Field>
      </form><DialogFooter><Button variant="outline" onClick={() => reset(null)}>Annuler</Button><Button form="structure-form" disabled={pending} className="bg-brand-gold text-slate-950 hover:bg-brand-gold/90">{pending ? "Enregistrement..." : "Créer"}</Button></DialogFooter>
    </DialogContent></Dialog>
  </>
}

function Field({ label, error, wide, children }: { label: string; error?: string; wide?: boolean; children: React.ReactNode }) { return <div className={wide ? "space-y-2 sm:col-span-2" : "space-y-2"}><Label>{label}</Label>{children}{error ? <p className="text-xs text-destructive">{error}</p> : null}</div> }
function Choice({ label, value, options, onChange, error }: { label: string; value?: string; options: Option[]; onChange: (value: string) => void; error?: string }) { return <Field label={label} error={error}><Select value={value ?? ""} onValueChange={onChange}><SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{options.map((item) => <SelectItem key={item.id} value={item.id}>{item.label || item.id}</SelectItem>)}</SelectContent></Select></Field> }
