import assert from "node:assert/strict"
import test from "node:test"
// @ts-expect-error Node's type-stripping test runner requires the explicit TypeScript extension.
import { isMissingSheetRangeError } from "./optional-sheet.ts"

test("reconnaît l'onglet de licence absent dans une erreur encapsulée", () => {
  const cause = new Error("Unable to parse range: ARBITRES_LICENCES!A:Z")
  const error = new Error("Impossible de lire Google Sheets (ARBITRES_LICENCES!A:Z)", { cause })
  assert.equal(isMissingSheetRangeError(error, "ARBITRES_LICENCES"), true)
})
test("ne masque pas une erreur réseau", () => {
  assert.equal(isMissingSheetRangeError(new Error("Google Sheets request timeout"), "ARBITRES_LICENCES"), false)
})
test("ne masque pas l'absence d'un autre onglet", () => {
  assert.equal(isMissingSheetRangeError(new Error("Unable to parse range: AUTRE!A:Z"), "ARBITRES_LICENCES"), false)
})
