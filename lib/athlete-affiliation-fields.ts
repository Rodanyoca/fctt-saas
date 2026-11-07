type Row = Record<string, unknown>

const first = (row: Row, keys: string[]) => keys.map((key) => String(row[key] ?? "").trim()).find(Boolean) ?? ""

export const athleteAffiliationClubId = (row: Row) => first(row, ["id_club_beneficiaire", "id_club_destination", "id_club"])
export const athleteAffiliationClubName = (row: Row) => first(row, ["nom_club_beneficiaire", "nom_club_destination", "nom_club"])
