import type { Province } from "@/lib/types"
import type { SheetRow } from "@/lib/google-sheets"

function str(row: SheetRow, key: string): string {
  const v = row[key]
  if (v === null || v === undefined) return ""
  return String(v).trim()
}

function normalizeStatut(raw: string): string {
  const v = raw.trim().toLowerCase()
  if (v === "active" || v === "actif") return "active"
  if (v === "inactive" || v === "inactif") return "inactive"
  return raw.trim()
}

export function mapProvinceRow(row: SheetRow): Province {
  const statutRaw = str(row, "statut") || str(row, "staut")

  return {
    idProvince: str(row, "id_province"),
    nomProvince: str(row, "nom_province"),
    id: str(row, "id_province") || str(row, "id"),
    nom: str(row, "nom_province") || str(row, "nom"),
    chefLieu: str(row, "chef_lieu") || str(row, "chefLieu"),
    responsable: str(row, "responsable"),
    telephone: str(row, "telephone"),
    email: str(row, "email"),
    statut: normalizeStatut(statutRaw),

    ligues: 0,
    ententes: 0,
    clubs: 0,
    athletes: 0,
    coachs: 0,
    arbitres: 0,
    medecins: 0,
    completude: 0,
  }
}
