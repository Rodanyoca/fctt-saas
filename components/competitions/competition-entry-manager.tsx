"use client"

import { FormEvent, useMemo, useState } from "react"
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

type EntryOptions = { clubs: Array<{ id: string; label: string }>; athletes: Array<{ id: string; label: string; clubId: string; sexId: string }> }
const clean = (value: unknown) => String(value ?? "").trim()
export function CompetitionEntryManager({ competitionId, closed, events, phases, groups, options }: { competitionId: string; closed: boolean; events: SheetRow[]; phases: SheetRow[]; groups: SheetRow[]; options: EntryOptions }) {
  const router = useRouter(), [open, setOpen] = useState(false), [pending, setPending] = useState(false), [form, setForm] = useState<Record<string, string>>({}), [errors, setErrors] = useState<Record<string, string>>({})
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value, ...(key === "id_epreuve_competition" ? { id_phase_competition: "", id_groupe: "" } : {}), ...(key === "id_phase_competition" ? { id_groupe: "" } : {}) }))
  const event = events.find((row) => clean(row.id_epreuve_competition) === form.id_epreuve_competition), beach = clean(event?.id_discipline) === "DISC009"
  const availablePhases = phases.filter((row) => clean(row.id_epreuve_competition) === form.id_epreuve_competition && clean(row.statut) === "ACTIF")
  const phase = availablePhases.find((row) => clean(row.id_phase_competition) === form.id_phase_competition), needsGroup = clean(phase?.id_mode_phase) === "MPH001"
  const availableGroups = groups.filter((row) => clean(row.id_phase_competition) === form.id_phase_competition && clean(row.statut) === "ACTIF")
  const athleteOptions = useMemo(() => options.athletes.filter((item) => (!form.id_club || item.clubId === form.id_club) && (!event || clean(event.id_sexe) === "SEX003" || !item.sexId || item.sexId === clean(event.id_sexe))), [event, form.id_club, options.athletes])
  async function submit(e: FormEvent) { e.preventDefault(); setPending(true); setErrors({}); try { const response = await fetch(`/api/competitions/${encodeURIComponent(competitionId)}/participants`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) }); const payload = await response.json(); if (!response.ok) { setErrors(payload.fields ?? {}); throw new Error(payload.error ?? "Engagement impossible.") } toast.success(beach ? "Paire engagée" : "Club engagé"); setOpen(false); setForm({}); router.refresh() } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Engagement impossible.") } finally { setPending(false) } }
  if (closed) return null
  return <><div className="flex justify-end"><Button onClick={() => setOpen(true)} disabled={!events.length || !phases.length} className="bg-brand-gold text-slate-950 hover:bg-brand-gold/90"><Plus className="size-4" />Engager une unité</Button></div><Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Engager une unité</DialogTitle><DialogDescription>Club pour l’indoor, paire de deux athlètes pour le beach-volley.</DialogDescription></DialogHeader><form id="entry-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
    <Choice label="Épreuve" value={form.id_epreuve_competition} options={events.map((row) => ({ id: clean(row.id_epreuve_competition), label: clean(row.nom_epreuve) }))} onChange={(v) => set("id_epreuve_competition", v)} error={errors.id_epreuve_competition} /><Choice label="Phase initiale" value={form.id_phase_competition} options={availablePhases.map((row) => ({ id: clean(row.id_phase_competition), label: clean(row.nom_phase) }))} onChange={(v) => set("id_phase_competition", v)} error={errors.id_phase_competition} />
    {needsGroup ? <Choice label="Groupe" value={form.id_groupe} options={availableGroups.map((row) => ({ id: clean(row.id_groupe), label: clean(row.nom_groupe) }))} onChange={(v) => set("id_groupe", v)} error={errors.id_groupe} /> : null}<Choice label="Club représenté" value={form.id_club} options={options.clubs} onChange={(v) => set("id_club", v)} error={errors.id_club} optional={beach} />
    {beach ? <><Choice label="Athlète 1" value={form.id_athlete_a} options={athleteOptions} onChange={(v) => set("id_athlete_a", v)} error={errors.id_athlete_a} /><Choice label="Athlète 2" value={form.id_athlete_b} options={athleteOptions.filter((item) => item.id !== form.id_athlete_a)} onChange={(v) => set("id_athlete_b", v)} error={errors.id_athlete_b} /></> : null}
    <Field label="Date d’inscription" error={errors.date_inscription}><Input inputMode="numeric" maxLength={10} placeholder="JJMMAAAA" pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}" value={form.date_inscription ?? ""} onChange={(e) => set("date_inscription", formatCompactDateInput(e.target.value))} /></Field><Field label="Observations" error={errors.observations} wide><Textarea value={form.observations ?? ""} onChange={(e) => set("observations", e.target.value)} /></Field>
  </form><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button form="entry-form" disabled={pending} className="bg-brand-gold text-slate-950 hover:bg-brand-gold/90">{pending ? "Engagement..." : "Engager"}</Button></DialogFooter></DialogContent></Dialog></>
}
function Field({ label, error, wide, children }: { label: string; error?: string; wide?: boolean; children: React.ReactNode }) { return <div className={wide ? "space-y-2 sm:col-span-2" : "space-y-2"}><Label>{label}</Label>{children}{error ? <p className="text-xs text-destructive">{error}</p> : null}</div> }
function Choice({ label, value, options, onChange, error, optional }: { label: string; value?: string; options: Array<{ id: string; label: string }>; onChange: (value: string) => void; error?: string; optional?: boolean }) { return <Field label={`${label}${optional ? " (facultatif)" : ""}`} error={error}><Select value={value ?? ""} onValueChange={onChange}><SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{options.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select></Field> }
