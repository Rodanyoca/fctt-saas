import assert from "node:assert/strict"
import test from "node:test"
import { compactDateFromSheet, compareDateValues, formatCompactDateInput, formatDateForDisplay, formatDateForSheet, parseCompactDate, sanitizeDateInput, validateBirthDate } from "./compact-date.ts"

test("nettoie et limite la saisie compacte", () => {
  assert.equal(sanitizeDateInput("27-09/1990abc"), "27091990")
  assert.equal(sanitizeDateInput("2709199012"), "27091990")
  assert.equal(formatCompactDateInput("2"), "2")
  assert.equal(formatCompactDateInput("2709"), "27/09")
  assert.equal(formatCompactDateInput("27091990"), "27/09/1990")
  assert.equal(formatCompactDateInput("27-09.1990"), "27/09/1990")
})

test("valide les dates réelles et les années bissextiles", () => {
  assert.deepEqual(parseCompactDate("29022020"), { day: 29, month: 2, year: 2020 })
  assert.equal(parseCompactDate("29022021"), null)
  assert.equal(parseCompactDate("31022020"), null)
  assert.equal(parseCompactDate("32132020"), null)
})

test("convertit sans fuseau entre saisie, feuille et affichage", () => {
  assert.equal(formatDateForSheet("27091990"), "1990-09-27")
  assert.equal(formatDateForSheet("27/09/1990"), "1990-09-27")
  assert.equal(formatDateForSheet("2026-09-12T00:00:00.000Z"), "2026-09-12")
  assert.equal(formatDateForDisplay("1990-09-27"), "27/09/1990")
  assert.equal(formatDateForDisplay("2026-09-12T00:00:00.000Z"), "12/09/2026")
  assert.equal(compactDateFromSheet("1990-09-27"), "27/09/1990")
  assert.equal(formatDateForSheet(""), "")
})

test("normalise les dates collées avec un jour ou un mois sur un chiffre", () => {
  assert.equal(formatCompactDateInput("1/9/2026"), "01/09/2026")
  assert.equal(formatCompactDateInput("12/9/2026"), "12/09/2026")
  assert.equal(formatCompactDateInput("1/09/2026"), "01/09/2026")
  assert.deepEqual(parseCompactDate("1/9/2026"), { day: 1, month: 9, year: 2026 })
})

test("rejette une naissance future et compare les dates de passeport", () => {
  assert.match(validateBirthDate("01012030", new Date(2026, 8, 27)), /future/)
  assert.equal(validateBirthDate("27091990", new Date(2026, 8, 27)), null)
  assert.equal(validateBirthDate("1990-09-27", new Date(2026, 8, 27)), null)
  assert.equal(compareDateValues("01012025", "31122024"), 1)
})
