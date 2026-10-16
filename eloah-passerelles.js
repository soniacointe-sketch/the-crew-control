import {createClient} from "https://esm.sh/@supabase/supabase-js@2.116.0";
const BASE="https://voytsqyorhoveurnguxn.supabase.co",KEY="sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy",FOUNDER="bd4b7197-6401-4a9a-a14e-c6adbdc0ed46";
const $=id=>document.getElementById(id),client=createClient(BASE,KEY,{auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:false,storageKey:"eloah-founder-auth-v1"}});
let owner=null,revision=0,conversations=[],chosen=null,busy=false;
const status=(s,id="auth-status")=>{$(id).textContent=s;};
function clearPrivate(){revision++;owner=null;conversations=[];chosen=null;for(const id of ["connections-count","models-count","automations-count"])$(id).textContent="—";for(const [id,t] of [["memory-list","Connecte-toi pour consulter tes univers."],["connector-list","Connexion requise."],["automation-list","Connexion requise."],["model-list","Connexion requise."]]){$(id).replaceChildren();$(id).textContent=t;} $("import-controls").hidden=true;$("import-file").value="";$("import-preview").value="";$("import-confirm").checked=false;for(const id of ["export-json","export-md","import-save"])$(id).disabled=true;}
function ensureOwner(){if(owner!==FOUNDER)throw Error("Une session ELOAH Fondatrice vérifiée est nécessaire.");}
const clean=x=>typeof x==="string"?x:"";
function addEntry(el,title,subtitle,label,good=false){const row=document.createElement("div"),left=document.createElement("span"),right=document.createElement("div");row.className="entry";left.textContent=title;if(subtitle){const small=document.createElement("small");small.textContent=subtitle;right.append(small);}if(label){const chip=document.createElement("span");chip.className="chip "+(good?"ok":"warn");chip.textContent=label;right.append(chip);}row.append(left,right);el.append(row);}
async function loadTable(name,fields,limit){ensureOwner();const {data,error}=await client.from(name).select(fields).eq("owner_id",FOUNDER).limit(limit);if(error)throw Error("Lecture refusée : "+name);return data||[];}
async function readAllMemories(){return await loadTable("eloah_agent_memory","universe,content,updated_at",100);}
async function refreshRegisters(ticket){
 const tasks=[["eloah_agent_memory","universe,updated_at","memory-list",30],["sonia_os_connections","provider,status","connector-list",60],["sonia_os_model_registry","provider,model_key,label,active","model-list",100],["sonia_os_automations","name,status,approval_mode","automation-list",50]];
 const res=await Promise.allSettled(tasks.map(t=>loadTable(t[0],t[1],t[3])));
 if(ticket!==revision||owner!==FOUNDER)return;
 let failed=0;
 res.forEach((v,i)=>{const box=$(tasks[i][2]);box.replaceChildren();if(v.status==="rejected"){box.textContent="Registre inaccessible.";failed++;return;}const data=v.value;if(!data.length){box.textContent="Aucune donnée référencée.";return;}
  if(i===0)for(const x of data)addEntry(box,x.universe,new Date(x.updated_at).toLocaleDateString("fr-FR"),"Enregistrée",true);
  if(i===1){const seen=new Map();for(const x of data){const p=clean(x.provider)||"inconnu";const item=seen.get(p)||{n:0,states:new Set()};item.n++;item.states.add(clean(x.status)||"inconnu");seen.set(p,item);}for(const [key,value] of seen)addEntry(box,key.replaceAll("_"," "),value.n+" entrée(s)","Déclaré : "+[...value.states].join(", "));$("connections-count").textContent=data.length;}
  if(i===2){const models=new Map();for(const x of data)models.set(x.provider+"/"+x.model_key,x);for(const x of models.values())addEntry(box,x.label||x.model_key,x.provider,x.active?"Actif dans le registre · non testé":"Inactif");$("models-count").textContent=models.size;}
  if(i===3){for(const x of data)addEntry(box,x.name,"Validation : "+(x.approval_mode||"non précisée"),"Statut déclaré : "+x.status);$("automations-count").textContent=data.length;}
 });
 status(failed?"Session vérifiée. "+failed+" registre(s) indisponible(s).":"Session fondatrice vérifiée · lecture seule, aucune action externe exécutée.");
}
async function verify(){
 const ticket=++revision;$("refresh").disabled=true;status("Vérification de la session…");
 try{const {data,error}=await client.auth.getUser();if(ticket!==revision)return;if(error||data?.user?.id!==FOUNDER){clearPrivate();status(data?.user?.id?"Ce compte n'est pas le compte fondatrice.":"Connecte-toi dans ELOAH Fondatrice puis reviens ici.");return;}owner=FOUNDER;for(const id of ["export-json","export-md"])$(id).disabled=false;updateSave();await refreshRegisters(ticket);}
 catch{if(ticket===revision){clearPrivate();status("Impossible de vérifier ta session, données privées non affichées.");}}
 finally{$("refresh").disabled=false;}
}
function download(payload,name,type){const src=URL.createObjectURL(new Blob([payload],{type})),a=document.createElement("a");a.href=src;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(src),1500);}
async function exportData(kind){
 try{ensureOwner();status("Lecture des mémoires…","export-status");const rows=await readAllMemories();if(!rows.length){status("Aucune mémoire enregistrée.","export-status");return;}
 if(kind==="json"){download(JSON.stringify({format:"eloah-memoires-v1",exported_at:new Date().toISOString(),memories:rows},null,2),"eloah-memoires-export.json","application/json;charset=utf-8");}
 else{const md="# Mémoires ELOAH\n\n"+rows.map(x=>"## "+x.universe+"\n\nMise à jour : "+x.updated_at+"\n\n"+x.content+"\n").join("\n---\n\n");download(md,"eloah-memoires-export.md","text/markdown;charset=utf-8");}
 status(rows.length+" mémoire(s) exportée(s). Fichier privé non chiffré : conserve-le en lieu sûr.","export-status");
 }catch(e){status(e.message,"export-status");}
}
$("export-json").onclick=()=>exportData("json");$("export-md").onclick=()=>exportData("md");
function messagesFrom(conv){
 if(conv?.mapping&&typeof conv.mapping==="object"){
  const map=conv.mapping,list=[];if(conv.current_node&&map[conv.current_node]){const seen=new Set();let node=conv.current_node;while(node&&map[node]&&!seen.has(node)&&list.length<300){seen.add(node);list.push(map[node]);node=map[node].parent;}list.reverse();}
  else list.push(...Object.values(map).filter(Boolean).sort((a,b)=>(a?.message?.create_time||0)-(b?.message?.create_time||0)).slice(-300));
  return list.map(x=>x.message).filter(Boolean).map(m=>{const role=m?.author?.role;if(!["user","assistant"].includes(role))return null;const parts=Array.isArray(m?.content?.parts)?m.content.parts:[];const t=parts.map(p=>typeof p==="string"?p:(typeof p?.text==="string"?p.text:"")).filter(Boolean).join("\n");return t.trim()?{role,text:t.slice(0,4000)}:null;}).filter(Boolean);
 }
 if(Array.isArray(conv?.messages))return conv.messages.map(m=>{const role=m?.role||m?.author?.role,t=typeof m?.content==="string"?m.content:clean(m?.text);return ["user","assistant"].includes(role)&&t?{role,text:t.slice(0,4000)}:null;}).filter(Boolean);
 return [];
}
function preview(index){
 const c=conversations[index];chosen=c||null;$("import-confirm").checked=false;
 if(!c){updateSave();return;}
 const items=messagesFrom(c);const title=clean(c.title)||"Sans titre";const body=["Conversation : "+title,"Source : export ChatGPT sélectionné et relu par la fondatrice",...items.map(x=>(x.role==="user"?"Demande : ":"Réponse : ")+x.text)].join("\n\n");
 $("import-preview").value=body.slice(0,5800);status(items.length+" message(s) textuel(s) repérés. Extrait limité à 5 800 caractères, à relire.","import-status");updateSave();
}
function updateSave(){$("import-save").disabled=busy||owner!==FOUNDER||!chosen||!$("import-confirm").checked||!$("import-preview").value.trim();}
$("import-conversation").onchange=e=>preview(Number(e.target.value));
$("import-confirm").onchange=updateSave;
$("import-preview").oninput=()=>{$("import-confirm").checked=false;updateSave();};
$("import-universe").onchange=()=>{$("import-confirm").checked=false;updateSave();};
$("import-file").onchange=async e=>{
 conversations=[];chosen=null;$("import-controls").hidden=true;$("import-confirm").checked=false;updateSave();
 const f=e.target.files?.[0];if(!f){status("Aucun fichier sélectionné.","import-summary");return;}
 if(f.size>8*1024*1024||!f.name.toLowerCase().endsWith(".json")){status("Sélectionne conversations.json extrait du ZIP ChatGPT, taille maximale 8 Mo.","import-summary");return;}
 try{const value=JSON.parse(await f.text());const list=Array.isArray(value)?value:(Array.isArray(value?.conversations)?value.conversations:null);
 if(!list)throw Error("Liste de conversations ChatGPT non reconnue.");
 conversations=list.filter(x=>x&&typeof x==="object").sort((a,b)=>(b.update_time||0)-(a.update_time||0)).slice(0,350);
 if(!conversations.length)throw Error("Aucune conversation exploitable.");
 const select=$("import-conversation");select.replaceChildren();conversations.forEach((c,i)=>{const opt=document.createElement("option");opt.value=String(i);opt.textContent=(clean(c.title)||"Conversation sans titre").slice(0,120);select.append(opt);});
 $("import-controls").hidden=false;preview(0);status(conversations.length+" conversation(s) lue(s) localement. Rien n'a été envoyé.","import-summary");
 }catch(e){conversations=[];status("Import refusé : "+e.message,"import-summary");}
};
$("import-clear").onclick=()=>{conversations=[];chosen=null;$("import-file").value="";$("import-preview").value="";$("import-controls").hidden=true;$("import-confirm").checked=false;status("Fichier retiré de l'écran.","import-summary");status("","import-status");updateSave();};
$("import-save").onclick=async()=>{
 if(busy)return;const text=$("import-preview").value.trim(),universe=$("import-universe").value;
 if(!chosen||!$("import-confirm").checked||!text||text.length>6000){status("Relis et confirme l'extrait.","import-status");return;}
 busy=true;updateSave();status("Contrôle de la mémoire cloud…","import-status");
 try{ensureOwner();const {data:auth,error:authError}=await client.auth.getUser();if(authError||auth?.user?.id!==FOUNDER)throw Error("Session expirée.");
 const {data:row,error:readError}=await client.from("eloah_agent_memory").select("content").eq("owner_id",FOUNDER).eq("universe",universe).maybeSingle();
 if(readError)throw Error("Impossible de consulter la mémoire existante. Aucun enregistrement.");
 const next=[row?.content?.trim(),text].filter(Boolean).join("\n\n---\n\n");
 if(next.length>6000)throw Error("La mémoire dépasserait 6 000 caractères. Réduis le texte ; aucune donnée effacée.");
 const {data:result,error}=await client.from("eloah_agent_memory").upsert({owner_id:FOUNDER,universe,content:next,updated_at:new Date().toISOString()},{onConflict:"owner_id,universe"}).select("universe").single();
 if(error||!result)throw Error("Le serveur n'a pas confirmé l'enregistrement.");
 status("Extrait ajouté à la mémoire cloud « "+universe+" ». Aucun message envoyé à une IA.","import-status");
 $("import-confirm").checked=false;await refreshRegisters(revision);
 }catch(e){status(e.message,"import-status");}finally{busy=false;updateSave();}
};
$("refresh").onclick=verify;
client.auth.onAuthStateChange(event=>{if(event==="SIGNED_OUT"){clearPrivate();status("Déconnectée : les données privées ont été retirées de l'écran.");}});
window.addEventListener("pagehide",clearPrivate);
verify();
