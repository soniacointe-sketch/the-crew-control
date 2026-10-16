/* ELOAH : creations cloud explicites, rattachees au compte fondatrice. */
(() => {
'use strict';
const BASE='https://voytsqyorhoveurnguxn.supabase.co';
const KEY='sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy';
const FOUNDER='bd4b7197-6401-4a9a-a14e-c6adbdc0ed46';
let db=null,loading=null,uid=null;
const by=id=>document.getElementById(id);
const message=s=>{const el=by('ecc-status');if(el)el.textContent=s};
async function client(){
 if(db)return db;
 if(!loading)loading=import('https://esm.sh/@supabase/supabase-js@2.116.0').then(mod=>mod.createClient(BASE,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'eloah-founder-auth-v1'}}));
 try{db=await loading;return db}finally{loading=null}
}
async function auth(){
 const sdk=await client();const {data,error}=await sdk.auth.getUser();
 if(error||!data?.user||data.user.id!==FOUNDER||data.user.is_anonymous)throw Error('Connecte-toi avec ton compte ELOAH Fondatrice.');
 uid=data.user.id;return sdk;
}
function download(name,content){const url=URL.createObjectURL(new Blob([content],{type:'text/plain;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),3000)}
async function refresh(){
 const sdk=await auth();
 const {data,error}=await sdk.from('eloah_creations').select('id,title,content,universe,updated_at').eq('user_id',uid).order('updated_at',{ascending:false}).limit(100);
 if(error)throw error;
 const list=by('ecc-list');list.replaceChildren();
 if(!data?.length){list.textContent='Aucune création dans ton espace cloud.';return}
 for(const item of data){
  const article=document.createElement('article');article.className='ecc-card';
  const title=document.createElement('strong');title.textContent=item.title;
  const meta=document.createElement('small');meta.textContent=item.universe+' · '+new Date(item.updated_at).toLocaleString('fr-FR');
  const actions=document.createElement('div');actions.className='ecc-actions';
  const add=(label,fn)=>{const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('click',fn);actions.append(b)};
  add('Reprendre',()=>{const p=by('home-ai-prompt');p.value='Reprends cette création :\n\n'+item.content.slice(0,4500)+'\n\nJe souhaite maintenant : ';p.dispatchEvent(new Event('input',{bubbles:true}));p.focus();p.scrollIntoView({block:'center'});message('Création reprise dans la demande IA.')});
  add('Télécharger',()=>download('eloah-'+item.id+'.txt',item.content));
  add('Supprimer',async()=>{if(!confirm('Supprimer définitivement cette création du cloud ?'))return;try{const c=await auth();const {error:e}=await c.from('eloah_creations').delete().eq('id',item.id).eq('user_id',uid);if(e)throw e;await refresh();message('Création supprimée du cloud.')}catch(e){message('Suppression impossible : '+e.message)}});
  article.append(title,meta,actions);list.append(article);
 }
}
function init(){
 const root=by('eloah-creation-library');if(!root||by('eloah-cloud-creations'))return;
 const el=document.createElement('section');el.id='eloah-cloud-creations';
 el.innerHTML='<h3>Mes créations sur tous mes appareils</h3><p>Connexion fondatrice obligatoire. Tu choisis ce que tu enregistres dans ton espace privé Supabase.</p><div class="ecc-actions"><button type="button" id="ecc-connect">Vérifier ma connexion et afficher mes créations</button><button type="button" id="ecc-save">Enregistrer la dernière réponse dans le cloud</button><a href="eloah-fondatrice.html">Connexion fondatrice ↗</a></div><p id="ecc-status" role="status" aria-live="polite"></p><div id="ecc-list"></div>';
 root.after(el);
 by('ecc-connect').addEventListener('click',async()=>{message('Vérification et chargement…');try{await refresh();message('Créations cloud chargées.')}catch(e){message('Connexion ou lecture impossible : '+e.message)}});
 by('ecc-save').addEventListener('click',async()=>{
  const messages=[...document.querySelectorAll('#home-ai-log .hai-message')];
  const last=[...messages].reverse().find(x=>x.dataset.author==='eloah');
  const content=last?.querySelector('p')?.textContent?.trim();
  if(!content){message('Demande d’abord une création à ELOAH.');return}
  const title=window.prompt('Titre de ta création cloud :','Création ELOAH');
  if(title===null)return;if(!title.trim()){message('Le titre est obligatoire.');return}
  try{
   message('Enregistrement sécurisé…');
   const sdk=await auth();
   const universe=by('home-ai-project')?.value||'ELOAH';
   const {error}=await sdk.from('eloah_creations').insert({user_id:uid,title:title.trim().slice(0,120),content:content.slice(0,120000),universe});
   if(error)throw error;
   await refresh();message('Création enregistrée dans ton espace cloud.');
  }catch(e){message('Échec de l’enregistrement : '+e.message)}
 });
 window.addEventListener('storage',e=>{if(e.key==='eloah-founder-auth-v1'||e.key===null){uid=null;const l=by('ecc-list');if(l)l.replaceChildren();message('Connexion modifiée : vérifie ton compte avant de continuer.')}});
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();