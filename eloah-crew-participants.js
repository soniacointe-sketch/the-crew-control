(function(){
'use strict';
if(new URLSearchParams(location.search).get('rubrique')!=='Mailing')return;
const key='eloah-crew-participants-v1';
const cards=document.getElementById('mailing-list-cards');
const area=document.getElementById('mailing-contacts-area');
if(!cards||!area)return;
const section=document.createElement('section');
section.id='crew-contact-participants';
section.style.cssText='margin:20px 0;border-top:1px solid #ddd;padding-top:20px';
section.innerHTML='<h3 style="font:24px Georgia,serif;margin:0 0 7px">Participantes et participants · Picnic</h3><p>Contacts issus du formulaire Picnic. Aucune adresse e-mail déduite et aucun abonnement automatique.</p><label style="display:block;margin:12px 0">Importer les réponses au formulaire <input type="file" accept=".csv,text/csv" id="crew-participants-file" style="display:block;margin-top:8px"></label><p id="crew-participants-status" role="status"></p><div id="crew-participants-list"></div>';
area.append(section);
const input=section.querySelector('input'),status=section.querySelector('#crew-participants-status'),list=section.querySelector('#crew-participants-list');
function parse(text){const out=[];let row=[],field='',quote=false;text=text.replace(/^\uFEFF/,'');for(let i=0;i<text.length;i++){const c=text[i];if(c==='"'){if(quote&&text[i+1]==='"'){field+='"';i++}else quote=!quote;}else if(!quote&&(c===','||c===';'||c==='\n'||c==='\r')){if(c==='\n'||c==='\r'){row.push(field);if(row.some(x=>x.trim()))out.push(row);row=[];field='';if(c==='\r'&&text[i+1]==='\n')i++;}else{row.push(field);field='';}}else field+=c;}row.push(field);if(row.some(x=>x.trim()))out.push(row);return out;}
function stored(){try{const v=JSON.parse(localStorage.getItem(key)||'[]');return Array.isArray(v)?v:[]}catch{return []}}
function render(){const data=stored();list.replaceChildren();const p=document.createElement('p');p.textContent=data.length+' contact(s) enregistrés localement · non abonnés à la newsletter';list.append(p);if(!data.length)return;const ul=document.createElement('ul');ul.style.cssText='max-height:320px;overflow:auto;padding-left:22px';data.forEach(c=>{const li=document.createElement('li');li.textContent=c.name+' · '+c.count+' personne(s)';ul.append(li)});list.append(ul);}
input.addEventListener('change',async()=>{const file=input.files?.[0];if(!file)return;if(file.size>3000000){status.textContent='Fichier trop volumineux';return;}
try{const rows=parse(await file.text()),head=rows.shift().map(s=>s.trim().toLowerCase()),ni=head.findIndex(s=>s.includes('prénom et nom')),ci=head.findIndex(s=>s.includes('nombre de personnes présentes')),di=head.findIndex(s=>s.includes('horodateur'));if(ni<0)throw Error('Colonne Prénom et nom introuvable');
const data=stored(),seen=new Set(data.map(x=>x.name.toLocaleLowerCase('fr').trim()+'|'+x.date));let added=0,skipped=0;for(const r of rows){const name=(r[ni]||'').trim().replace(/\s+/g,' '),date=(r[di]||'').trim(),count=Number.parseInt(r[ci],10)||1;if(!name){skipped++;continue;}const id=name.toLocaleLowerCase('fr')+'|'+date;if(seen.has(id)){skipped++;continue;}data.push({name,date,count,source:'Picnic The Crew',newsletterConsent:false});seen.add(id);added++;}
localStorage.setItem(key,JSON.stringify(data));status.textContent=added+' contact(s) ajoutés · '+skipped+' doublon(s)/ligne(s) ignorés.';render();
}catch(e){status.textContent='Import impossible : '+e.message;}finally{input.value='';}});
const observer=new MutationObserver(()=>{const detail=document.getElementById('mailing-list-detail');const title=document.getElementById('mailing-detail-title');section.hidden=!!detail?.hidden||title?.textContent!=='The Crew Orchies';});
observer.observe(document.getElementById('mailing-list-detail'),{attributes:true,attributeFilter:['hidden']});
observer.observe(document.getElementById('mailing-detail-title'),{childList:true,subtree:true});
section.hidden=true;render();
})();