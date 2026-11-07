import assert from "node:assert/strict"
import test from "node:test"
// @ts-expect-error Node's type-stripping test runner requires the explicit TypeScript extension.
import { validateVolleyballResult } from "./volleyball-results.ts"

test("indoor 3-0", () => {
  const result = validateVolleyballResult("DISC061", [{ a: 25, b: 20 }, { a: 25, b: 18 }, { a: 25, b: 23 }])
  assert.equal(result.valid, true); assert.equal(result.resultType, "TRV001"); assert.equal(result.winner, "A")
})
test("indoor 3-2", () => {
  const result = validateVolleyballResult("DISC061", [{ a: 25, b: 20 }, { a: 20, b: 25 }, { a: 25, b: 18 }, { a: 18, b: 25 }, { a: 15, b: 13 }])
  assert.equal(result.valid, true); assert.equal(result.resultType, "TRV003")
})
test("beach 2-1", () => {
  const result = validateVolleyballResult("DISC009", [{ a: 21, b: 18 }, { a: 17, b: 21 }, { a: 15, b: 12 }])
  assert.equal(result.valid, true); assert.equal(result.resultType, "TRV005")
})
test("refuse un set sans deux points d'écart", () => {
  assert.equal(validateVolleyballResult("DISC009", [{ a: 21, b: 20 }, { a: 21, b: 10 }]).valid, false)
})
test("refuse les sets joués après la victoire", () => {
  assert.equal(validateVolleyballResult("DISC009", [{ a: 21, b: 10 }, { a: 21, b: 12 }, { a: 15, b: 8 }]).valid, false)
})
