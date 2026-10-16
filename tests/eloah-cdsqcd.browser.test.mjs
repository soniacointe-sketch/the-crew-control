/* CDSQCD browser smoke - no credentials, AI charges or external publishing. */
import assert from 'node:assert/strict';
import { chromium } from 'playwright';

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

  const sizes=await page.evaluate(()=>{
   const s=document.querySelector('#eloah-factory'),b=document.querySelector('#ef-prepare');
   const r=s.getBoundingClientRect(),br=b.getBoundingClientRect();
   return {panel:r.width,button:br.width,withinViewport:r.left>=-3&&r.right<=innerWidth+3,
     horizontalOverflow:document.documentElement.scrollWidth-innerWidth};
  });
  assert.ok(sizes.withinViewport,'Creation panel must fit viewport '+JSON.stringify(sizes));
  assert.ok(sizes.button>=90,'Creation button must remain clickable '+JSON.stringify(sizes));
  summary.push(viewport.name+' : ambiguity, known acronym, creative mode, safe test and responsive layout OK');
  await page.close();
 }
 console.log(summary.join('\n'));
}finally{
 await browser.close();
}
