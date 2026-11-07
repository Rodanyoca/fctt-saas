const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'C:/Projets/SNDS-HARMONISATION/cnac-cible/node_modules/playwright');
const fs = require('node:fs');
const assert = require('node:assert/strict');
(async () => {
 const browser = await chromium.launch({ headless: true });
 const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
 const errors = [], external = [], results = [];
 page.on('pageerror', e => errors.push(e.message));
 page.on('request', r => { if (!r.url().startsWith('http://localhost:3006') && !r.url().startsWith('data:')) external.push(r.url()) });
 const routes = ['/', '/ligues', '/ententes', '/clubs', '/athletes', '/coachs', '/arbitres', '/medecins', '/officiels', '/autres-acteurs', '/licences', '/licences/entourage', '/competitions', '/competitions/DEMO-COMP-1', '/equipe-nationale', '/activites', '/activites/DEMO-ACT-1', '/documents', '/parametres', '/suivi-equipe-nationale', '/transferts'];
 fs.mkdirSync('docs/screenshots', { recursive: true });
 for (const route of routes) {
  const response = await page.goto('http://localhost:3006' + route, { waitUntil: 'networkidle', timeout: 120000 });
  assert.equal(response.status(), 200, route);
  assert.ok(await page.locator('h1').count(), route+' has title');
  assert.equal(await page.locator('body').getByText('Démonstration FEACO · données fictives locales · enregistrement et fichiers non connectés.', {exact: true}).count(), 1, route+' has one demo notice');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > innerWidth);
  assert.equal(overflow, false, route+' desktop overflow');
  if (['/', '/clubs', '/athletes', '/competitions', '/documents'].includes(route)) await page.screenshot({ path: 'docs/screenshots/' + (route.slice(1)||'dashboard') + '-desktop.png', fullPage: true });
  const buttons = await page.getByRole('button').evaluateAll(ns => ns.filter(n => n.getBoundingClientRect().width > 0).map(n => ({ text:n.textContent.trim(), aria:n.getAttribute('aria-label') })));
  console.log(route, JSON.stringify(buttons.filter(n=>/^(Ajouter|Créer|Nouvelle|Nouveau|Voir)/.test(n.aria||n.text))));
  const create = buttons.find(n=>/^(Ajouter|Créer|Nouvelle|Nouveau)/.test(n.text));
  let form = false;
  if (create && await page.getByRole('button',{name:create.text,exact:true}).count() === 1) {
   await page.getByRole('button',{name:create.text,exact:true}).click();
   await page.getByRole('dialog').waitFor();
   assert.equal(await page.getByRole('dialog').count(),1);
   await page.screenshot({path:'docs/screenshots/'+route.slice(1).replaceAll('/','-')+'-form.png',fullPage:true});
   await page.keyboard.press('Escape');
   await page.getByRole('dialog').waitFor({state:'hidden'});form=true;
  }
  results.push({route,status:response.status(),formOpenedAndClosed:form,overflow});
 }
 // Territorial details preserve sections; club detail screenshot uses same 1440px width as stored source.
 await page.goto('http://localhost:3006/clubs',{waitUntil:'networkidle'});
 await page.getByRole('button',{name:'Voir Club de démonstration 1',exact:true}).click();
 await page.screenshot({path:'docs/screenshots/club-detail-desktop.png',fullPage:true});
 assert.ok(await page.getByText('Athlètes du club',{exact:true}).count());
 await page.goto('http://localhost:3006/ligues',{waitUntil:'networkidle'});
 console.log('LIGUE DETAIL BUTTONS',await page.getByRole('button').evaluateAll(ns=>ns.map(n=>n.getAttribute('aria-label')||n.textContent.trim())));
 // Non-applicable result engine must not be exposed.
 await page.goto('http://localhost:3006/competitions/DEMO-COMP-1?tab=resultats',{waitUntil:'networkidle'});
 assert.equal(await page.getByText('Adaptation athlétisme en attente : le moteur volleyball est retiré de ce parcours. Aucune donnée de résultat ou règle officielle n’est simulée.',{exact:true}).count(),1);
 assert.equal(await page.getByRole('button',{name:'Saisir un résultat'}).count(),0);
 for (const [method,path] of [['POST','/api/athletes'],['PATCH','/api/clubs/DEMO-C1'],['DELETE','/api/documents/DEMO-DOC-1'],['POST','/api/competitions/DEMO-COMP-1/results'],['POST','/api/licences/athletes']]) {
  const r = await page.request.fetch('http://localhost:3006'+path,{method,data:{nomComplet:'Test fictif'}});assert.equal(r.status(),409); const payload=await r.json(); assert.ok(payload.error.includes('aucune sauvegarde'));results.push({method,path,status:r.status()});
 }
 await page.setViewportSize({width:390,height:844});
 for (const route of ['/clubs','/athletes','/competitions','/documents']) {
  await page.goto('http://localhost:3006'+route,{waitUntil:'networkidle'});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false,route+' mobile overflow');
  await page.screenshot({path:'docs/screenshots/'+route.slice(1)+'-mobile.png',fullPage:true});
 }
 await page.getByRole('button',{name:'Ouvrir la navigation principale',exact:true}).click();
 await page.getByRole('dialog').waitFor();
 await page.screenshot({path:'docs/screenshots/navigation-mobile.png',fullPage:true});
 await page.keyboard.press('Escape'); await page.getByRole('dialog').waitFor({state:'hidden'});
 await page.keyboard.press('Tab'); assert.ok(await page.evaluate(()=>document.activeElement!==document.body));
 assert.deepEqual(errors,[]);assert.deepEqual(external,[]);
 fs.writeFileSync('docs/browser-results.json',JSON.stringify({results,errors,externalRequests:external,mobileNavigation:true,keyboardFocus:true},null,2));
 console.log('PASS',results.length,'checks; no client error or external request');await browser.close();
})().catch(e=>{console.error(e);process.exitCode=1});
