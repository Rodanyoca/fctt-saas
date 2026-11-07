"use client"

import { ArrowLeft, Pencil, Shield, ShieldCheck, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable, type Column } from "@/components/dashboard/data-table"
import { DetailCard } from "@/components/dashboard/detail-card"
import { StatCard } from "@/components/dashboard/stat-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { EditEntenteDialog, type SavedEntente } from "@/components/ententes/entente-form-dialog"
import type { Athlete, Club, Entente, Ligue } from "@/lib/types"
import { formatDateForDisplay } from "@/lib/compact-date"

export function EntenteDetail({ entente, ligues, clubs, athletes, onBack, onUpdated }: { entente: Entente; ligues: Ligue[]; clubs: Club[]; athletes: Athlete[]; onBack: () => void; onUpdated: (entente: SavedEntente) => void }) {
  const relatedClubs = clubs.filter((club) => club.idEntente === entente.idEntente || club.ententeId === entente.idEntente)
  const clubIds = new Set(relatedClubs.map((club) => club.idClub))
  const relatedAthletes = athletes.filter((athlete) => clubIds.has(athlete.clubId))
  const columns: Column<Club>[] = [
    { key: "idClub", header: "ID", className: "font-mono text-sm" },
    { key: "nomClub", header: "Club", className: "font-medium" },
    { key: "categorie", header: "Catégorie" },
    { key: "athletes", header: "Athlètes", render: (club) => relatedAthletes.filter((athlete) => athlete.clubId === club.idClub).length },
    { key: "statut", header: "Statut", render: (club) => <StatusBadge status={club.statut} /> },
  ]

  return <div className="space-y-6">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 size-4" />Retour à la liste</Button>
      <EditEntenteDialog entente={entente} ligues={ligues} onSaved={onUpdated} trigger={<Button className="bg-brand-gold text-[#071827] hover:bg-brand-gold/90" aria-label={`Modifier ${entente.nomEntente}`} title="Modifier"><Pencil className="size-4" />Modifier</Button>} />
    </div>

    <div className="grid gap-6 lg:grid-cols-2">
      <DetailCard title="Informations générales" icon={Shield} iconClassName="text-brand-gold" fields={[{ label: "ID Entente", value: entente.idEntente }, { label: "Nom", value: entente.nomEntente }, { label: "Pseudo", value: entente.pseudoEntente }, { label: "Ligue", value: entente.nomLigue }, { label: "Statut", value: entente.statut }]} />
      <DetailCard title="Coordonnées et reconnaissance" icon={ShieldCheck} iconClassName="text-brand-gold" fields={[{ label: "Téléphone", value: entente.telephone }, { label: "E-mail", value: entente.emailEntente }, { label: "Date de création", value: formatDateForDisplay(entente.dateCreation ?? "") }, { label: "Date de reconnaissance", value: formatDateForDisplay(entente.dateReconnaissance ?? "") }, { label: "Identifiant COC", value: entente.idEntenteCoc }, { label: "Observations", value: entente.observations }]} />
    </div>

    <div className="grid gap-4 sm:grid-cols-2">
      <StatCard className="[&_svg]:text-brand-gold" title="Clubs liés" value={relatedClubs.length} icon={Shield} />
      <StatCard className="[&_svg]:text-brand-gold" title="Athlètes liés" value={relatedAthletes.length} icon={Users} />
    </div>

    <Card><CardHeader><CardTitle>Clubs liés</CardTitle></CardHeader><CardContent><DataTable data={relatedClubs} columns={columns} searchPlaceholder="Rechercher un club..." idKey="idClub" /></CardContent></Card>
  </div>
}
