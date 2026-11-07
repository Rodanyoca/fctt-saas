import assert from "node:assert/strict"
import test from "node:test"

import { getDataTableRowKey } from "./data-table-row-key.ts"

test("produit des clés uniques lorsque l’identifiant métier est dupliqué", () => {
  const clubs = [
    { idClub: "0401N/A", nomClub: "Club A" },
    { idClub: "0401N/A", nomClub: "Club B" },
  ]
  const keys = clubs.map((club, index) =>
    getDataTableRowKey(club, "idClub", index),
  )

  assert.equal(new Set(keys).size, clubs.length)
})
