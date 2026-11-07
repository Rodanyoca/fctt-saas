import type { EquipeNationaleResultat } from "@/lib/types"

export function calculateNationalTeamVolleyballResult(
  result: EquipeNationaleResultat,
): EquipeNationaleResultat {
  const sets = [
    [result.set1Rdc, result.set1Adversaire],
    [result.set2Rdc, result.set2Adversaire],
    [result.set3Rdc, result.set3Adversaire],
    [result.set4Rdc, result.set4Adversaire],
    [result.set5Rdc, result.set5Adversaire],
  ] as const
  let setsRdc = 0, setsAdversaire = 0, pointsRdc = 0, pointsAdversaire = 0, played = 0
  for (const [rdc, adversaire] of sets) {
    if (rdc === null || adversaire === null) continue
    played += 1
    pointsRdc += rdc
    pointsAdversaire += adversaire
    if (rdc > adversaire) setsRdc += 1
    if (adversaire > rdc) setsAdversaire += 1
  }
  const finished = ["TERMINE", "TERMINEE"].includes(
    result.statutMatch.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase(),
  )
  const resultatMatch = finished && played > 0 && setsRdc !== setsAdversaire
    ? setsRdc > setsAdversaire ? "VICTOIRE" : "DEFAITE"
    : result.resultatMatch
  return {
    ...result,
    setsGagnesRdc: setsRdc,
    setsGagnesAdversaire: setsAdversaire,
    totalPointsRdc: pointsRdc,
    totalPointsAdversaire: pointsAdversaire,
    totalPointRdc: pointsRdc,
    totalPointAdv: pointsAdversaire,
    scoreGlobal: played ? `${setsRdc}-${setsAdversaire}` : "",
    resultatMatch,
  }
}
