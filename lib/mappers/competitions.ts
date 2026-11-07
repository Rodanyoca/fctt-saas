import type { SheetRow } from "@/lib/google-sheets"
import type { Competition } from "@/lib/types"

function str(row: SheetRow, key: string): string {
  const v = row[key]
  return v === null || v === undefined ? "" : String(v).trim()
}

function normalizeStatut(raw: string): string {
  const v = raw.trim().toLowerCase()
  if (v === "actif" || v === "active") return "actif"
  if (v === "inactif" || v === "inactive") return "inactif"
  return raw.trim()
}

function normalizeDiscipline(raw: string): string {
  const v = raw.trim().toUpperCase()
  if (v === "INDOOR") return "INDOOR"
  if (v === "BEACH") return "BEACH"
  return raw.trim()
}

export function mapCompetitionRow(row: SheetRow): Competition {
  const id = str(row, "id_competition")
  const discipline = normalizeDiscipline(str(row, "nom_discipline"))
  const statut = normalizeStatut(str(row, "statut_competition"))
  return {
    idCompetition: id,
    nomCompetition: str(row, "nom_competition"),
    typeCompetition: str(row, "type_competition"),
    formatCompetition: str(row, "format_competition"),
    idDiscipline: str(row, "id_discipline"),
    nomDiscipline: discipline,
    saison: str(row, "saison"),
    dateDebut: str(row, "date_debut"),
    dateFin: str(row, "date_fin"),
    lieu: str(row, "lieu"),
    niveau: str(row, "niveau"),
    statutCompetition: statut,
    idStructureOrganisatrice: str(row, "id_structure_organisatrice"),
    nomStructureOrganisatrice: str(row, "nom_structure_organisatrice"),
    observation: str(row, "observation"),
  }
}
