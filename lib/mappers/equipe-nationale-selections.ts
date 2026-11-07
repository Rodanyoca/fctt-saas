import type { SheetRow } from "@/lib/google-sheets"
import type { EquipeNationaleSelection } from "@/lib/types"

function str(row: SheetRow, key: string): string {
  const value = row[key]
  return value === null || value === undefined ? "" : String(value).trim()
}

export function mapEquipeNationaleSelectionRow(row: SheetRow): EquipeNationaleSelection {
  return {
    idSelection: str(row, "id_selection"),
    idEquipeNationale: str(row, "id_equipe_nationale"),
    nomEquipeNationale: str(row, "nom_equipe_nationale"),
    discipline: str(row, "discipline"),
    categorie: str(row, "categorie"),
    genre: str(row, "genre"),
    idAthlete: str(row, "id_athlete"),
    nomAthlete: str(row, "nom_athlete"),
    idClub: str(row, "id_club"),
    nomClub: str(row, "nom_club"),
    poste: str(row, "nom_poste"),
    idPoste: str(row, "id_poste"),
    nomPoste: str(row, "nom_poste"),
    numeroMaillot: str(row, "numero_maillot"),
    capitaine: str(row, "capitaine"),
    saison: str(row, "saison"),
    dateDebutSelection: str(row, "date_debut_selection"),
    dateFinSelection: str(row, "date_fin_selection"),
    statutSelection: str(row, "statut_selection"),
    observation: str(row, "observation"),
  }
}
