/* CDSQCD browser smoke - no credentials, AI charges or external publishing. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { readFile } from 'node:fs/promises';

const BASE='http://127.0.0.1:8765/mes-univers.html#eloah-home-ai';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const summary=[];
try{
 for(const viewport of [{width:1280,height:900,name:'desktop'},{width:390,height:844,name:'mobile'}]){
  const page=await browser.newPage({viewport:{width:viewport.width,height:viewport.height},serviceWorkers:'block'});
  await page.route('**/*',route=>{
   const url=route.request().url();
   if(url.startsWith('http://127.0.0.1:8765/')||url.startsWith('data:'))route.continue();
   else route.abort();
  });
  await page.goto(BASE,{waitUntil:'domcontentloaded',timeout:30000});
  await page.locator('#ef-prepare').waitFor({state:'visible',timeout:20000});
  await page.locator('#eloah-cdsqcd-review').waitFor({state:'attached',timeout:10000});
  await page.evaluate(()=>{
   window.__cdsqcdSubmissions=[];
   document.getElementById('home-ai-form').requestSubmit=function(){
    window.__cdsqcdSubmissions.push(document.getElementById('home-ai-prompt').value);
   };
  });
  const subject=page.locator('#ef-subject'),intent=page.locator('#ef-intent'),trigger=page.locator('#ef-prepare');
  await subject.fill('cdsqcd');await intent.selectOption('auto');await trigger.click();
  let hint=await page.locator('#ef-preflight').innerText();
  assert.match(hint,/inventer|contexte|intention/i,'Ambiguous input must be explained');
  assert.equal(await page.evaluate(()=>window.__cdsqcdSubmissions.length),0,'Ambiguous input cannot be sent');

  await subject.fill('RGPD');await intent.selectOption('auto');await trigger.click();
  assert.equal(await page.evaluate(()=>window.__cdsqcdSubmissions.length),1,'Known acronym can go to AI form');

  await subject.fill('cdsqcd');await intent.selectOption('concept');await trigger.click();
  assert.equal(await page.evaluate(()=>window.__cdsqcdSubmissions.length),2,'Intentional creative concept can go to AI');
  assert.match(await page.evaluate(()=>window.__cdsqcdSubmissions.at(-1)),/CONCEPT À INVENTER/);

  await intent.selectOption('test');await trigger.click();
  assert.equal(await page.evaluate(()=>window.__cdsqcdSubmissions.length),2,'Local test cannot initiate an AI request');

  // Simulated IA response: verify the real browser save/export path without credentials or costs.
  await page.evaluate(()=>{
   const log=document.getElementById('home-ai-log');
   for(const [author,txt] of [['user','Dossier de test CDSQCD'],['eloah','Dossier de test. Voici un brouillon strictement fictif et non publié.']]){
    const row=document.createElement('article');row.className='hai-message';row.dataset.author=author;
    const p=document.createElement('p');p.textContent=txt;row.append(p);log.append(row);
   }
  });
  await page.waitForFunction(()=>!document.getElementById('eloah-result-save-local').disabled);
  page.once('dialog',d=>d.accept('CDSQCD – essai local'));
  await page.locator('#eloah-result-save-local').click();
  const stored=await page.evaluate(()=>JSON.parse(localStorage.getItem('eloah-creations-local-v1')||'[]'));
  assert.ok(stored.length>=1,'Local save must persist to browser storage');
  assert.equal(stored[0].title,'CDSQCD – essai local');
  assert.match(stored[0].text,/brouillon strictement fictif/);

  const [jsonDownload]=await Promise.all([
   page.waitForEvent('download',{timeout:10000}),page.locator('#eloah-package').click()
  ]);
  assert.match(jsonDownload.suggestedFilename(),/eloah-dossier-et-sources\\.json/);
  const exported=JSON.parse(await readFile(await jsonDownload.path(),'utf8'));
  assert.ok(exported.deliverable.content.includes('brouillon strictement fictif'));
  assert.ok('citation_review' in exported,'Export must include CDSQCD source review');

  const [htmlDownload]=await Promise.all([
   page.waitForEvent('download',{timeout:10000}),page.locator('#eloah-export-document').click()
  ]);
  const html=await readFile(await htmlDownload.path(),'utf8');
  assert.match(html,/Sources et vérifications/);
  assert.match(html,/brouillon strictement fictif/);

  const sizes=await page.evaluate(()=>{
   const s=document.querySelector('#eloah-factory'),b=document.querySelector('#ef-prepare');
   const r=s.getBoundingClientRect(),br=b.getBoundingClientRect();
   return {panel:r.width,button:br.width,withinViewport:r.left>=-3&&r.right<=innerWidth+3,
     horizontalOverflow:document.documentElement.scrollWidth-innerWidth};
  });
  assert.ok(sizes.withinViewport,'Creation panel must fit viewport '+JSON.stringify(sizes));
  assert.ok(sizes.button>=90,'Creation button must remain clickable '+JSON.stringify(sizes));
  summary.push(viewport.name+' : ambiguity, safe creation, local save, JSON/HTML exports and responsive layout OK');
  await page.close();
 }
 console.log(summary.join('\n'));
}finally{
 await browser.close();
}
