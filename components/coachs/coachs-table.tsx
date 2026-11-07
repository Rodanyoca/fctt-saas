"use client"

import { ActorTable } from "@/components/actors/actor-table"
import type { Coach } from "@/lib/types"

export function CoachsTable({ coachs, onViewCoach }: { coachs: Coach[]; onViewCoach: (coach: Coach) => void }) {
  return (
    <ActorTable
      title="Liste des Coachs"
      items={coachs}
      onView={onViewCoach}
      showId
      showCount={false}
      showNiveau
      showNationalite
      stackSexAge
      emptyMessage="Aucun coach enregistré."
      toRow={(item) => ({
        id: item.idCoach, nomComplet: item.nomComplet, sexe: item.sexe,
        dateNaissance: item.dateNaissance, idNational: item.idNational, idFivb: item.idFivb,
        avatarDriveId: item.avatarDriveId, avatarDriveUrl: item.avatarDriveUrl, statut: item.statut,
        niveau: item.niveau, nationalite: item.nationalite,
      })}
    />
  )
}
