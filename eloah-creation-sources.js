/* Sources selectionnees pour la creation ELOAH : lecture cloud apres authentification. */
(()=>{
'use strict';
const BASE='https://voytsqyorhoveurnguxn.supabase.co',KEY='sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy',FOUNDER='bd4b7197-6401-4a9a-a14e-c6adbdc0ed46';
let references=[],chosen=new Set(),sdk=null;
window.EloahCreationSources={
 context(){return references.filter(x=>chosen.has(x.id)).slice(0,3).map(x=>'Document de reference « '+x.title.slice(0,80)+' » :\n'+x.content.slice(0,1300)).join('\n\n').slice(0,4200)},
 clear(){chosen.clear();references=[];render()}
};
function render(){
 const zone=document.getElementById('ecs-results');if(!zone)return;zone.replaceChildren();
 if(!references.length){zone.textContent='Aucun document chargé.';return}
 for(const x of references){
  const row=document.createElement('label');row.className='ecs-row';const input=document.createElement('input');input.type='checkbox';input.checked=chosen.has(x.id);
  input.addEventListener('change',()=>{if(input.checked){if(chosen.size>=3){input.checked=false;setStatus('Trois références maximum.');return}chosen.add(x.id)}else chosen.delete(x.id);setStatus(chosen.size+' référence(s) choisie(s).')});
  const name=document.createElement('span');name.textContent=x.title+' · '+x.universe;row.append(input,name);zone.append(row)
 }
}
function setStatus(s){const el=document.getElementById('ecs-status');if(el)el.textContent=s}
async function connect(){
 if(!sdk){const m=await import('https://esm.sh/@supabase/supabase-js@2.116.0');sdk=m.createClient(BASE,KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:'eloah-founder-auth-v1'}})}
 const {data,error}=await sdk.auth.getUser();if(error||data?.user?.id!==FOUNDER||data.user.is_anonymous)throw Error('Connecte-toi à ELOAH Fondatrice.');
 return data.user.id;
}
async function load(){
 const btn=document.getElementById('ecs-search');btn.disabled=true;setStatus('Recherche de tes créations…');
 try{
 const id=await connect();const q=document.getElementById('ecs-query').value.trim().toLocaleLowerCase('fr');const project=document.getElementById('home-ai-project')?.value;
 const {data,error}=await sdk.from('eloah_creations').select('id,title,content,universe').eq('user_id',id).order('updated_at',{ascending:false}).limit(100);
 if(error)throw error;
 const matches=(data||[]).filter(x=>(!project||project==='ELOAH'||x.universe===project)&&(!q||(x.title+' '+x.content).toLocaleLowerCase('fr').includes(q))).slice(0,15);
 references=matches;chosen.clear();render();setStatus(matches.length+' création(s) trouvée(s). Sélectionne jusqu’à trois références.');
 }catch(e){references=[];chosen.clear();render();setStatus('Recherche impossible : '+e.message)}
 finally{btn.disabled=false}
}
function init(){
 const ai=document.getElementById('eloah-home-ai');const form=document.getElementById('home-ai-form');if(!ai||!form||document.getElementById('eloah-creation-sources'))return;
 const section=document.createElement('section');section.id='eloah-creation-sources';section.innerHTML='<details><summary>Retrouver mes créations précédentes</summary><p>Cherche dans ta bibliothèque cloud, choisis jusqu’à trois créations comme références. Seuls leurs extraits sélectionnés seront transmis au moteur IA lors de ta demande.</p><div class="ecs-search"><input type="search" id="ecs-query" placeholder="Rechercher un titre ou un sujet" aria-label="Recherche dans mes créations"><button type="button" id="ecs-search">Chercher dans mes créations</button></div><div id="ecs-results"></div><p id="ecs-status" role="status"></p></details>';
 form.before(section);document.getElementById('ecs-search').addEventListener('click',load);
 document.getElementById('home-ai-project')?.addEventListener('change',()=>{window.EloahCreationSources.clear();setStatus('Univers changé : relance la recherche.')});
 render();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();