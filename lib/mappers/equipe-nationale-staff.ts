import type { SheetRow } from "@/lib/google-sheets"
import type { EquipeNationaleStaff } from "@/lib/types"

const str = (row: SheetRow, key: string) =>
  row[key] === null || row[key] === undefined ? "" : String(row[key]).trim()

export function mapEquipeNationaleStaffRow(row: SheetRow): EquipeNationaleStaff {
  return {
    idStaffSelection: str(row, "id_staff_selection"),
    idEquipeNationale: str(row, "id_equipe_nationale"),
    nomEquipeNationale: str(row, "nom_equipe_nationale"),
    discipline: str(row, "discipline"),
    categorie: str(row, "categorie"),
    genre: str(row, "genre"),
    typeActeur: str(row, "type_acteur"),
    idActeur: str(row, "id_entourage") || str(row, "id_acteur"),
    nomActeur: str(row, "nom_entourage") || str(row, "nom_acteur"),
    fonction: str(row, "fonction"),
    saison: str(row, "saison"),
    dateDebut: str(row, "date_debut"),
    dateFin: str(row, "date_fin"),
    statutStaff: str(row, "statut_staff"),
    observation: str(row, "observation"),
  }
}
