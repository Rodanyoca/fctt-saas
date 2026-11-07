import test from "node:test"
import assert from "node:assert/strict"
// @ts-expect-error Node's transform-types runner requires an explicit TypeScript extension.
import { functionalTeamKey, isActiveReference, nextSequentialId, nextYearId, validateDateRange, validateNationalTeamInput } from "./national-teams-domain.ts"
test("valide une équipe permanente", () => { assert.deepEqual(validateNationalTeamInput({}).errors, { id_discipline: "La discipline est obligatoire.", nom_equipe_nationale: "Le nom est obligatoire.", id_categorie_age: "La catégorie est obligatoire.", id_sexe: "Le sexe est obligatoire.", statut: "Le statut est obligatoire." }) })
test("génère les identifiants sans utiliser le nombre de lignes", () => { assert.equal(nextSequentialId(["EQN001", "EQN009", "historique"], "EQN", 3), "EQN010"); assert.equal(nextYearId(["CAM-2026-0004", "CAM-2025-9999"], "CAM", 2026, 4), "CAM-2026-0005") })
test("détecte doublons fonctionnels et dates inversées", () => { assert.equal(functionalTeamKey({ id_discipline: "disc061", id_categorie_age: "age010", id_sexe: "sex001" }), "DISC061::AGE010::SEX001"); assert.ok(validateDateRange("02012026", "01012026").errors.date_fin) })
test("écarte uniquement les références explicitement inactives", () => { assert.equal(isActiveReference({ statut: "ACTIF" }), true); assert.equal(isActiveReference({ statut: "INACTIF" }), false); assert.equal(isActiveReference({}), true) })
