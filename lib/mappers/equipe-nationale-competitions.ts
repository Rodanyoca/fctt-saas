import type { SheetRow } from "@/lib/google-sheets"
import type { EquipeNationaleCompetition } from "@/lib/types"

function str(row: SheetRow, key: string): string {
  const value = row[key]
  return value === null || value === undefined ? "" : String(value).trim()
}

export function mapEquipeNationaleCompetitionRow(row: SheetRow): EquipeNationaleCompetition {
  const idParticipation = str(row, "id_participation_equipe_nationale")
  return {
    idParticipationEquipeNationale: idParticipation,
    idParticipationEn: idParticipation,
    idEquipeNationale: str(row, "id_equipe_nationale"),
    nomEquipeNationale: str(row, "nom_equipe_nationale"),
    discipline: str(row, "discipline"),
    categorie: str(row, "categorie"),
    genre: str(row, "genre"),
    idCompetition: str(row, "id_competition"),
    nomCompetition: str(row, "nom_competition"),
    niveauCompetition: str(row, "niveau_competition"),
    saison: str(row, "saison"),
    dateDebut: str(row, "date_debut"),
    dateFin: str(row, "date_fin"),
    lieu: str(row, "lieu"),
    statutParticipation: str(row, "statut_participation"),
    observation: str(row, "observation"),
  }
}
