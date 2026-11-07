import type { CompetitionResult } from "@/lib/types"

type SetPair = [number | null, number | null]

export function calculateSetSummary(sets: SetPair[]) {
  return sets.reduce(
    (summary, [a, b]) => {
      if (a === null || b === null) return summary
      summary.totalPointA += a
      summary.totalPointB += b
      if (a > b) summary.setsGagnesA += 1
      if (b > a) summary.setsGagnesB += 1
      return summary
    },
    { setsGagnesA: 0, setsGagnesB: 0, totalPointA: 0, totalPointB: 0 },
  )
}

export function calculateVolleyballRankingPoints(setsA: number, setsB: number): [number, number] {
  if (setsA === setsB) return [0, 0]
  const loserSets = Math.min(setsA, setsB)
  return setsA > setsB
    ? [loserSets >= 2 ? 2 : 3, loserSets >= 2 ? 1 : 0]
    : [loserSets >= 2 ? 1 : 0, loserSets >= 2 ? 2 : 3]
}

export function resolveForfeitResult(result: CompetitionResult) {
  return result
}

export function enrichCompetitionResult(result: CompetitionResult): CompetitionResult {
  const sets: SetPair[] = [
    [result.set1A, result.set1B], [result.set2A, result.set2B],
    [result.set3A, result.set3B], [result.set4A, result.set4B],
    [result.set5A, result.set5B],
  ]
  const summary = calculateSetSummary(sets)
  const finished = ["TERMINE", "TERMINEE"].includes(
    result.statutMatch.trim().normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase(),
  )
  const winner = finished && summary.setsGagnesA !== summary.setsGagnesB
    ? summary.setsGagnesA > summary.setsGagnesB
      ? { id: result.idUniteA, name: result.nomUniteA }
      : { id: result.idUniteB, name: result.nomUniteB }
    : { id: "", name: "" }

  return resolveForfeitResult({
    ...result,
    setsGagnesA: summary.setsGagnesA,
    setsGagnesB: summary.setsGagnesB,
    totalPointA: summary.totalPointA,
    totalPointB: summary.totalPointB,
    scoreGlobal: sets.some(([a, b]) => a !== null && b !== null)
      ? `${summary.setsGagnesA}-${summary.setsGagnesB}`
      : "",
    idUniteVainqueur: result.idUniteVainqueur || winner.id,
    nomUniteVainqueur: result.nomUniteVainqueur || winner.name,
  })
}
