export type StandingRow = Record<string, string | number | boolean | null>
const clean = (value: unknown) => String(value ?? "").trim()
const number = (value: unknown) => Number(clean(value)) || 0
export type Standing = { unitId: string; played: number; wins: number; losses: number; setsFor: number; setsAgainst: number; setDifference: number; pointsFor: number; pointsAgainst: number; pointDifference: number; setRatio: number; pointRatio: number; rankingPoints: number; rank: number }

export function calculateStandings(units: string[], matches: StandingRow[], results: StandingRow[], resultTypes: StandingRow[]): Standing[] {
  const rows = new Map(units.map((unitId) => [unitId, { unitId, played: 0, wins: 0, losses: 0, setsFor: 0, setsAgainst: 0, setDifference: 0, pointsFor: 0, pointsAgainst: 0, pointDifference: 0, setRatio: 0, pointRatio: 0, rankingPoints: 0, rank: 0 }]))
  const resultsByMatch = new Map(results.filter((result) => clean(result.id_statut_resultat) === "STR001").map((result) => [clean(result.id_match), result]))
  const types = new Map(resultTypes.map((row) => [clean(row.id_type_resultat), row]))
  for (const match of matches) {
    const result = resultsByMatch.get(clean(match.id_match)); if (!result) continue
    const a = rows.get(clean(match.id_unite_a)), b = rows.get(clean(match.id_unite_b)); if (!a || !b) continue
    const setsA = number(result.sets_gagnes_a), setsB = number(result.sets_gagnes_b), pointsA = number(result.total_points_a), pointsB = number(result.total_points_b), winnerId = clean(result.id_unite_vainqueur), type = types.get(clean(result.id_type_resultat))
    a.played++; b.played++; a.setsFor += setsA; a.setsAgainst += setsB; b.setsFor += setsB; b.setsAgainst += setsA; a.pointsFor += pointsA; a.pointsAgainst += pointsB; b.pointsFor += pointsB; b.pointsAgainst += pointsA
    if (winnerId === a.unitId) { a.wins++; b.losses++; a.rankingPoints += number(type?.points_classement_vainqueur); b.rankingPoints += number(type?.points_classement_perdant) }
    else if (winnerId === b.unitId) { b.wins++; a.losses++; b.rankingPoints += number(type?.points_classement_vainqueur); a.rankingPoints += number(type?.points_classement_perdant) }
  }
  const calculated = [...rows.values()].map((row) => ({ ...row, setDifference: row.setsFor - row.setsAgainst, pointDifference: row.pointsFor - row.pointsAgainst, setRatio: row.setsAgainst === 0 ? row.setsFor : row.setsFor / row.setsAgainst, pointRatio: row.pointsAgainst === 0 ? row.pointsFor : row.pointsFor / row.pointsAgainst }))
  calculated.sort((a, b) => b.wins - a.wins || b.rankingPoints - a.rankingPoints || b.setRatio - a.setRatio || b.pointRatio - a.pointRatio || a.unitId.localeCompare(b.unitId))
  return calculated.map((row, index) => ({ ...row, rank: index + 1 }))
}
