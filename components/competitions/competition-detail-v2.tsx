import Link from "next/link"
import { ArrowLeft, MapPin, Trophy } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Header } from "@/components/dashboard/header"
import { DetailCard } from "@/components/dashboard/detail-card"
import type { Option } from "@/lib/competitions-v2"
import type { SheetRow } from "@/lib/google-sheets"
import { CompetitionStructureManager } from "@/components/competitions/competition-structure-manager"
import { CompetitionPeopleManager } from "@/components/competitions/competition-people-manager"
import type { CompetitionPersonOption } from "@/lib/competition-people"
import { CompetitionEditSheet } from "@/components/competitions/competition-edit-sheet"

const tabs = [
  ["general", "Général"], ["epreuves", "Épreuves"], ["structure", "Phases"],
  ["unites", "Engagements"], ["intervenants", "Participants"], ["matchs", "Programme"],
  ["resultats", "Résultats"], ["classements", "Classement"], ["distinctions", "Distinctions"],
] as const
const value = (row: SheetRow, key: string) => String(row[key] ?? "").trim()

export function CompetitionDetailV2({ detail, references, peopleOptions, activeTab }: { detail: NonNullable<ReturnType<typeof import("@/lib/competitions-v2").competitionData>>; references: Record<string, Option[]>; entryOptions: { clubs: Array<{ id: string; label: string }>; athletes: Array<{ id: string; label: string; clubId: string; sexId: string }> }; peopleOptions: CompetitionPersonOption[]; distinctionTargets: Record<string, string>; activeTab: string }) {
  const selected = tabs.some(([id]) => id === activeTab) ? activeTab : "general"
  const base = `/competitions/${encodeURIComponent(detail.competition.id)}`
  const closed = detail.competition.statut === "TERMINEE"
  return <div className="flex flex-col"><Header title={`Édition : ${detail.competition.nom}`} subtitle={detail.competition.saison} /><main className="space-y-5 p-4 sm:p-6">
    <div className="flex flex-wrap items-center justify-between gap-3"><Button asChild variant="outline"><Link href="/competitions"><ArrowLeft className="size-4" />Retour à la liste</Link></Button></div>
    {closed ? <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">Édition clôturée : consultation historique en lecture seule.</p> : null}
    <CompetitionProgress detail={detail} closed={closed} />
    <nav className="grid h-auto w-full grid-cols-2 gap-1 rounded-md bg-muted p-1 text-muted-foreground sm:grid-cols-3 lg:grid-cols-5 xl:grid-cols-9" aria-label="Sections de la compétition">{tabs.map(([id, label]) => <Link key={id} href={`${base}?tab=${id}`} className={`flex min-h-9 min-w-0 items-center justify-center rounded-md border border-transparent px-2 py-2 text-center text-sm font-medium whitespace-normal transition-[color,box-shadow] ${selected === id ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>{label}</Link>)}</nav>
    {selected === "general" ? <General detail={detail} references={references} /> : null}
    {selected === "epreuves" ? <div className="space-y-4"><CompetitionStructureManager competitionId={detail.competition.id} closed={detail.competition.statut === "TERMINEE"} references={references} events={detail.epreuves} phases={detail.phases} /><SimpleTable title="Épreuves" rows={detail.epreuves} columns={[["nom_epreuve", "Épreuve"], ["id_discipline", "Discipline"], ["id_categorie_age", "Catégorie"], ["id_sexe", "Sexe"], ["statut", "Statut"]]} references={references} /></div> : null}
    {selected === "structure" ? <div className="space-y-4"><CompetitionStructureManager competitionId={detail.competition.id} closed={detail.competition.statut === "TERMINEE"} references={references} events={detail.epreuves} phases={detail.phases} /><SimpleTable title="Phases" rows={detail.phases} columns={[["numero_phase", "NÂ°"], ["nom_phase", "Phase"], ["id_type_phase", "Type"], ["id_mode_phase", "Mode"], ["statut", "Statut"]]} references={references} /><SimpleTable title="Groupes" rows={detail.groupes} columns={[["nom_groupe", "Groupe"], ["id_phase_competition", "Phase"], ["statut", "Statut"]]} references={references} /></div> : null}
    {selected === "unites" ? <PendingSection title="Engagements" /> : null}
    {selected === "intervenants" ? <div className="space-y-4"><CompetitionPeopleManager competitionId={detail.competition.id} closed={detail.competition.statut === "TERMINEE"} options={peopleOptions} units={detail.unites} /><SimpleTable title="Intervenants" rows={detail.intervenants} columns={[["id_type_acteur", "Type"], ["id_acteur", "Acteur"], ["role_participant", "Rôle"], ["id_unite_competition", "Unité"], ["statut", "Statut"]]} references={references} /></div> : null}
    {selected === "matchs" ? <PendingSection title="Programme" /> : null}
    {selected === "resultats" ? <PendingSection title="Résultats" /> : null}
    {selected === "classements" ? <PendingSection title="Classements et qualifications" /> : null}
    {selected === "distinctions" ? <PendingSection title="Distinctions" /> : null}
  </main></div>
}

function General({ detail, references }: { detail: NonNullable<ReturnType<typeof import("@/lib/competitions-v2").competitionData>>; references: Record<string, Option[]> }) { const c = detail.competition; return <div className="space-y-4">{c.statut !== "TERMINEE" ? <div className="flex justify-end"><CompetitionEditSheet competition={c} references={references} /></div> : null}<div className="grid gap-5 lg:grid-cols-2"><DetailCard title="Informations générales" icon={Trophy} fields={[{ label: "Référence", value: c.id }, { label: "Nom", value: c.nom }, { label: "Type", value: c.type }, { label: "Discipline", value: c.discipline }, { label: "Saison", value: c.saison }, { label: "Statut", value: c.statut }]} /><DetailCard title="Organisation" icon={MapPin} fields={[{ label: "Début", value: c.dateDebut }, { label: "Fin", value: c.dateFin }, { label: "Pays", value: c.pays }, { label: "Lieu", value: c.lieu || "-" }, { label: "Observations", value: c.observations || "-" }]} /></div></div> }

function CompetitionProgress({ detail, closed }: { detail: NonNullable<ReturnType<typeof import("@/lib/competitions-v2").competitionData>>; closed: boolean }) {
  const steps = ["Épreuves", "Engagements", "Phases", "Programme", "Résultats", "Qualifications", "Clôture"]
  const done = [detail.epreuves.length > 0, detail.unites.length > 0, detail.phases.length > 0, detail.matches.length > 0, detail.resultats.length > 0, detail.phasesUnites.some((row) => value(row, "id_type_affectation_phase") === "TAP002"), closed]
  const warning = "Les règles de programme, d’engagement et de résultats athlétisme restent à valider."
  return <div className="space-y-2"><div className="flex flex-wrap gap-1.5 rounded-lg border bg-muted/30 p-3 text-xs sm:text-sm">{steps.map((step, index) => <span key={step} className="inline-flex items-center gap-1.5"><span className={`rounded-full px-2.5 py-1 font-medium ${done[index] ? "bg-emerald-500/15 text-emerald-700" : "bg-background"}`}>{step}</span>{index < steps.length - 1 ? <span>→</span> : null}</span>)}</div>{warning && !closed ? <p className="text-sm text-amber-700">{warning}</p> : null}</div>
}

function SimpleTable({ title, rows, columns, references }: { title: string; rows: SheetRow[]; columns: Array<[string, string]>; references: Record<string, Option[]> }) {
  const refByField: Record<string, string> = { id_discipline: "DISCIPLINES", id_categorie_age: "CATEGORIES_AGE", id_sexe: "SEXES", id_type_phase: "TYPES_PHASES", id_mode_phase: "MODES_PHASES", id_type_unite_competition: "TYPES_UNITES_COMPETITION", id_type_acteur: "TYPES_ACTEURS", id_type_distinction: "TYPES_DISTINCTIONS" }
  const display = (row: SheetRow, key: string) => { const raw = value(row, key); const sheet = refByField[key]; return sheet ? (references[sheet]?.find((option) => option.id === raw)?.label ?? raw ?? "—") || "—" : raw || "—" }
  return <section className="overflow-hidden rounded-xl border bg-card"><div className="border-b px-4 py-3"><h2 className="font-semibold">{title}</h2></div><div className="overflow-x-auto"><Table><TableHeader><TableRow>{columns.map(([key, label]) => <TableHead key={key}>{label}</TableHead>)}</TableRow></TableHeader><TableBody>{rows.map((row, index) => <TableRow key={`${value(row, Object.keys(row)[0])}-${index}`}>{columns.map(([key]) => <TableCell key={key}>{key.includes("statut") ? <Badge variant="outline">{display(row, key)}</Badge> : display(row, key)}</TableCell>)}</TableRow>)}{!rows.length ? <TableRow><TableCell colSpan={columns.length} className="h-28 text-center text-muted-foreground">Aucune donnée enregistrée.</TableCell></TableRow> : null}</TableBody></Table></div></section>
}

function PendingSection({ title }: { title: string }) { return <section className="overflow-hidden rounded-xl border bg-card"><div className="border-b px-4 py-3"><h2 className="font-semibold">{title}</h2></div><div role="status" className="p-8 text-center text-sm text-muted-foreground">Adaptation athlétisme en attente : le moteur volleyball est retiré de ce parcours. Aucune donnée de résultat ou règle officielle n’est simulée.</div></section> }
