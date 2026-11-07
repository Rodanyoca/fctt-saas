import type { SheetRow } from "@/lib/google-sheets"
import type { EquipeNationale } from "@/lib/types"

function str(row: SheetRow, key: string): string {
  const value = row[key]
  return value === null || value === undefined ? "" : String(value).trim()
}

export function mapEquipeNationaleRow(row: SheetRow): EquipeNationale {
  return {
    idEquipeNationale: str(row, "id_equipe_nationale"),
    nomEquipeNationale: str(row, "nom_equipe_nationale"),
    discipline: str(row, "discipline"),
    categorie: str(row, "categorie"),
    genre: str(row, "genre"),
    saison: str(row, "saison"),
    statutEquipe: str(row, "statut_equipe"),
    observation: str(row, "observation"),
  }
}
