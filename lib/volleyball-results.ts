export type SetScore = { a: number; b: number }
export type VolleyballDiscipline = "DISC061" | "DISC009"

export function validateVolleyballResult(discipline: VolleyballDiscipline, sets: SetScore[]) {
  const targetWins = discipline === "DISC009" ? 2 : 3
  const maximumSets = discipline === "DISC009" ? 3 : 5
  const errors: string[] = []
  if (!sets.length || sets.length > maximumSets) errors.push(`Le résultat doit contenir de 1 à ${maximumSets} sets.`)
  let winsA = 0, winsB = 0, pointsA = 0, pointsB = 0
  sets.forEach((set, index) => {
    if (!Number.isInteger(set.a) || !Number.isInteger(set.b) || set.a < 0 || set.b < 0) { errors.push(`Le set ${index + 1} contient un score invalide.`); return }
    if (set.a === set.b) { errors.push(`Le set ${index + 1} ne peut pas être nul.`); return }
    const deciding = index === maximumSets - 1
    const minimum = discipline === "DISC009" ? (deciding ? 15 : 21) : (deciding ? 15 : 25)
    const winner = Math.max(set.a, set.b), loser = Math.min(set.a, set.b)
    if (winner < minimum || winner - loser < 2) errors.push(`Le set ${index + 1} ne respecte pas le score réglementaire.`)
    if (set.a > set.b) winsA++; else winsB++
    pointsA += set.a; pointsB += set.b
    if ((winsA === targetWins || winsB === targetWins) && index < sets.length - 1) errors.push("Des sets ont été saisis après la victoire.")
  })
  if (winsA !== targetWins && winsB !== targetWins) errors.push(`Une unité doit gagner ${targetWins} sets.`)
  const resultType = discipline === "DISC009"
    ? (winsA === 2 && winsB === 0) || (winsB === 2 && winsA === 0) ? "TRV004" : "TRV005"
    : Math.min(winsA, winsB) === 0 ? "TRV001" : Math.min(winsA, winsB) === 1 ? "TRV002" : "TRV003"
  return { valid: errors.length === 0, errors, winsA, winsB, pointsA, pointsB, winner: winsA > winsB ? "A" as const : "B" as const, resultType }
}
