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
import type { Option } from "@/lib/competitions-v2"
import type { SheetRow } from "@/lib/google-sheets"

const clean = (value: unknown) => String(value ?? "").trim()
export function CompetitionResultManager({ competitionId, closed, matches, results, phases, events, units, statuses }: { competitionId: string; closed: boolean; matches: SheetRow[]; results: SheetRow[]; phases: SheetRow[]; events: SheetRow[]; units: SheetRow[]; statuses: Option[] }) {
  const router = useRouter(), [open, setOpen] = useState(false), [pending, setPending] = useState(false), [form, setForm] = useState<Record<string, string>>({ id_statut_resultat: "STR001" })
  const completed = useMemo(() => new Set(results.map((row) => clean(row.id_match))), [results]), available = matches.filter((row) => !completed.has(clean(row.id_match)))
  const match = available.find((row) => clean(row.id_match) === form.id_match), phase = phases.find((row) => clean(row.id_phase_competition) === clean(match?.id_phase_competition)), event = events.find((row) => clean(row.id_epreuve_competition) === clean(phase?.id_epreuve_competition)), beach = clean(event?.id_discipline) === "DISC009", normal = form.id_statut_resultat === "STR001", maximum = beach ? 3 : 5
  const unitLabel = (id: string) => { const unit = units.find((row) => clean(row.id_unite_competition) === id); return clean(unit?.id_club) || clean(unit?.id_equipe_nationale_saison) || id || "—" }
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value, ...(key === "id_match" ? Object.fromEntries(Array.from({ length: 5 }, (_, i) => [[`set_${i + 1}_a`, ""], [`set_${i + 1}_b`, ""]]).flat()) : {}) }))
  const score = Array.from({ length: maximum }, (_, index) => { const a = form[`set_${index + 1}_a`], b = form[`set_${index + 1}_b`]; return a !== undefined && a !== "" && b !== undefined && b !== "" ? `${a}–${b}` : "" }).filter(Boolean).join(", ")
  async function submit(eventSubmit: FormEvent) { eventSubmit.preventDefault(); setPending(true); try { const response = await fetch(`/api/competitions/${encodeURIComponent(competitionId)}/results`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) }); const payload = await response.json(); if (!response.ok) throw new Error(payload.error ?? "Enregistrement impossible."); toast.success("Résultat enregistré"); setOpen(false); setForm({ id_statut_resultat: "STR001" }); router.refresh() } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Enregistrement impossible.") } finally { setPending(false) } }
  if (closed) return null
  return <><div className="flex justify-end"><Button onClick={() => setOpen(true)} disabled={!available.length} className="bg-brand-gold text-slate-950 hover:bg-brand-gold/90"><Plus className="size-4" />Saisir un résultat</Button></div><Dialog open={open} onOpenChange={setOpen}><DialogContent className="sm:max-w-2xl"><DialogHeader><DialogTitle>Saisir un résultat</DialogTitle><DialogDescription>Le nombre de sets et les scores réglementaires sont contrôlés selon la discipline.</DialogDescription></DialogHeader><form id="result-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
    <Choice label="Match" value={form.id_match} options={available.map((row) => ({ id: clean(row.id_match), label: `${unitLabel(clean(row.id_unite_a))} — ${unitLabel(clean(row.id_unite_b))}` }))} onChange={(value) => set("id_match", value)} /><Choice label="Statut" value={form.id_statut_resultat} options={statuses} onChange={(value) => set("id_statut_resultat", value)} />
    {match ? <div className="rounded-lg border bg-muted/30 p-3 text-sm sm:col-span-2"><p className="font-semibold">{unitLabel(clean(match.id_unite_a))} contre {unitLabel(clean(match.id_unite_b))}</p><p className="text-muted-foreground">{beach ? "Beach-volley · meilleur des 3 sets" : "Indoor · meilleur des 5 sets"}</p></div> : null}
    {normal && match ? Array.from({ length: maximum }, (_, index) => <div key={index} className="grid grid-cols-[auto_1fr_auto_1fr] items-end gap-2 sm:col-span-2"><span className="pb-2 text-sm font-medium">Set {index + 1}</span><ScoreInput value={form[`set_${index + 1}_a`] ?? ""} onChange={(value) => set(`set_${index + 1}_a`, value)} label={unitLabel(clean(match.id_unite_a))} /><span className="pb-2">–</span><ScoreInput value={form[`set_${index + 1}_b`] ?? ""} onChange={(value) => set(`set_${index + 1}_b`, value)} label={unitLabel(clean(match.id_unite_b))} /></div>) : null}
    {!normal && match && form.id_statut_resultat !== "STR005" ? <Choice label="Vainqueur officiel (facultatif)" value={form.id_unite_vainqueur} options={[{ id: clean(match.id_unite_a), label: unitLabel(clean(match.id_unite_a)) }, { id: clean(match.id_unite_b), label: unitLabel(clean(match.id_unite_b)) }]} onChange={(value) => set("id_unite_vainqueur", value)} /> : null}
    {score ? <div className="rounded-lg border border-brand-gold/30 bg-brand-gold/5 p-3 text-sm sm:col-span-2"><span className="text-muted-foreground">Récapitulatif : </span>{score}</div> : null}<Field label="Observations" wide><Textarea value={form.observations ?? ""} onChange={(e) => set("observations", e.target.value)} /></Field>
  </form><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button form="result-form" disabled={pending || !match} className="bg-brand-gold text-slate-950 hover:bg-brand-gold/90">{pending ? "Validation..." : "Valider le résultat"}</Button></DialogFooter></DialogContent></Dialog></>
}
function Field({ label, wide, children }: { label: string; wide?: boolean; children: React.ReactNode }) { return <div className={wide ? "space-y-2 sm:col-span-2" : "space-y-2"}><Label>{label}</Label>{children}</div> }
function Choice({ label, value, options, onChange }: { label: string; value?: string; options: Option[]; onChange: (value: string) => void }) { return <Field label={label}><Select value={value ?? ""} onValueChange={onChange}><SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{options.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select></Field> }
function ScoreInput({ value, onChange, label }: { value: string; onChange: (value: string) => void; label: string }) { return <div className="space-y-1"><Label className="line-clamp-1 text-xs text-muted-foreground">{label}</Label><Input inputMode="numeric" min="0" value={value} onChange={(event) => onChange(event.target.value.replace(/\D/g, "").slice(0, 3))} /></div> }
