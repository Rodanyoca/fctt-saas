import type { SheetRow } from "@/lib/google-sheets"
import type { CompetitionUnite } from "@/lib/types"

function str(row: SheetRow, key: string): string {
  const v = row[key]
  return v === null || v === undefined ? "" : String(v).trim()
}

function normalizeDiscipline(raw: string): string {
  const v = raw.trim().toUpperCase()
  if (v === "INDOOR") return "INDOOR"
  if (v === "BEACH") return "BEACH"
  return raw.trim()
}

export function mapCompetitionUniteRow(row: SheetRow): CompetitionUnite {
  return {
    idUnite: str(row, "id_unite"),
    idCompetition: str(row, "id_competition"),
    nomCompetition: str(row, "nom_competition"),
    discipline: normalizeDiscipline(str(row, "discipline")),
    saison: str(row, "saison"),
    typeUnite: str(row, "type_unite"),
    idClub: str(row, "id_club"),
    nomClub: str(row, "nom_club"),
    version: str(row, "version"),
    idAthleteA: str(row, "id_athlete_a"),
    nomAthleteA: str(row, "nom_athlete_a"),
    idAthleteB: str(row, "id_athlete_b"),
    nomAthleteB: str(row, "nom_athlete_b"),
    nomUnite: str(row, "nom_unite"),
    poule: str(row, "poule"),
    statutUnite: str(row, "statut_unite"),
    observation: str(row, "observation"),
  }
}
