"use client"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { ArrowLeft, CalendarDays, Pencil, Plus, Trash2, Users } from "lucide-react"
import { toast } from "sonner"
import { Header } from "@/components/dashboard/header"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { formatCompactDateInput, formatDateForDisplay } from "@/lib/compact-date"
import type { ActivityEntityView, ActivityParticipantView, ActivityReferences, ActivityView } from "@/lib/activities"

type Detail = { activity: ActivityView; entities: ActivityEntityView[]; participants: ActivityParticipantView[]; references: ActivityReferences }
const statusOptions = ["PLANIFIE", "EN_COURS", "TERMINE", "REPORTE", "ANNULE"]
const entityEmpty = { id_entite: "", id_role_entite_activite: "", statut_participation: "ACTIF", observations: "" }
const participantEmpty = { id_type_acteur: "", id_acteur: "", role_participation: "", statut_participation: "ACTIF", observations: "" }
const editValues = (a: ActivityView) => ({ id_type_activite:a.typeId, id_entite_organisatrice:a.organizerId, nom_activite:a.name, titre_public:a.publicTitle, resume:a.summary, date_debut:formatDateForDisplay(a.startDate), date_fin:formatDateForDisplay(a.endDate), pays:a.country, ville:a.city, lieu:a.place, statut:a.status || "PLANIFIE", observations:a.observations })

