import assert from "node:assert/strict"
import test from "node:test"
// @ts-expect-error Node's type-stripping test runner requires the explicit TypeScript extension.
import { isTransientSheetsError, withBoundedRetry } from "./google-sheets-resilience.ts"

test("reconnaît uniquement les erreurs transitoires", () => {
  assert.equal(isTransientSheetsError({ response: { status: 503 } }), true)
  assert.equal(isTransientSheetsError({ code: 429 }), true)
  assert.equal(isTransientSheetsError(new Error("socket hang up")), true)
  assert.equal(isTransientSheetsError({ response: { status: 400 } }), false)
})
test("réessaie de façon bornée puis réussit", async () => {
  let attempts = 0
  const result = await withBoundedRetry(async () => { attempts++; if (attempts < 3) throw { code: 503 }; return "ok" }, async () => undefined)
  assert.equal(result, "ok"); assert.equal(attempts, 3)
})
test("ne réessaie pas une erreur permanente", async () => {
  let attempts = 0
  await assert.rejects(() => withBoundedRetry(async () => { attempts++; throw { code: 400 } }, async () => undefined))
  assert.equal(attempts, 1)
})
