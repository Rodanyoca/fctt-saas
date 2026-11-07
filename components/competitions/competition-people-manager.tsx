"use client"

import { FormEvent, useState } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import type { CompetitionPersonOption } from "@/lib/competition-people"
import type { SheetRow } from "@/lib/google-sheets"

const clean = (value: unknown) => String(value ?? "").trim()
export function CompetitionPeopleManager({ competitionId, closed, options, units }: { competitionId: string; closed: boolean; options: CompetitionPersonOption[]; units: SheetRow[] }) {
  const router = useRouter(), [open, setOpen] = useState(false), [pending, setPending] = useState(false), [form, setForm] = useState<Record<string, string>>({}), [errors, setErrors] = useState<Record<string, string>>({})
  const set = (key: string, value: string) => setForm((current) => ({ ...current, [key]: value, ...(key === "id_type_acteur" ? { id_acteur: "" } : {}) }))
  const types = [...new Map(options.map((item) => [item.typeId, { id: item.typeId, label: item.typeLabel }])).values()]
  const actors = options.filter((item) => item.typeId === form.id_type_acteur), selected = actors.find((item) => item.id === form.id_acteur)
  async function submit(event: FormEvent) { event.preventDefault(); setPending(true); setErrors({}); try { const response = await fetch(`/api/competitions/${encodeURIComponent(competitionId)}/people`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(form) }); const payload = await response.json(); if (!response.ok) { setErrors(payload.fields ?? {}); throw new Error(payload.error ?? "Inscription impossible.") } toast.success(`Intervenant inscrit · licence ${payload.licenceStatus}`); setOpen(false); setForm({}); router.refresh() } catch (reason) { toast.error(reason instanceof Error ? reason.message : "Inscription impossible.") } finally { setPending(false) } }
  if (closed) return null
  return <><div className="flex justify-end"><Button onClick={() => setOpen(true)} className="bg-brand-gold text-slate-950 hover:bg-brand-gold/90"><Plus className="size-4" />Ajouter un intervenant</Button></div><Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Ajouter un intervenant</DialogTitle><DialogDescription>La licence est contrôlée à titre informatif et ne bloque pas l’inscription.</DialogDescription></DialogHeader><form id="person-form" onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
    <Choice label="Type d’acteur" value={form.id_type_acteur} options={types} onChange={(value) => set("id_type_acteur", value)} error={errors.id_type_acteur} /><Choice label="Personne" value={form.id_acteur} options={actors.map((item) => ({ id: item.id, label: item.label }))} onChange={(value) => set("id_acteur", value)} error={errors.id_acteur} />
    {selected ? <div className="rounded-lg border p-3 text-sm sm:col-span-2"><p className="font-medium">Licence : {selected.licenceNumber}</p><Badge className="mt-2" variant="outline">{selected.licenceStatus}</Badge></div> : null}
    <Choice label="Unité (facultatif)" value={form.id_unite_competition} options={units.map((row) => ({ id: clean(row.id_unite_competition), label: clean(row.id_club) || clean(row.id_equipe_nationale_saison) || clean(row.id_unite_competition) }))} onChange={(value) => set("id_unite_competition", value)} error={errors.id_unite_competition} /><Field label="Rôle" error={errors.role_participant}><Input value={form.role_participant ?? ""} onChange={(e) => set("role_participant", e.target.value)} /></Field><Field label="Observations" error={errors.observations} wide><Textarea value={form.observations ?? ""} onChange={(e) => set("observations", e.target.value)} /></Field>
  </form><DialogFooter><Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button><Button form="person-form" disabled={pending} className="bg-brand-gold text-slate-950 hover:bg-brand-gold/90">{pending ? "Inscription..." : "Inscrire"}</Button></DialogFooter></DialogContent></Dialog></>
}
function Field({ label, error, wide, children }: { label: string; error?: string; wide?: boolean; children: React.ReactNode }) { return <div className={wide ? "space-y-2 sm:col-span-2" : "space-y-2"}><Label>{label}</Label>{children}{error ? <p className="text-xs text-destructive">{error}</p> : null}</div> }
function Choice({ label, value, options, onChange, error }: { label: string; value?: string; options: Array<{ id: string; label: string }>; onChange: (value: string) => void; error?: string }) { return <Field label={label} error={error}><Select value={value ?? ""} onValueChange={onChange}><SelectTrigger className="w-full"><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{options.map((item) => <SelectItem key={item.id} value={item.id}>{item.label}</SelectItem>)}</SelectContent></Select></Field> }
