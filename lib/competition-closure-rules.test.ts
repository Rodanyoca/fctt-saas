import assert from "node:assert/strict"
import test from "node:test"
// @ts-expect-error Node's type-stripping test runner requires the explicit TypeScript extension.
import { competitionClosureIssues } from "./competition-closure-rules.ts"

test("accepte une compétition cohérente", () => {
  const issues = competitionClosureIssues({
    events: [{ id_epreuve_competition: "E1" }],
    phases: [{ id_phase_competition: "P1", id_epreuve_competition: "E1", id_mode_phase: "MPH001", nom_phase: "Poules", statut: "ACTIF" }],
    groups: [{ id_groupe: "G1", id_phase_competition: "P1", nom_groupe: "A", statut: "ACTIF" }],
    phaseUnits: [{ id_phase_competition: "P1", id_groupe: "G1", id_unite_competition: "U1", statut: "ACTIF" }],
    matches: [{ id_match: "M1", statut_match: "TERMINE" }], results: [{ id_match: "M1" }],
    standings: [{ id_phase_competition: "P1", id_groupe: "G1", id_unite_competition: "U1" }],
  })
  assert.deepEqual(issues, [])
})

test("refuse une édition vide", () => {
  const issues = competitionClosureIssues({ events: [], phases: [], groups: [], phaseUnits: [], matches: [], results: [], standings: [] })
  assert.equal(issues.includes("La compétition doit contenir au moins une épreuve."), true)
})

test("signale résultat et classement manquants", () => {
  const issues = competitionClosureIssues({
    events: [{ id_epreuve_competition: "E1" }], phases: [{ id_phase_competition: "P1", id_epreuve_competition: "E1", id_mode_phase: "MPH001", statut: "ACTIF" }],
    groups: [{ id_groupe: "G1", id_phase_competition: "P1", statut: "ACTIF" }], phaseUnits: [{ id_phase_competition: "P1", id_groupe: "G1", id_unite_competition: "U1", statut: "ACTIF" }],
    matches: [{ id_match: "M1", statut_match: "TERMINE" }], results: [], standings: [],
  })
  assert.equal(issues.some((issue) => issue.includes("aucun résultat")), true)
  assert.equal(issues.some((issue) => issue.includes("incomplet")), true)
})
