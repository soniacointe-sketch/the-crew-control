/* ELOAH synchronisation volontaire des notes par univers avec la table existante. */
(() => {
'use strict';
const BASE='https://voytsqyorhoveurnguxn.supabase.co';
const KEY='sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy';
const FOUNDER='bd4b7197-6401-4a9a-a14e-c6adbdc0ed46';
const LOCAL='eloah-universe-notes-v1';
let sdk=null;
function notes(){try{const a=JSON.parse(localStorage.getItem(LOCAL)||'[]');return Array.isArray(a)?a:[]}catch{return []}}
function status(s){const el=document.getElementById('em-cloud-status');if(el)el.textContent=s}
async function account(){
 if(!sdk){const m=await import('https://esm.sh/@supabase/supabase-js@2.116.0');sdk=m.createClient(BASE,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'eloah-founder-auth-v1'}})}
 const {data,error}=await sdk.auth.getUser();
 if(error||!data?.user||data.user.is_anonymous||data.user.id!==FOUNDER)throw new Error('Connexion ELOAH Fondatrice requise.');
 return data.user.id;
}
function wrap(universe,items){return JSON.stringify({format:'eloah-validated-memory-v1',universe,items:items.map(x=>({title:String(x.title||'').slice(0,100),note:String(x.note||'').slice(0,2000),validated:x.validated===true}))})}
function parse(content,universe){
 const obj=JSON.parse(content);
 if(obj?.format!=='eloah-validated-memory-v1'||obj.universe!==universe||!Array.isArray(obj.items))throw Error('Format de mémoire distant non reconnu : aucun remplacement effectué.');
 return obj.items.slice(0,100).filter(x=>typeof x.title==='string'&&typeof x.note==='string').map(x=>({universe,title:x.title.slice(0,100),note:x.note.slice(0,2000),validated:x.validated===true}));
}
function init(){
 const panel=document.getElementById('eloah-memory');if(!panel||document.getElementById('em-cloud'))return;
 const wrapEl=document.createElement('div');wrapEl.id='em-cloud';
 wrapEl.innerHTML='<h3>Synchroniser ma mémoire</h3><p>Choisis un univers. Sauvegarde ses notes dans ton cloud, ou récupère celles du cloud. Les deux opérations sont volontaires.</p><label>Univers<select id="em-cloud-universe"></select></label><div class="em-cloud-actions"><button type="button" id="em-cloud-upload">Sauvegarder dans le cloud</button><button type="button" id="em-cloud-download">Récupérer depuis le cloud</button></div><p id="em-cloud-status" role="status"></p>';
 panel.append(wrapEl);
 const select=document.getElementById('em-cloud-universe');
 for(const u of ['Power & Glam','The Crew Orchies','PARISIS ENGINE','Sonia Velka','SONIA OS','ELOAH']){const o=document.createElement('option');o.value=u;o.textContent=u;select.append(o)}
 const buttons=[document.getElementById('em-cloud-upload'),document.getElementById('em-cloud-download')];
 async function run(action){
  buttons.forEach(b=>b.disabled=true);
  try{
   const user=await account(),universe=select.value,local=notes();
   if(action==='upload'){
    const items=local.filter(x=>x.universe===universe);
    if(!items.length)throw Error('Aucune note locale pour cet univers.');
    if(!confirm('Remplacer la mémoire cloud de « '+universe+' » par les '+items.length+' notes locales ?'))return;
    const {error}=await sdk.from('eloah_agent_memory').upsert({owner_id:user,universe,content:wrap(universe,items),updated_at:new Date().toISOString()},{onConflict:'owner_id,universe'});
    if(error)throw error;status('Mémoire « '+universe+' » sauvegardée dans ton cloud.');
  }else{
    const {data,error}=await sdk.from('eloah_agent_memory').select('content').eq('owner_id',user).eq('universe',universe).maybeSingle();
    if(error)throw error;if(!data)throw Error('Aucune mémoire cloud enregistrée pour cet univers.');
    const incoming=parse(data.content,universe);
    if(!confirm('Remplacer les notes locales de « '+universe+' » par les '+incoming.length+' notes du cloud ? Les autres univers seront conservés.'))return;
    localStorage.setItem(LOCAL,JSON.stringify([...local.filter(x=>x.universe!==universe),...incoming]));
    status('Mémoire récupérée. Actualise la page pour afficher les notes.');
  }
  }catch(e){status('Synchronisation non effectuée : '+(e?.message||'erreur inconnue'))}
  finally{buttons.forEach(b=>b.disabled=false)}
 }
 buttons[0].addEventListener('click',()=>run('upload'));
 buttons[1].addEventListener('click',()=>run('download'));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();