export function ActivityDetail({ detail }: { detail: Detail }) {
  const { activity, entities, participants, references } = detail
  const router = useRouter()
  const [pending, setPending] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [entityOpen, setEntityOpen] = useState(false)
  const [participantOpen, setParticipantOpen] = useState(false)
  const [entityId, setEntityId] = useState("")
  const [participantId, setParticipantId] = useState("")
  const [form, setForm] = useState(() => editValues(activity))
  const [entityForm, setEntityForm] = useState(entityEmpty)
  const [participantForm, setParticipantForm] = useState(participantEmpty)
  const actors = references.actorsByType[participantForm.id_type_acteur] ?? []
  const set = (key: keyof typeof form, value: string) => setForm((current) => ({ ...current, [key]: value }))

  async function mutate(url: string, method: string, body: unknown, success: string) {
    setPending(true)
    try {
      const response = await fetch(url, { method, headers: { "content-type": "application/json" }, body: JSON.stringify(body) })
      const payload = await response.json()
      if (!response.ok) throw new Error(payload.error ?? "Opération impossible.")
      toast.success(success); setEditOpen(false); setEntityOpen(false); setParticipantOpen(false); router.refresh()
    } catch (error) { toast.error(error instanceof Error ? error.message : "Opération impossible.") }
    finally { setPending(false) }
  }
  function openEntity(row?: ActivityEntityView) { setEntityId(row?.id ?? ""); setEntityForm(row ? { id_entite:row.entityId, id_role_entite_activite:row.roleId, statut_participation:row.participationStatus || "ACTIF", observations:row.observations } : entityEmpty); setEntityOpen(true) }
  function openParticipant(row?: ActivityParticipantView) { setParticipantId(row?.id ?? ""); setParticipantForm(row ? { id_type_acteur:row.typeId, id_acteur:row.actorId, role_participation:row.participationRole, statut_participation:row.participationStatus || "ACTIF", observations:row.observations } : participantEmpty); setParticipantOpen(true) }

  return <>
    <Header title={activity.name || "Activité"} subtitle="Fiche détaillée de l’activité" />
    <main className="space-y-6 p-4 sm:p-6">
      <div className="flex justify-between gap-3"><Button asChild variant="ghost"><Link href="/activites"><ArrowLeft />Retour</Link></Button><Button className="bg-brand-gold text-slate-950 hover:bg-brand-gold/90" onClick={() => { setForm(editValues(activity)); setEditOpen(true) }}><Pencil />Modifier</Button></div>
      <div className="grid gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2"><CardHeader><CardTitle className="flex gap-2"><CalendarDays className="text-brand-gold" />Informations générales</CardTitle></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2">{[["Identifiant",activity.id],["Type",activity.type],["Titre public",activity.publicTitle],["Organisateur",activity.organizer],["Période",`${formatDateForDisplay(activity.startDate) || "—"} — ${formatDateForDisplay(activity.endDate) || "—"}`],["Localisation",[activity.country,activity.city,activity.place].filter(Boolean).join(" — ")]].map(([label,value]) => <div key={label}><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium">{value || "—"}</p></div>)}<div><p className="text-xs text-muted-foreground">Statut</p><StatusBadge status={activity.status} /></div></CardContent></Card>
        <Card><CardHeader><CardTitle>Résumé</CardTitle></CardHeader><CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">{activity.summary || "Aucun résumé."}</CardContent></Card>
      </div>
      <Card><CardHeader className="flex-row items-center justify-between"><CardTitle>Entités participantes</CardTitle><Button size="sm" onClick={() => openEntity()}><Plus />Ajouter une entité</Button></CardHeader><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Entité</TableHead><TableHead>Rôle</TableHead><TableHead>Statut</TableHead><TableHead>Observations</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{entities.map((row) => <TableRow key={row.id}><TableCell className="font-medium">{row.entity}</TableCell><TableCell>{row.role}</TableCell><TableCell><StatusBadge status={row.participationStatus} /></TableCell><TableCell>{row.observations || "—"}</TableCell><TableCell><Button variant="ghost" size="icon" onClick={() => openEntity(row)} aria-label="Modifier"><Pencil /></Button><Button variant="ghost" size="icon" onClick={() => { if (confirm(`Retirer ${row.entity} ?`)) void mutate(`/api/activities/${encodeURIComponent(activity.id)}/entities`, "DELETE", { id:row.id }, "Entité retirée") }} aria-label="Retirer"><Trash2 /></Button></TableCell></TableRow>)}{!entities.length && <TableRow><TableCell colSpan={5} className="h-20 text-center text-muted-foreground">Aucune entité rattachée.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
      <Card><CardHeader className="flex-row items-center justify-between"><CardTitle className="flex gap-2"><Users className="text-brand-gold" />Participants</CardTitle><Button size="sm" onClick={() => openParticipant()}><Plus />Ajouter un participant</Button></CardHeader><CardContent className="p-0"><Table><TableHeader><TableRow><TableHead>Participant</TableHead><TableHead>Type</TableHead><TableHead>Rôle</TableHead><TableHead>Statut</TableHead><TableHead>Observations</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader><TableBody>{participants.map((row) => <TableRow key={row.id}><TableCell className="font-medium">{row.actor}</TableCell><TableCell>{row.type}</TableCell><TableCell>{row.participationRole || "—"}</TableCell><TableCell><StatusBadge status={row.participationStatus} /></TableCell><TableCell>{row.observations || "—"}</TableCell><TableCell><Button variant="ghost" size="icon" onClick={() => openParticipant(row)} aria-label="Modifier"><Pencil /></Button></TableCell></TableRow>)}{!participants.length && <TableRow><TableCell colSpan={6} className="h-20 text-center text-muted-foreground">Aucun participant.</TableCell></TableRow>}</TableBody></Table></CardContent></Card>
      <Card><CardHeader><CardTitle>Observations</CardTitle></CardHeader><CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">{activity.observations || "Aucune observation."}</CardContent></Card>
    </main>
    <Sheet open={editOpen} onOpenChange={setEditOpen}><SheetContent className="w-full overflow-y-auto sm:max-w-2xl"><SheetHeader><SheetTitle>Modifier l’activité</SheetTitle><SheetDescription>L’identifiant reste immuable.</SheetDescription></SheetHeader><ActivityEditForm form={form} set={set} references={references} /><SheetFooter><Button variant="outline" onClick={() => setEditOpen(false)}>Annuler</Button><Button disabled={pending} onClick={() => void mutate(`/api/activities/${encodeURIComponent(activity.id)}`, "PUT", form, "Activité modifiée")}>Enregistrer</Button></SheetFooter></SheetContent></Sheet>
    <Sheet open={entityOpen} onOpenChange={setEntityOpen}><SheetContent className="w-full sm:max-w-lg"><SheetHeader><SheetTitle>{entityId ? "Modifier l’entité" : "Ajouter une entité"}</SheetTitle><SheetDescription>Rattachement d’une structure réelle à l’activité.</SheetDescription></SheetHeader><div className="grid gap-4 px-4"><Label>Entité *</Label><Select disabled={!!entityId} value={entityForm.id_entite} onValueChange={(value) => setEntityForm((x) => ({...x,id_entite:value}))}><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{references.entities.map((x) => <SelectItem key={x.id} value={x.id}>{x.secondary ? `${x.secondary} — ` : ""}{x.label}</SelectItem>)}</SelectContent></Select><Label>Rôle *</Label><Select value={entityForm.id_role_entite_activite} onValueChange={(value) => setEntityForm((x) => ({...x,id_role_entite_activite:value}))}><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{references.roles.map((x) => <SelectItem key={x.id} value={x.id}>{x.label}</SelectItem>)}</SelectContent></Select><Label>Statut</Label><Input value={entityForm.statut_participation} onChange={(e) => setEntityForm((x) => ({...x,statut_participation:e.target.value}))} /><Label>Observations</Label><Textarea value={entityForm.observations} onChange={(e) => setEntityForm((x) => ({...x,observations:e.target.value}))} /></div><SheetFooter><Button variant="outline" onClick={() => setEntityOpen(false)}>Annuler</Button><Button disabled={pending} onClick={() => void mutate(`/api/activities/${encodeURIComponent(activity.id)}/entities`, entityId ? "PUT" : "POST", {id:entityId,row:entityForm}, "Entité enregistrée")}>Enregistrer</Button></SheetFooter></SheetContent></Sheet>
    <Sheet open={participantOpen} onOpenChange={setParticipantOpen}><SheetContent className="w-full sm:max-w-lg"><SheetHeader><SheetTitle>{participantId ? "Modifier le participant" : "Ajouter un participant"}</SheetTitle><SheetDescription>Sélectionnez d’abord la famille d’acteur.</SheetDescription></SheetHeader><div className="grid gap-4 px-4"><Label>Type d’acteur *</Label><Select value={participantForm.id_type_acteur} onValueChange={(value) => setParticipantForm((x) => ({...x,id_type_acteur:value,id_acteur:""}))}><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{references.actorTypes.map((x) => <SelectItem key={x.id} value={x.id}>{x.label}</SelectItem>)}</SelectContent></Select><Label>Participant *</Label><Select value={participantForm.id_acteur} onValueChange={(value) => setParticipantForm((x) => ({...x,id_acteur:value}))}><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{actors.map((x) => <SelectItem key={x.id} value={x.id}>{x.label}</SelectItem>)}</SelectContent></Select><Label>Rôle</Label><Input value={participantForm.role_participation} onChange={(e) => setParticipantForm((x) => ({...x,role_participation:e.target.value}))} /><Label>Statut</Label><Input value={participantForm.statut_participation} onChange={(e) => setParticipantForm((x) => ({...x,statut_participation:e.target.value}))} /><Label>Observations</Label><Textarea value={participantForm.observations} onChange={(e) => setParticipantForm((x) => ({...x,observations:e.target.value}))} /></div><SheetFooter><Button variant="outline" onClick={() => setParticipantOpen(false)}>Annuler</Button><Button disabled={pending} onClick={() => void mutate(`/api/activities/${encodeURIComponent(activity.id)}/participants`, participantId ? "PUT" : "POST", {id:participantId,row:participantForm}, "Participant enregistré")}>Enregistrer</Button></SheetFooter></SheetContent></Sheet>
  </>
}

