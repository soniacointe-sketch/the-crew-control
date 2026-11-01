/**
 * ELOAH OS — Skill Factory Phase 1
 * Adaptor lecture seule. Aucun token stocké, aucun secret embarqué.
 * Usage: import {mountSkillFactory} from './eloah-skill-factory.js';
 * mountSkillFactory(document.querySelector('#skill-factory'), async()=> (await supabase.auth.getSession()).data.session?.access_token);
 */
const API="https://aozfylgqjndqaozvfnlj.supabase.co/functions/v1/eloah-skill-factory";
export async function loadSkillFactory(getAccessToken){
 const token=await getAccessToken();
 if(!token)throw new Error("Session ELOAH requise.");
 const response=await fetch(API,{method:"GET",headers:{Authorization:`Bearer ${token}`},cache:"no-store"});
 if(!response.ok)throw new Error(response.status===401?"Session expirée ou invalide.":"Registre momentanément indisponible.");
 return response.json();
}
export async function mountSkillFactory(target,getAccessToken){
 if(!(target instanceof Element))throw new TypeError("Conteneur manquant");
 target.replaceChildren();
 const status=document.createElement("p");status.textContent="Chargement du registre sécurisé…";target.append(status);
 try{
  const payload=await loadSkillFactory(getAccessToken);
  status.textContent="Skill Factory · Phase 1 · Lecture seule · Aucune exécution externe active";
  const list=document.createElement("div");list.className="eloah-skills";
  for(const skill of payload.skills||[]){
   const card=document.createElement("article");card.className="eloah-skill";
   const heading=document.createElement("h3");heading.textContent=skill.definition?.name||skill.slug;
   const meta=document.createElement("p");meta.textContent=`${skill.state} · ${skill.provider_status} · v${skill.version}`;
   card.append(heading,meta);list.append(card);
  }
  target.append(list);
 }catch(err){status.textContent=err?.message||"Impossible de charger les skills.";}
}
