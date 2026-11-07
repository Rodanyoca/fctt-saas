const { createRequire } = require('node:module')
const path = require('node:path')
const fs = require('node:fs/promises')
const assert = require('node:assert/strict')
// Read existing local test tooling only; never install or edit a reference repository.
const testRequire = createRequire(path.resolve('../fecot-managment/package.json'))
const { build } = testRequire('esbuild')
const { chromium } = testRequire('@playwright/test')
async function cssFiles(directory) {
  const css = []
  for (const entry of await fs.readdir(directory, { withFileTypes: true })) {
    if (entry.isDirectory()) css.push(...await cssFiles(path.join(directory, entry.name)))
    else if (entry.name.endsWith('.css')) css.push(await fs.readFile(path.join(directory, entry.name), 'utf8'))
  }
  return css
}
;(async () => {
  await fs.mkdir('test-results/fctt', { recursive: true })
  const bundle = await build({ entryPoints: ['tests/fctt/ui-entry.tsx'], bundle: true, write: false, platform: 'browser', format: 'iife', jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' }, plugins: [{ name: 'isolated-next', setup(builder) { builder.onResolve({ filter: /^next\/(navigation|link)$/ }, () => ({ path: path.resolve('tests/fctt/navigation-shim.tsx') })) } }] })
  const css = (await cssFiles('.next/static')).join('\n')
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } })
    let detailReads = 0
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    await page.route('**/*', async route => {
      if (route.request().isNavigationRequest()) return route.fulfill({ contentType: 'text/html', body: '<html lang="fr"><body><div id="root"></div></body></html>' })
      const url = new URL(route.request().url())
      if (url.pathname === '/api/athletes/TTB-ATH-000001') {
        assert.equal(route.request().method(), 'GET'); detailReads++
        if (detailReads === 1) return route.fulfill({ status: 503, json: { error: { code: 'connection', message: 'Connexion de test indisponible' } } })
        return route.fulfill({ json: { player: { id: 'TTB-ATH-000001', name: 'Joueur Test 01', ittf: 'ITTF-TEST', sex: 'MASCULIN', nationality: 'RDC', affiliation: '', status: '', birth: '2000-01-03', birthplace: 'Lieu test', telephone: 'TEST-PHONE', email: 'test@example.test', address: 'Adresse test' } } })
      }
      return route.abort()
    })
    await page.goto('http://fctt-qa.test/')
    await page.addStyleTag({ content: css })
    await page.addScriptTag({ content: bundle.outputFiles[0].text })
    await page.getByText('Aucun joueur enregistré', { exact: true }).waitFor()
    assert.equal(detailReads, 0)
    await page.screenshot({ path: 'test-results/fctt/players-empty.png', fullPage: true })
    const nav = page.getByRole('navigation', { name: 'Navigation principale' })
    assert.equal(await nav.getByRole('link', { name: /Ligues|Clubs|Transferts|Licences|Équipes nationales/ }).count(), 0)
    await page.evaluate(() => window.fcttRender('simulated'))
    await page.getByRole('columnheader', { name: 'ID fédéral', exact: true }).waitFor()
    assert.equal(await page.locator('tbody tr').count(), 10)
    assert.equal(await page.getByRole('columnheader', { name: /Licence|BWF|FIE|Passeport/ }).count(), 0)
    assert.equal(detailReads, 0)
    await page.getByRole('button', { name: 'Page suivante' }).click()
    assert.equal(await page.locator('tbody tr:first-child td:first-child').textContent(), 'TTB-ATH-000011')
    await page.getByRole('button', { name: 'Page suivante' }).click()
    assert.equal(await page.locator('tbody tr').count(), 6)
    await page.getByPlaceholder('Nom, ID fédéral ou ID ITTF…').fill('TTB-ATH-000001')
    assert.equal(await page.locator('tbody tr').count(), 1)
    await page.getByRole('button', { name: 'Voir Joueur Test 01', exact: true }).click()
    const dialog = page.getByRole('dialog')
    await dialog.getByText('Connexion de test indisponible').waitFor()
    await dialog.getByRole('button', { name: 'Réessayer', exact: true }).click()
    await dialog.getByText('TEST-PHONE', { exact: true }).waitFor()
    await dialog.getByText('ID fédéral permanent', { exact: true }).waitFor()
    await dialog.getByText('ID ITTF (facultatif)', { exact: true }).waitFor()
    assert.equal(detailReads, 2)
    assert.equal(await dialog.getByText(/Passeport|ID BWF|ID FIE|Numéro de licence/).count(), 0)
    await page.screenshot({ path: 'test-results/fctt/player-detail.png', fullPage: true })
    await page.keyboard.press('Escape'); await dialog.waitFor({ state: 'hidden' })
    assert.equal(await page.getByPlaceholder('Nom, ID fédéral ou ID ITTF…').inputValue(), 'TTB-ATH-000001')
    await page.getByPlaceholder('Nom, ID fédéral ou ID ITTF…').fill('')
    await page.getByRole('combobox', { name: 'Sexe', exact: true }).click()
    await page.getByRole('option', { name: 'FEMININ', exact: true }).click()
    assert.ok((await page.locator('tbody tr').count()) > 0)
    await page.screenshot({ path: 'test-results/fctt/players-simulated.png', fullPage: true })
    await page.setViewportSize({ width: 390, height: 844 })
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1))
    await page.screenshot({ path: 'test-results/fctt/players-mobile.png', fullPage: true })
    assert.deepEqual(errors, [])
    console.log('FCTT isolated UI: real empty-state expectation, simulated pagination/search/filter/detail/error/retry/privacy/mobile passed. No Sheets requests or writes.')
  } finally { await browser.close() }
})().catch(error => { console.error(error); process.exitCode = 1 })