function ActivityEditForm({ form, set, references }: { form:ReturnType<typeof editValues>;set:(key:keyof ReturnType<typeof editValues>,value:string)=>void;references:ActivityReferences }) {
  const input=(label:string,key:keyof typeof form)=><div className="space-y-2"><Label>{label}</Label><Input value={form[key]} onChange={(e)=>set(key,e.target.value)} /></div>
  const date=(label:string,key:"date_debut"|"date_fin")=><div className="space-y-2"><Label>{label}</Label><Input inputMode="numeric" maxLength={10} placeholder="JJMMAAAA" pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}" value={form[key]} onChange={(e)=>set(key,formatCompactDateInput(e.target.value))} /></div>
  return <div className="grid gap-4 px-4 sm:grid-cols-2"><div className="space-y-2"><Label>Type *</Label><Select value={form.id_type_activite} onValueChange={(v)=>set("id_type_activite",v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{references.types.map((x)=><SelectItem key={x.id} value={x.id}>{x.label}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>Organisateur</Label><Select value={form.id_entite_organisatrice} onValueChange={(v)=>set("id_entite_organisatrice",v)}><SelectTrigger><SelectValue placeholder="Sélectionner" /></SelectTrigger><SelectContent>{references.entities.map((x)=><SelectItem key={x.id} value={x.id}>{x.secondary ? `${x.secondary} — ` : ""}{x.label}</SelectItem>)}</SelectContent></Select></div>{input("Nom *","nom_activite")}{input("Titre public","titre_public")}{date("Date de début *","date_debut")}{date("Date de fin","date_fin")}{input("Pays","pays")}{input("Ville","ville")}{input("Lieu","lieu")}<div className="space-y-2"><Label>Statut</Label><Select value={form.statut} onValueChange={(v)=>set("statut",v)}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{statusOptions.map((x)=><SelectItem key={x} value={x}>{x.replaceAll("_"," ")}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2 sm:col-span-2"><Label>Résumé</Label><Textarea value={form.resume} onChange={(e)=>set("resume",e.target.value)} /></div><div className="space-y-2 sm:col-span-2"><Label>Observations</Label><Textarea value={form.observations} onChange={(e)=>set("observations",e.target.value)} /></div></div>
}
