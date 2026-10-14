(() => {
  "use strict";
  const PROJECT = "https://voytsqyorhoveurnguxn.supabase.co";
  const PUBLIC_KEY = "sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy";
  const FOUNDER = "bd4b7197-6401-4a9a-a14e-c6adbdc0ed46";
  const ENDPOINT = PROJECT + "/functions/v1/eloah-founder-crm";
  const stageNames = {nouveau:"Nouveau",a_contacter:"À contacter",en_cours:"En cours",suivi:"Suivi",clos:"Clos"};
  const planNames = {decouverte:"Découverte",entree:"Entrée",partenaire:"Partenaire"};
  const entitlementNames = {active:"Actif",inactive:"Inactif",past_due:"Paiement à vérifier",canceled:"Résilié"};
  const state = {accounts:[],summary:null,page:1,hasMore:false,selected:null,busy:false};
  const el = id => document.getElementById(id);
  const make = (tag,text,className) => {
    const node=document.createElement(tag);
    if(text!==undefined)node.textContent=String(text);
    if(className)node.className=className;
    return node;
  };
  let supabase;
  function notify(text,kind="info"){
    el("notice").textContent=text;
    el("notice").dataset.kind=kind;
  }
  function date(value){
    if(!value)return "—";
    const d=new Date(value);
    return Number.isNaN(d.valueOf())?"—":d.toLocaleDateString("fr-FR",{day:"2-digit",month:"short",year:"numeric"});
  }
  function showGate(text){
    el("auth-gate").hidden=false;
    el("auth-gate-text").textContent=text||"Reconnecte-toi comme fondatrice dans ce navigateur pour voir les comptes.";
    el("session-indicator").textContent="Connexion requise";
    state.accounts=[];state.summary=null;renderAll();
  }
  function hideGate(){
    el("auth-gate").hidden=true;
    el("session-indicator").textContent="Fondatrice connectée";
  }
  function switchView(name){
    for(const n of ["overview","accounts","entitlements","payments","followups","settings"]){
      const selected=n===name;
      el("view-"+n).hidden=!selected;
      const btn=document.querySelector('[data-tab="'+n+'"]');
      if(btn){btn.classList.toggle("active",selected);btn.setAttribute("aria-current",selected?"page":"false");}
    }
    const headings={overview:"Vue d’ensemble",accounts:"Comptes & fiches",entitlements:"Abonnements",payments:"Paiements",followups:"Accompagnement",settings:"Réglages"};
    el("section-title").textContent=headings[name]||"Vue d’ensemble";
    if(name==="accounts")renderAccounts();
    if(name==="entitlements")renderEntitlements();
    if(name==="followups")renderFollowups();
  }
  async function signedInToken(){
    if(!supabase)throw new Error("Connexion Supabase indisponible");
    const {data,error}=await supabase.auth.getSession();
    if(error||!data?.session?.access_token)throw new Error("Session expirée. Reconnecte-toi comme fondatrice.");
    return data.session.access_token;
  }
  async function request(method,body,page){
    const token=await signedInToken();
    const url=ENDPOINT+(method==="GET"?"?page="+(page||1):"");
    const res=await fetch(url,{
      method,headers:{"apikey":PUBLIC_KEY,"Authorization":"Bearer "+token,"Content-Type":"application/json"},
      body:body?JSON.stringify(body):undefined,cache:"no-store"
    });
    const data=await res.json().catch(()=>({}));
    if(!res.ok){
      if(res.status===401||res.status===403)showGate("Ta session administrateur est expirée ou n'a pas les droits nécessaires.");
      throw new Error(data.error||"Impossible de charger les données");
    }
    return data;
  }
  async function refresh(){
    if(state.busy)return;
    state.busy=true;
    el("refresh").disabled=true;
    notify("Vérification de ta session…");
    try{
      if(!supabase)throw new Error("La bibliothèque de connexion n’est pas disponible");
      const {data,error}=await supabase.auth.getUser();
      if(error||data?.user?.id!==FOUNDER){showGate("Ouvre d’abord ELOAH Fondatrice dans ce même navigateur, puis reviens ici.");notify("Aucune donnée privée affichée.","warn");return;}
      hideGate();
      const payload=await request("GET",null,1);
      state.accounts=payload.accounts||[];
      state.summary=payload.summary||null;
      state.page=1;
      state.hasMore=!!payload.has_more;
      el("updated-at").textContent="Actualisé le "+new Date().toLocaleString("fr-FR",{day:"2-digit",month:"short",hour:"2-digit",minute:"2-digit"});
      renderAll();notify("Données mises à jour depuis Supabase.","ok");
    }catch(e){notify(e.message||"Chargement impossible.","error");}
    finally{state.busy=false;el("refresh").disabled=false;}
  }
  async function nextPage(){
    if(state.busy||!state.hasMore)return;
    state.busy=true;el("next-page").disabled=true;
    try{
      const payload=await request("GET",null,state.page+1);
      const known=new Set(state.accounts.map(a=>a.id));
      state.accounts.push(...(payload.accounts||[]).filter(a=>!known.has(a.id)));
      state.page=payload.page||state.page+1;state.hasMore=!!payload.has_more;
      renderAll();notify("Comptes supplémentaires chargés.","ok");
    }catch(e){notify(e.message,"error")}
    finally{state.busy=false;el("next-page").disabled=false}
  }
  function setMetric(id,value){
    el(id).textContent=value===null||value===undefined?"—":new Intl.NumberFormat("fr-FR").format(value);
  }
  function renderMetrics(){
    const stats=state.summary;
    setMetric("metric-accounts",stats?state.accounts.length:null);
    setMetric("metric-workspaces",stats?.workspaces);
    setMetric("metric-active",stats?.active_entitlements);
    setMetric("metric-items",stats?.workspace_items);
    el("metric-revenue").textContent="À relier";
    el("accounts-disclaimer").textContent=stats?
      "Comptes hors fondatrice affichés, y compris tests. Aucun chiffre ne prouve à lui seul une vente.":
      "Connecte-toi pour afficher les informations réelles.";
    el("entitlement-help").textContent=stats?
      stats.paid_plan_entitlements+" droit(s) actif(s) sur les formules payantes enregistrées — ce ne sont pas des paiements Stripe vérifiés.":
      "Les abonnements apparaîtront après connexion.";
    el("billing-state").textContent="Paiements ELOAH non reliés à Stripe";
  }
  function filteredAccounts(){
    const term=el("account-search").value.trim().toLocaleLowerCase("fr-FR");
    const filter=el("account-filter").value;
    return state.accounts.filter(a=>{
      const text=(a.email||"").toLocaleLowerCase("fr-FR");
      if(term&&!text.includes(term)&&!a.id.toLowerCase().includes(term))return false;
      if(filter==="active"&&a.entitlement?.status!=="active")return false;
      if(filter==="without"&&a.entitlement)return false;
      if(filter==="attention"&&!["a_contacter","en_cours"].includes(a.followup?.stage))return false;
      return true;
    });
  }
  function openAccount(id){
    const account=state.accounts.find(a=>a.id===id);
    if(!account)return;
    state.selected=id;
    el("detail-email").textContent=account.email||"Compte sans e-mail";
    el("detail-date").textContent="Inscrit le "+date(account.created_at);
    el("detail-last").textContent="Dernière connexion : "+date(account.last_sign_in_at);
    el("detail-workspaces").textContent=(account.workspace_count||0)+" espace(s) · "+(account.item_count||0)+" élément(s)";
    el("detail-plan").textContent=account.entitlement?((planNames[account.entitlement.plan]||account.entitlement.plan)+" · "+(entitlementNames[account.entitlement.status]||account.entitlement.status)):"Aucun droit enregistré";
    el("follow-stage").value=account.followup?.stage||"nouveau";
    el("follow-next").value=account.followup?.next_action||"";
    el("follow-notes").value=account.followup?.internal_notes||"";
    el("follow-status").textContent=account.followup?.updated_at?"Modifié le "+date(account.followup.updated_at):"Aucun suivi enregistré";
    el("detail-overlay").hidden=false;
    document.body.classList.add("drawer-open");
    el("detail-close").focus();
  }
  function closeAccount(){
    el("detail-overlay").hidden=true;
    document.body.classList.remove("drawer-open");
    state.selected=null;
  }
  async function saveFollowup(event){
    event.preventDefault();
    const account=state.accounts.find(a=>a.id===state.selected);
    if(!account)return;
    const stage=el("follow-stage").value;
    const next_action=el("follow-next").value.trim();
    const internal_notes=el("follow-notes").value.trim();
    if(next_action.length>280||internal_notes.length>2000){el("follow-status").textContent="Texte trop long.";return;}
    el("follow-save").disabled=true;el("follow-status").textContent="Enregistrement sécurisé…";
    try{
      const result=await request("POST",{action:"save_followup",customer_id:account.id,stage,next_action,internal_notes});
      account.followup=result.saved;
      el("follow-status").textContent="Enregistré le "+date(result.saved.updated_at);
      renderAll();notify("Le suivi a été enregistré dans Supabase.","ok");
    }catch(e){el("follow-status").textContent=e.message;notify(e.message,"error")}
    finally{el("follow-save").disabled=false}
  }
  function renderAccounts(){
    const body=el("account-rows");body.replaceChildren();
    const list=filteredAccounts();
    el("account-count").textContent=list.length+" compte(s) affiché(s)";
    for(const a of list){
      const tr=make("tr");
      const tdEmail=make("td");const btn=make("button",a.email||"Sans e-mail","account-open");btn.type="button";btn.addEventListener("click",()=>openAccount(a.id));tdEmail.append(btn);
      tr.append(tdEmail,make("td",date(a.created_at)),make("td",(a.workspace_count||0)+" espace(s)"));
      const tdPlan=make("td",a.entitlement?planNames[a.entitlement.plan]||a.entitlement.plan:"Sans formule");
      const tdStage=make("td",stageNames[a.followup?.stage||"nouveau"]);
      const tdAction=make("td");const open=make("button","Ouvrir →","small-link");open.type="button";open.addEventListener("click",()=>openAccount(a.id));tdAction.append(open);
      tr.append(tdPlan,tdStage,tdAction);body.append(tr);
    }
    if(!list.length){const tr=make("tr");const cell=make("td",state.summary?"Aucun compte ne correspond à cette recherche.":"Les comptes seront affichés après connexion.");cell.colSpan=6;cell.className="empty-cell";tr.append(cell);body.append(tr);}
    el("next-page").hidden=!state.hasMore;
  }
  function renderEntitlements(){
    const body=el("entitlement-rows");body.replaceChildren();
    const accounts=state.accounts.filter(a=>!!a.entitlement);
    el("entitlement-count").textContent=accounts.length+" compte(s) avec droits enregistrés";
    for(const a of accounts){
      const tr=make("tr");tr.append(make("td",a.email||"Compte sans e-mail"),make("td",planNames[a.entitlement.plan]||a.entitlement.plan),make("td",entitlementNames[a.entitlement.status]||a.entitlement.status),make("td",date(a.entitlement.updated_at)));
      body.append(tr);
    }
    if(!accounts.length){const tr=make("tr");const td=make("td",state.summary?"Aucun droit enregistré dans la base ELOAH.":"Connexion requise.");td.colSpan=4;td.className="empty-cell";tr.append(td);body.append(tr)}
  }
  function renderFollowups(){
    const list=el("followup-list");list.replaceChildren();
    const tracked=state.accounts.filter(a=>a.followup && (a.followup.next_action||a.followup.internal_notes||a.followup.stage!=="nouveau"));
    const waiting=tracked.filter(a=>["a_contacter","en_cours"].includes(a.followup.stage)).length;
    el("followups-count").textContent=tracked.length+" suivi(s) enregistrés · "+waiting+" à traiter";
    for(const a of tracked){
      const card=make("article",undefined,"follow-card");
      card.append(make("strong",a.email||"Compte sans e-mail"),make("span",stageNames[a.followup.stage]||a.followup.stage,"tag"),make("p",a.followup.next_action||"Aucune prochaine action définie"));
      const btn=make("button","Ouvrir la fiche →","small-link");btn.type="button";btn.addEventListener("click",()=>openAccount(a.id));card.append(btn);list.append(card);
    }
    if(!tracked.length)list.append(make("p",state.summary?"Aucun suivi enregistré. Ouvre une fiche client pour créer le premier.":"Connexion requise pour consulter les suivis.","empty-state"));
  }
  function renderRecent(){
    const box=el("recent-list");box.replaceChildren();
    const newest=state.accounts.slice().sort((a,b)=>new Date(b.created_at)-new Date(a.created_at)).slice(0,4);
    if(!newest.length){box.append(make("p",state.summary?"Aucun autre compte enregistré pour le moment.":"Les derniers comptes apparaîtront après connexion.","empty-state"));return}
    for(const a of newest){
      const row=make("button",undefined,"recent-account");row.type="button";
      const title=make("span",a.email||"Compte sans e-mail");
      const info=make("small",date(a.created_at));
      row.append(title,info);row.addEventListener("click",()=>openAccount(a.id));box.append(row);
    }
  }
  function renderAll(){renderMetrics();renderAccounts();renderEntitlements();renderFollowups();renderRecent();}
  function bind(){
    document.querySelectorAll("[data-tab]").forEach(button=>button.addEventListener("click",()=>switchView(button.dataset.tab)));
    document.querySelectorAll("[data-go]").forEach(button=>button.addEventListener("click",()=>switchView(button.dataset.go)));
    el("refresh").addEventListener("click",refresh);
    el("auth-retry").addEventListener("click",refresh);
    el("account-search").addEventListener("input",renderAccounts);
    el("account-filter").addEventListener("change",renderAccounts);
    el("next-page").addEventListener("click",nextPage);
    el("detail-close").addEventListener("click",closeAccount);
    el("detail-overlay").addEventListener("click",e=>{if(e.target===el("detail-overlay"))closeAccount()});
    window.addEventListener("keydown",e=>{if(e.key==="Escape"&&!el("detail-overlay").hidden)closeAccount()});
    el("followup-form").addEventListener("submit",saveFollowup);
  }
  bind();
  renderAll();
  if(!window.supabase?.createClient){showGate("Le module de connexion n'a pas chargé. Réessaie ou ouvre ELOAH Fondatrice.");notify("Connexion Supabase indisponible.","error");return;}
  supabase=window.supabase.createClient(PROJECT,PUBLIC_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:"eloah-founder-auth-v1"}});
  supabase.auth.onAuthStateChange(event=>{
    if(event==="SIGNED_OUT")showGate("Session terminée. Reconnecte-toi à ELOAH Fondatrice.");
  });
  refresh();
})();