"use client"
import { useMemo, useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DataTable, type Column, type Filter } from "@/components/dashboard/data-table"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { formatDateForDisplay } from "@/lib/compact-date"
import { ActivityForm } from "@/components/activities/activity-form"
import type { ActivityOption, ActivityView } from "@/lib/activities"
const columns: Column<ActivityView>[] = [{ key: "type", header: "Type" }, { key: "name", header: "Activité", className: "font-medium" }, { key: "startDate", header: "Début", render: (i) => formatDateForDisplay(i.startDate) || "—" }, { key: "endDate", header: "Fin", render: (i) => formatDateForDisplay(i.endDate) || "—" }, { key: "city", header: "Ville", render: (i) => i.city || "—" }, { key: "status", header: "Statut", render: (i) => <StatusBadge status={i.status} /> }]
export function ActivitiesClient({ activities, types, initialError }: { activities: ActivityView[]; types: ActivityOption[]; initialError: string }) { const [open, setOpen] = useState(false); const filters: Filter[] = useMemo(() => [{ key: "type", label: "Type", options: types.map((i) => ({ value: i.label, label: i.label })) }, { key: "status", label: "Statut", options: [...new Set(activities.map((i) => i.status).filter(Boolean))].map((v) => ({ value: v, label: v.replaceAll("_", " ") })) }], [activities, types]); return <div className="space-y-4">{initialError ? <p role="alert" className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">{initialError}</p> : null}<div className="flex justify-end"><Button onClick={() => setOpen(true)} className="bg-brand-gold text-slate-950 hover:bg-brand-gold/90"><Plus className="size-4" />Créer une activité</Button></div><DataTable data={activities} columns={columns} filters={filters} searchPlaceholder="Rechercher une activité..." idKey="id" detailHref={(item) => `/activites/${encodeURIComponent(item.id)}`} /><ActivityForm open={open} onOpenChange={setOpen} types={types} /></div> }
