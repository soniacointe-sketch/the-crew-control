(function(){
'use strict';
if(new URLSearchParams(location.search).get('rubrique')!=='Mailing')return;
const key='eloah-crew-participants-v1';
const target=document.getElementById('mailing-dashboard');
if(!target)return;
const box=document.createElement('section');
box.style.cssText='margin:18px 0;padding:20px;background:#fff;border:1px solid #dfd9d2;border-radius:12px;color:#242424';
box.innerHTML='<h2 style="font:26px Georgia,serif;margin:0 0 8px">The Crew · Participantes et participants</h2><p>Importe les réponses au formulaire Picnic. Les noms restent sur cet appareil, sans publication ni abonnement à la newsletter.</p><label style="display:block;margin:12px 0">Importer le CSV du Picnic <input type="file" accept=".csv,text/csv" id="crew-participants-file" style="display:block;margin-top:8px"></label><p id="crew-participants-status" role="status"></p><div id="crew-participants-list"></div>';
target.appendChild(box);
const input=box.querySelector('input'),status=box.querySelector('#crew-participants-status'),list=box.querySelector('#crew-participants-list');
function parse(text){const out=[];let row=[],field='',quote=false;text=text.replace(/^\uFEFF/,'');for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quote&&text[i+1]==='"'){field+='"';i++}else quote=!quote;}else if(!quote&&(c===','||c===';'||c==='\n'||c==='\r')){if(c==='\n'||c==='\r'){row.push(field);if(row.some(x=>x.trim()))out.push(row);row=[];field='';if(c==='\r'&&text[i+1]==='\n')i++;}else{row.push(field);field='';}}else field+=c;}row.push(field);if(row.some(x=>x.trim()))out.push(row);return out;}
function stored(){try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function render(){const data=stored();list.replaceChildren();const h=document.createElement('p');h.textContent=data.length+' contact(s) de participation enregistrés localement · aucun abonnement e-mail';list.append(h);if(!data.length)return;const ul=document.createElement('ul');ul.style.cssText='max-height:320px;overflow:auto;padding-left:22px';data.forEach(c=>{const li=document.createElement('li');li.textContent=c.name+' — '+c.count+' personne(s) · '+c.date;ul.append(li)});list.append(ul);}
input.addEventListener('change',async()=>{
const file=input.files?.[0];if(!file)return;if(file.size>3000000){status.textContent='Fichier trop volumineux';return;}
try{const rows=parse(await file.text()),head=rows.shift().map(s=>s.trim().toLowerCase()),ni=head.findIndex(s=>s.includes('prénom et nom')),ci=head.findIndex(s=>s.includes('nombre de personnes présentes')),di=head.findIndex(s=>s.includes('horodateur'));if(ni<0)throw Error('Colonne Prénom et nom introuvable');
const existing=stored();const seen=new Set(existing.map(x=>x.name.toLocaleLowerCase('fr').trim()+'|'+x.date));let added=0,skipped=0;for(const r of rows){const name=(r[ni]||'').trim().replace(/\s+/g,' '),date=(r[di]||'').trim(),count=Number.parseInt(r[ci],10)||1;if(!name){skipped++;continue;}const id=name.toLocaleLowerCase('fr')+'|'+date;if(seen.has(id)){skipped++;continue;}existing.push({name,date,count,source:'Picnic The Crew',newsletterConsent:false});seen.add(id);added++;}
localStorage.setItem(key,JSON.stringify(existing));status.textContent=added+' participant(s) ajoutés · '+skipped+' doublon(s) ou fiche(s) ignorés. Les données restent dans ce navigateur.';render();
}catch(e){status.textContent='Import impossible : '+e.message;}finally{input.value='';}
});render();
})();