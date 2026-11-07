"use client"

import { ArrowLeft, CalendarDays, Layers, Pencil, Shield, Users } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DataTable, type Column } from "@/components/dashboard/data-table"
import { DetailCard } from "@/components/dashboard/detail-card"
import { StatusBadge } from "@/components/dashboard/status-badge"
import { ClubFormDialog, type SavedClub } from "@/components/clubs/club-form-dialog"
import type { ClubReferenceOption } from "@/lib/club-references"
import type { Athlete, Club, Entente } from "@/lib/types"

interface ClubDetailProps {
  club: Club
  athletes: Athlete[]
  ententes: Entente[]
  categories: ClubReferenceOption[]
  sexes: ClubReferenceOption[]
  onBack: () => void
  onUpdated: (club: SavedClub) => void
}

function initials(value: string) {
  return value.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "CL"
}

function shown(value: unknown, fallback = "-") {
  const text = value === null || value === undefined ? "" : String(value).trim()
  return text || fallback
}

function SummaryTile({ icon: Icon, label, value }: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: number | string
}) {
  return <Card>
    <CardContent className="flex items-center justify-between gap-3 p-5">
      <div className="min-w-0">
        <p className="truncate text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 truncate text-2xl font-bold">{shown(value)}</p>
      </div>
      <Icon className="h-6 w-6 shrink-0 text-brand-gold" />
    </CardContent>
  </Card>
}

export function ClubDetail({ club, athletes, ententes, categories, sexes, onBack, onUpdated }: ClubDetailProps) {
  const athleteColumns: Column<Athlete>[] = [
    { key: "idAthlete", header: "ID athlète", className: "font-mono text-sm" },
    { key: "nomComplet", header: "Nom complet", className: "font-medium" },
    { key: "sexe", header: "Sexe" },
    { key: "statut", header: "Statut", render: (athlete) => <StatusBadge status={athlete.statut} /> },
  ]

  return <div className="space-y-6">
    <div className="flex items-center justify-between gap-3">
      <Button variant="outline" onClick={onBack}><ArrowLeft className="mr-2 h-4 w-4" />Retour à la liste</Button>
      <ClubFormDialog club={club} ententes={ententes} categories={categories} sexes={sexes} onSaved={onUpdated}
        trigger={<Button className="bg-brand-gold text-[#071827] hover:bg-brand-gold/90"><Pencil className="h-4 w-4" />Modifier</Button>} />
    </div>

    <Card>
      <CardContent className="flex items-center gap-4 p-5">
        <Avatar className="size-20 shrink-0 rounded-xl border bg-background shadow-sm">
          <AvatarImage src={club.logoDriveUrl || undefined} alt={`Logo de ${club.nomClub}`} className="object-contain p-2" />
          <AvatarFallback className="rounded-xl text-lg font-semibold">{initials(club.nomClub)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0"><h2 className="truncate text-xl font-semibold">{shown(club.nomClub, "Club")}</h2><p className="mt-1 font-mono text-sm text-muted-foreground">{shown(club.idClub)}</p></div>
      </CardContent>
    </Card>

    <div className="grid gap-6 lg:grid-cols-2">
      <DetailCard title="Informations générales" icon={Shield} iconClassName="text-brand-gold" fields={[
        { label: "ID Club", value: club.idClub }, { label: "Nom du club", value: club.nomClub },
        { label: "Ligue", value: club.nomLigue }, { label: "Entente", value: club.pseudoEntente },
        { label: "Ville", value: club.idVille }, { label: "Statut", value: club.statut },
        { label: "Observation", value: club.observations },
      ]} />
      <DetailCard title="Affiliation" icon={CalendarDays} iconClassName="text-brand-gold" fields={[
        { label: "Catégorie", value: club.categorie }, { label: "Sexe", value: club.version },
        { label: "Date de création", value: club.dateCreation }, { label: "Date d’affiliation", value: club.dateAffiliationClub },
      ]} />
    </div>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryTile icon={Users} label="Athlètes" value={athletes.length} />
      <SummaryTile icon={Layers} label="Catégorie" value={club.categorie} />
      <SummaryTile icon={Shield} label="Sexe" value={club.version} />
      <SummaryTile icon={CalendarDays} label="Statut" value={club.statut} />
    </div>

    <Card>
      <CardHeader><CardTitle>Athlètes du club</CardTitle></CardHeader>
      <CardContent><DataTable data={athletes} columns={athleteColumns} searchPlaceholder="Rechercher un athlète..." idKey="idAthlete" /></CardContent>
    </Card>
  </div>
}
