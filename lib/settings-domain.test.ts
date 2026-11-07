import test from "node:test"
import assert from "node:assert/strict"
// @ts-expect-error Node's transform-types runner requires an explicit TypeScript extension.
import { canRequestSeasonChange, canSelectSeason, profileInitials, profileLabel } from "./settings-domain.ts"
test("génère au plus deux initiales", () => { assert.equal(profileInitials({ fullName: "Francky Onady Djamba" }), "FD"); assert.equal(profileInitials({ fullName: "Utilisateur" }), "UT") })
test("utilise les libellés de repli", () => { assert.equal(profileLabel(undefined, "Rôle non renseigné"), "Rôle non renseigné") })
test("interdit une saison annulée et une mutation non connectée", () => { const season = { id: "SAI007", label: "2027", statusLabel: "ANNULEE" }; assert.equal(canSelectSeason(season), false); assert.equal(canRequestSeasonChange({ currentSeasonId: "SAI006", availableSeasons: [season], persistenceAvailable: false, seasonsAvailable: true }, "SAI007"), false) })
