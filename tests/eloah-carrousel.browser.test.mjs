/* Chromium integration: ten real PNGs, a final caption and a readable ZIP. No AI call. */
import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {execFileSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 const page=await browser.newPage({viewport:{width:390,height:844},acceptDownloads:true,serviceWorkers:'block'});
 await page.route('**/*',r=>r.request().url().startsWith('http://127.0.0.1:8765/')?r.continue():r.abort());
 await page.goto('http://127.0.0.1:8765/mes-univers.html#eloah-home-ai',{waitUntil:'domcontentloaded'});
 await page.locator('#eloah-carousel-production').waitFor({state:'attached'});
 const answer=Array.from({length:10},(_,i)=>'SLIDE '+String(i+1).padStart(2,'0')+'\nTITRE: Une idée éditoriale '+(i+1)+'\nTEXTE: Un vrai paragraphe qui explique une idée de manière précise et accessible aux lecteurs, sans inventer de résultats.\nCTA: Découvrir la suite.').join('\n\n')+'\n\nLÉGENDE FINALE: Voilà dix idées à relire avec soin avant publication. Partage ce qui te semble utile.';
 const result=await page.evaluate(answer=>{
  const parsed=window.EloahCarouselProduction.parse(answer);
  const errors=window.EloahCarouselProduction.issue(parsed);
  window.dispatchEvent(new CustomEvent('eloah:answer',{detail:{
    question:'MISSION DE PRODUCTION — Carrousel\nSUJET : Test produit réel\nUNIVERS : Power & Glam',
    universe:'Power & Glam',answer
  }}));
  return {slides:parsed.detected,errors};
 },answer);
 assert.equal(result.slides,10);assert.deepEqual(result.errors,[]);
 await page.locator('#ecp-compose').waitFor({state:'visible'});
 assert.equal(await page.locator('[data-slide]').count(),10);
 await page.locator('#ecp-compose').click();
 await page.waitForFunction(()=>!document.getElementById('ecp-download').disabled,{timeout:90000});
 assert.equal(await page.locator('.ecp-previews figure').count(),10);
 const [download]=await Promise.all([
  page.waitForEvent('download',{timeout:30000}),
  page.locator('#ecp-download').click()
 ]);
 assert.equal(download.suggestedFilename(),'eloah-carrousel-10-visuels.zip');
 const file=await download.path();
 execFileSync('unzip',['-t',file],{timeout:30000});
 const names=execFileSync('unzip',['-Z1',file],{encoding:'utf8'}).trim().split('\n');
 const pngNames=names.filter(n=>/^images\/slide-\d{2}\.png$/.test(n));
 assert.equal(pngNames.length,10,JSON.stringify(names));
 for(const name of pngNames){
  const png=execFileSync('unzip',['-p',file,name],{maxBuffer:12*1024*1024});
  assert.deepEqual([...png.subarray(0,8)],[137,80,78,71,13,10,26,10]);
  assert.equal(png.readUInt32BE(16),1080);
  assert.equal(png.readUInt32BE(20),1350);
 }
 assert.ok(names.includes('legende.txt'));
 assert.ok(names.includes('slides.txt'));
 assert.ok(names.includes('manifest.json'));
 assert.ok(names.includes('sources.json'));
 const manifest=JSON.parse(execFileSync('unzip',['-p',file,'manifest.json'],{encoding:'utf8'}));
 assert.equal(manifest.images,10);
 assert.equal(manifest.published,false);
 assert.equal(manifest.ai_photographs_generated,false);
 const caption=execFileSync('unzip',['-p',file,'legende.txt'],{encoding:'utf8'});
 assert.match(caption,/dix idées à relire/);
 const sizes=await page.evaluate(()=>({body:document.documentElement.scrollWidth,screen:innerWidth}));
 assert.ok(sizes.body<=sizes.screen+5,'No mobile overflow: '+JSON.stringify(sizes));
 console.log('ELOAH: real 10 PNG (1080x1350), ZIP integrity, texts, caption, transparent manifest and mobile checks PASS.');
 await page.close();
}finally{await browser.close()}
