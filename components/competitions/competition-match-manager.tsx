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
import { formatCompactDateInput } from "@/lib/compact-date"
import type { SheetRow } from "@/lib/google-sheets"

const clean = (value: unknown) => String(value ?? "").trim()
export function CompetitionMatchManager({ competitionId, closed, phases, groups, units, phaseUnits }: { competitionId: string; closed: boolean; phases: SheetRow[]; groups: SheetRow[]; units: SheetRow[]; phaseUnits: SheetRow[] }) {
  const router = useRouter(), [open, setOpen] = useState(false), [pending, setPending] = useState(false), [form, setForm] = useState<Record<string, string>>({}), [errors, setErrors] = useState<Record<string, string>>({})
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value, ...(key === "id_phase_competition" ? { id_groupe: "", id_unite_a: "", id_unite_b: "" } : {}), ...(key === "id_groupe" ? { id_unite_a: "", id_unite_b: "" } : {}) }))
  const phase = phases.find((row) => clean(row.id_phase_competition) === form.id_phase_competition), groupMode = clean(phase?.id_mode_phase) === "MPH001"
  const availableGroups = groups.filter((row) => clean(row.id_phase_competition) === form.id_phase_competition && clean(row.statut) === "ACTIF")
  const assignments = phaseUnits.filter((row) => clean(row.id_phase_competition) === form.id_phase_competition && clean(row.statut) === "ACTIF" && (!groupMode || clean(row.id_groupe) === form.id_groupe))
  const choices = assignments.map((assignment) => units.find((unit) => clean(unit.id_unite_competition) === clean(assignment.id_unite_competition))).filter(Boolean).map((unit) => ({ id: clean(unit!.id_unite_competition), label: clean(unit!.id_club) || clean(unit!.id_equipe_nationale_saison) || clean(unit!.id_unite_competition) }))
  async function submit(e: FormEvent) { e.preventDefault(); setPending(true); setErrors({}); try { const response = await fetch(`/api/competitions/${encodeURIComponent(competitionId)}/play`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) }); const payload = await response.json(); if (!response.ok) { setErrors(payload.fields ?? {}); throw new Error(payload.error ?? "Programmation impossible.") } toast.success("Match programmé"); setOpen(false); setForm({}); router.refresh() } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Programmation impossible.") } finally { setPending(false) } }
  if (closed) return null
  return <><div className="flex justify-end"><Button onClick={() => setOpen(true)} className="bg-brand-gold text-slate-950 hover:bg-brand-gold/90"><Plus className="size-4" />Programmer un match</Button></div><Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Programmer un match</DialogTitle><DialogDescription>Seules les unités affectées à la phase sont proposées.</DialogDescription></DialogHeader><form id="match-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
    <Choice label="Phase" value={form.id_phase_competition} options={phases.filter((row) => clean(row.statut) === "ACTIF").map((row) => ({ id: clean(row.id_phase_competition), label: clean(row.nom_phase) }))} onChange={(v) => set("id_phase_competition", v)} error={errors.id_phase_competition} />{groupMode ? <Choice label="Groupe" value={form.id_groupe} options={availableGroups.map((row) => ({ id: clean(row.id_groupe), label: clean(row.nom_groupe) }))} onChange={(v) => set("id_groupe", v)} error={errors.id_groupe} /> : null}
    <Choice label="Unité A" value={form.id_unite_a} options={choices} onChange={(v) => set("id_unite_a", v)} error={errors.id_unite_a} /><Choice label="Unité B" value={form.id_unite_b} options={choices.filter((item) => item.id !== form.id_unite_a)} onChange={(v) => set("id_unite_b", v)} error={errors.id_unite_b} />
    <Field label="Date" error={errors.date_match}><Input inputMode="numeric" maxLength={10} placeholder="JJMMAAAA" pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}" value={form.date_match ?? ""} onChange={(e) => set("date_match", formatCompactDateInput(e.target.value))} /></Field><Field label="Heure" error={errors.heure_match}><Input type="time" value={form.heure_match ?? ""} onChange={(e) => set("heure_match", e.target.value)} /></Field><Field label="Observations" error={errors.observations} wide><Textarea value={form.observations ?? ""} onChange={(e) => set("observations", e.target.value)} /></Field>
  </form><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button form="match-form" disabled={pending || choices.length < 2} className="bg-brand-gold text-slate-950 hover:bg-brand-gold/90">{pending ? "Programmation..." : "Programmer"}</Button></DialogFooter></DialogContent></Dialog></>
}
function Field({ label, error, wide, children }: { label: string; error?: string; wide?: boolean; children: React.ReactNode }) { return <div className={wide ? "space-y-2 sm:col-span-2" : "space-y-2"}><Label>{label}</Label>{children}{error ? <p className="text-xs text-destructive">{error}</p> : null}</div> }
function Choice({ label, value, options, onChange, error }: { label: string; value?: string; options: Array<{ id: string; label: string }>; onChange: (value: string) => void; error?: string }) { return <Field label={label} error={error}><Select value={value ?? ""} onValueChange={onChange}><SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{options.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select></Field> }
