import assert from "node:assert/strict"
import test from "node:test"
// @ts-expect-error Node's type-stripping test runner requires the explicit TypeScript extension.
import { calculateStandings } from "./standings-calculation.ts"

const types = [
  { id_type_resultat: "TRV001", points_classement_vainqueur: "3", points_classement_perdant: "0" },
  { id_type_resultat: "TRV003", points_classement_vainqueur: "2", points_classement_perdant: "1" },
]

test("calcule les points, sets et points marqués", () => {
  const matches = [{ id_match: "M1", id_unite_a: "A", id_unite_b: "B" }, { id_match: "M2", id_unite_a: "A", id_unite_b: "C" }]
  const results = [
    { id_match: "M1", id_statut_resultat: "STR001", sets_gagnes_a: "3", sets_gagnes_b: "0", total_points_a: "75", total_points_b: "50", id_unite_vainqueur: "A", id_type_resultat: "TRV001" },
    { id_match: "M2", id_statut_resultat: "STR001", sets_gagnes_a: "2", sets_gagnes_b: "3", total_points_a: "101", total_points_b: "105", id_unite_vainqueur: "C", id_type_resultat: "TRV003" },
  ]
  const standings = calculateStandings(["A", "B", "C"], matches, results, types)
  const a = standings.find((row) => row.unitId === "A")!
  assert.equal(a.played, 2); assert.equal(a.wins, 1); assert.equal(a.rankingPoints, 4); assert.equal(a.setDifference, 2); assert.equal(a.pointDifference, 21)
  assert.equal(standings[0].unitId, "A")
})

test("ignore les résultats administratifs", () => {
  const standings = calculateStandings(["A", "B"], [{ id_match: "M1", id_unite_a: "A", id_unite_b: "B" }], [{ id_match: "M1", id_statut_resultat: "STR002", id_unite_vainqueur: "A" }], types)
  assert.equal(standings[0].played, 0); assert.equal(standings[1].played, 0)
})

test("utilise l'identifiant comme dernier ordre stable", () => {
  const standings = calculateStandings(["B", "A"], [], [], types)
  assert.deepEqual(standings.map((row) => row.unitId), ["A", "B"])
})
