/* Photography Lab → Studio Articles : import manuel sans écraser les brouillons */
(function(){
'use strict';
const params=new URLSearchParams(location.search);
const id=params.get('pg_lab');
if(!id)return;
const storeKey='pg-photography-lab-transfer-v1';
const safe=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function init(){
const main=document.querySelector('main'),layout=main?.querySelector('.layout'),prompt=document.getElementById('prompt'),universe=document.getElementById('universe');
if(!layout||!prompt||!universe||document.getElementById('pg-lab-bridge'))return;
let incoming=null;try{incoming=JSON.parse(localStorage.getItem(storeKey)||'null')}catch(e){}
const valid= incoming&&incoming.id===id&&typeof incoming.prompt==='string'&&incoming.prompt.trim().length>0;
const section=document.createElement('section');section.id='pg-lab-bridge';
section.style.cssText='margin:18px 0 25px;background:#fffaf5;border-left:4px solid #28705a;border-top:1px solid #dfd2c5;border-right:1px solid #dfd2c5;border-bottom:1px solid #dfd2c5;border-radius:8px;padding:22px;color:#252324';
const back='power-glam-photography-lab.html?direction='+encodeURIComponent(id);
section.innerHTML='<span style="font:700 11px system-ui;color:#28705a;letter-spacing:.14em">PHOTOGRAPHY LAB · DIRECTION SÉLECTIONNÉE</span>'+
'<h2 style="font:27px Georgia,serif;margin:10px 0">'+safe(valid?incoming.title:'Retrouver ma direction photographique')+'</h2>'+
'<p style="font:13px/1.65 system-ui;color:#685e59">'+(valid?'Le prompt sélectionné est prêt. Tu peux l’ajouter à ton article sans effacer les contenus existants.':'Le lien est présent, mais le prompt n’a pas été retrouvé dans ce navigateur. Ouvre le Photography Lab, sélectionne la direction puis clique sur « Envoyer au Studio Articles ».')+'</p>'+
'<div style="display:flex;gap:9px;flex-wrap:wrap"><button type="button" id="pg-lab-insert"'+(valid?'':' disabled')+' style="padding:11px 13px;border-radius:5px;border:1px solid #28705a;background:#28705a;color:white;cursor:pointer">Ajouter à mon brief</button>'+
'<a href="'+back+'" style="display:inline-block;padding:11px 13px;background:#fff;border:1px solid #d1bfb7;border-radius:5px;text-decoration:none">Retour au Photography Lab ↗</a></div>'+
'<p id="pg-lab-status" role="status" style="font:12px/1.6 system-ui;color:#28705a"></p>';
layout.parentNode.insertBefore(section,layout);
if(valid){
section.querySelector('#pg-lab-insert').addEventListener('click',()=>{
const marker='[PHOTOGRAPHY LAB '+id+']';
if(prompt.value.includes(marker)){section.querySelector('#pg-lab-status').textContent='Cette direction est déjà présente dans ton brief.';return}
if(prompt.value.trim()&&!confirm('Ajouter cette direction photographique sans remplacer le brief existant ?'))return;
const u=['Amour','Beauté','Argent','Vie','Désir'].includes(incoming.universe)?incoming.universe:universe.value;
const text=marker+'\n'+incoming.prompt;
prompt.value=(prompt.value.trim()?prompt.value.trim()+'\n\n':'')+text;
universe.value=u;prompt.dispatchEvent(new Event('input',{bubbles:true}));universe.dispatchEvent(new Event('change',{bubbles:true}));
section.querySelector('#pg-lab-status').textContent='Direction photographique ajoutée. Enregistre ton brouillon avec « Conserver localement ».';
})
}
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
