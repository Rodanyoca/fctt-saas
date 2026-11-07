import test from "node:test"
import assert from "node:assert/strict"
// @ts-expect-error Node's transform-types runner requires an explicit TypeScript extension.
import { athleteAffiliationClubId, athleteAffiliationClubName } from "./athlete-affiliation-fields.ts"

test("résout le club destination d’une affiliation historique", () => {
  const row = { id_club_destination: "CLUB-002", nom_club_destination: "Club historique" }
  assert.equal(athleteAffiliationClubId(row), "CLUB-002")
  assert.equal(athleteAffiliationClubName(row), "Club historique")
})
