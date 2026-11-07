"use client"

import { ActorTable } from "@/components/actors/actor-table"
import type { Athlete } from "@/lib/types"

export function AthletesTable({
  athletes,
  title = "Liste des Athlètes",
  onViewAthlete,
}: {
  athletes: Athlete[]
  title?: string
  onViewAthlete?: (athlete: Athlete) => void
}) {
  return (
    <ActorTable
      title={title}
      items={athletes}
      onView={onViewAthlete}
      showId={false}
      showCount={false}
      firstColumn={{ label: "ID athlète", value: (athlete) => athlete.idAthlete }}
      stackSexAge
      emptyMessage="Aucun athlète enregistré."
      toRow={(item) => ({
        id: item.idAthlete,
        nomComplet: item.nomComplet,
        sexe: item.sexe,
        dateNaissance: item.dateDeNaissance,
        idNational: item.idNational,
        idFivb: item.idFivb,
        avatarDriveId: item.avatarDriveId,
        avatarDriveUrl: item.avatarDriveUrl,
        statut: item.statut,
      })}
    />
  )
}
