import type { AutreActeur, TypeAutreActeur } from "@/lib/types"
import type { SheetRow } from "@/lib/google-sheets"

const value = (row: SheetRow, key: string) => String(row[key] ?? "").trim()
const displayLabel = (label: string) => label ? label.toLocaleLowerCase("fr-FR").replace(/^./u, (letter) => letter.toLocaleUpperCase("fr-FR")) : ""

export function mapTypeAutreActeurRow(row: SheetRow): TypeAutreActeur {
  return {
    id: value(row, "id_type_autre_acteur"),
    nom: displayLabel(value(row, "nom_type_autre_acteur")),
    observations: value(row, "observations"),
    statut: value(row, "statut"),
  }
}

export function mapAutreActeurRow(row: SheetRow, sexesById: Map<string, string>, typesById: Map<string, string>): AutreActeur {
  const id = value(row, "id_autre_acteur")
  const idSexe = value(row, "id_sexe")
  const idTypeAutreActeur = value(row, "id_type_autre_acteur")
  return {
    idAutreActeur: id,
    nomComplet: value(row, "nom_complet"),
    idSexe,
    sexe: sexesById.get(idSexe) ?? (idSexe ? "Sexe non reconnu" : ""),
    dateNaissance: value(row, "date_de_naissance"),
    lieuNaissance: value(row, "lieu_de_naissance"),
    nationalite: value(row, "nationalite"),
    idTypeAutreActeur,
    typeAutreActeur: typesById.get(idTypeAutreActeur) ?? (idTypeAutreActeur ? "Type non reconnu" : ""),
    telephone: value(row, "telephone"),
    email: value(row, "email"),
    adresse: value(row, "adresse"),
    numeroPasseport: value(row, "numero_passeport"),
    dateDelivrancePasseport: value(row, "date_de_delivrance_passeport"),
    dateExpirationPasseport: value(row, "date_expiration_passeport"),
    statut: value(row, "statut"),
    observations: value(row, "observations"),
    avatarDriveId: value(row, "avatar_drive_id"),
    avatarDriveUrl: value(row, "avatar_drive_url"),
    passeportDriveId: value(row, "passeport_drive_id"),
    passeportDriveUrl: value(row, "passeport_drive_url"),
    id,
  }
}
