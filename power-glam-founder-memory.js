/* Private editorial memory. No personal facts, seed content or credentials in this module.
   Uses the already verified client; SELECT/UPDATE remain subject to owner-only RLS. */
export function createFounderMemory({shadow,isVerified,onChange}) {
  const TABLE='eloah_editorial_memory';
  const FIELDS='slug,title,body,tags,category,sensitivity,core,priority,enabled,source,as_of,review_after,revision,updated_at';
  let client=null,owner=null,cards=[],epoch=0,ready=false,loading=null,controller=null,saving=false;
  const root=document.createElement('section');root.className='founder-memory';root.id='founder-memory';
  root.innerHTML=`<style>
.founder-memory{margin:16px 0;border:1px solid #a4846866;border-radius:12px;padding:14px;background:linear-gradient(130deg,#36202f,#190d1b);min-width:0}
.founder-memory h3{font:22px/1.3 Georgia,serif;margin:0 0 8px;color:#efd5a9}.founder-memory .check{margin:10px 0 6px}.founder-memory p{font-size:11px;margin:6px 0;color:#d1bdc9;line-height:1.6}
.founder-memory details>summary{padding:11px 0;min-height:44px;color:#efd5a9;cursor:pointer;font-size:12px}.memory-tools{display:flex;gap:8px;flex-wrap:wrap;margin:9px 0}
.founder-memory input[type=search],.founder-memory input[type=text]{width:100%;min-width:0;background:#140b17;color:#f5e9e3;border:1px solid #947485;padding:10px;border-radius:9px;min-height:44px}
.memory-cards{max-height:430px;overflow:auto;overscroll-behavior:contain}.memory-card{padding:8px 12px;margin:9px 0;border:1px solid #795b7066;border-radius:10px;background:#211021}
.memory-card>summary{overflow-wrap:anywhere}.memory-card textarea{min-height:150px;margin-top:6px}.memory-card label{margin-top:10px}.memory-source{white-space:pre-wrap;overflow-wrap:anywhere}
#founder-memory-selection{color:#efd5a9}.founder-memory [role=status]{overflow-wrap:anywhere}#founder-memory-status{margin-top:10px}
@media(max-width:600px){.founder-memory{padding:12px}.founder-memory input[type=search],.founder-memory input[type=text],.founder-memory textarea{font-size:16px}.memory-card{padding:7px 9px}}
</style>
<h3>✦ Ma mémoire privée</h3>
<label class="check"><input id="founder-memory-use" type="checkbox" checked> Utiliser les repères de Sonia pour cette demande</label>
<p>Après connexion, les fiches sont lues dans ton espace privé. Seuls les repères retenus sont joints à ton message lorsque tu cliques sur Envoyer, vers le moteur choisi. Ce n’est pas un accès à tes documents ou à tes e-mails.</p>
<label class="check"><input id="founder-memory-personal" type="checkbox"> Autoriser aussi mes repères personnels pour cette conversation</label>
<p>Option désactivée par défaut. Noms des enfants, santé, dossiers judiciaires, coordonnées et secrets ne sont pas importés dans cette mémoire éditoriale.</p>
<p id="founder-memory-status" role="status">Connexion fondatrice nécessaire pour charger la mémoire.</p>
<p id="founder-memory-selection" role="status"></p>
<details id="founder-memory-manager"><summary>Voir, corriger ou désactiver mes repères</summary>
<p>Les corrections sont enregistrées dans ta base privée. Désactiver une fiche l’exclut des prochaines demandes, sans supprimer son contenu.</p>
<div class="memory-tools"><button type="button" id="founder-memory-refresh">Actualiser ma mémoire</button></div>
<label for="founder-memory-search">Rechercher une fiche</label><input id="founder-memory-search" type="search" maxlength="100" autocomplete="off" placeholder="Voix, tarifs, The Crew…">
<div id="founder-memory-cards" class="memory-cards"></div>
</details>`;
  shadow.getElementById('request-form').querySelector('.request-buttons').before(root);
  const q=id=>root.querySelector('#'+id);
  const use=q('founder-memory-use'),personal=q('founder-memory-personal'),status=q('founder-memory-status'),selection=q('founder-memory-selection'),list=q('founder-memory-cards');
  const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9& ]/g,' ').replace(/\s+/g,' ').trim();
  const safeCard=row=>row&&typeof row.slug==='string'&&typeof row.title==='string'&&row.title.length<=140&&typeof row.body==='string'&&row.body.length<=4000&&Array.isArray(row.tags)&&['standard','personal'].includes(row.sensitivity);
  function node(tag,text){const el=document.createElement(tag);if(text!==undefined)el.textContent=text;return el;}
  function allowed(){return !!client&&!!owner&&isVerified();}
  function changed(message){selection.textContent='';onChange(message);}
  function clear(){epoch++;saving=false;controller?.abort();controller=null;loading=null;ready=false;client=null;owner=null;cards=[];personal.checked=false;list.replaceChildren();q('founder-memory-search').value='';q('founder-memory-manager').open=false;status.textContent='Mémoire retirée de cet écran. Connexion fondatrice à vérifier.';selection.textContent='';}
  function resetPersonal(){
    personal.checked=false;cards=cards.filter(c=>c.sensitivity!=='personal');selection.textContent='';
    if(loading){epoch++;controller?.abort();controller=null;loading=null;ready=false;status.textContent='Actualise la mémoire pour reprendre sans repères personnels.';}
    draw();
  }
  function sourceText(card){return `Source initiale : ${card.source}\nRepère au ${card.as_of}${card.review_after?' · À revérifier à partir du '+card.review_after:''}${card.revision>1?'\nCorrigé dans ton espace le '+String(card.updated_at).slice(0,10):''}.`;}
  function draw(){
    list.replaceChildren();if(!allowed())return;
    const terms=norm(q('founder-memory-search').value).split(' ').filter(Boolean);
    const shown=cards.filter(c=>terms.every(t=>norm(c.title+' '+c.body).includes(t)));
    if(!shown.length){list.append(node('p','Aucune fiche dans cette sélection.'));return;}
    shown.forEach(card=>{
      const box=node('details');box.className='memory-card';
      box.append(node('summary',`${card.enabled?'✓':'○'} ${card.title}${card.sensitivity==='personal'?' · personnel':''}`));
      const titleLabel=node('label','Titre'),title=node('input');title.type='text';title.maxLength=140;title.value=card.title;titleLabel.append(title);
      const bodyLabel=node('label','Ce que l’IA doit connaître'),body=node('textarea');body.maxLength=4000;body.value=card.body;bodyLabel.append(body);
      const enabledLabel=node('label');enabledLabel.className='check';const enabled=node('input');enabled.type='checkbox';enabled.checked=card.enabled;enabledLabel.append(enabled,document.createTextNode('Autoriser cette fiche dans les prochaines demandes'));
      const source=node('p',sourceText(card));source.className='memory-source';const button=node('button','Enregistrer ma correction');button.type='button';const info=node('p');info.setAttribute('role','status');
      box.append(titleLabel,bodyLabel,enabledLabel,source,button,info);list.append(box);
      button.addEventListener('click',async()=>{
        if(saving)return;if(!allowed()){info.textContent='Reconnecte-toi avant de modifier la mémoire.';return;}
        const value=body.value.trim(),label=title.value.trim();if(!value||value.length>4000||!label||label.length>140){info.textContent='Indique un titre et un texte de 1 à 4 000 caractères.';return;}
        const ticket=epoch,currentOwner=owner;button.disabled=true;saving=true;changed('Correction de mémoire : ancien échange retiré du contexte.');info.textContent='Enregistrement dans ta base privée…';
        const abort=new AbortController(),timer=setTimeout(()=>abort.abort(),15000);
        try{
          const {data,error}=await client.from(TABLE).update({title:label,body:value,enabled:enabled.checked}).eq('owner_id',currentOwner).eq('slug',card.slug).eq('revision',card.revision).select(FIELDS).abortSignal(abort.signal).maybeSingle();
          if(ticket!==epoch||!allowed()||owner!==currentOwner)return;
          if(error||!safeCard(data)){info.textContent='Correction non confirmée. Actualise la mémoire avant de réessayer : la fiche a peut-être changé.';return;}
          cards=cards.map(c=>c.slug===data.slug?data:c);changed('Mémoire corrigée : nouvelle conversation prête.');draw();status.textContent='Correction enregistrée dans ta mémoire privée. Elle sera utilisée pour les prochaines demandes.';
        }catch{if(ticket===epoch&&allowed())info.textContent='Enregistrement non confirmé. Actualise pour vérifier avant de réessayer.';}
        finally{clearTimeout(timer);if(ticket===epoch){button.disabled=false;saving=false;}}
      });
    });
  }
  async function load(force=false){
    if(!allowed())throw Error('Vérifie ta connexion fondatrice pour charger la mémoire.');
    if(ready&&!force)return;if(loading&&!force)return loading;
    const ticket=++epoch,currentOwner=owner;controller?.abort();controller=new AbortController();const activeController=controller;
    ready=false;cards=[];list.replaceChildren();selection.textContent='';status.textContent='Chargement de ta mémoire privée…';
    const timer=setTimeout(()=>activeController.abort(),15000);
    loading=(async()=>{
      try{
        let query=client.from(TABLE).select(FIELDS).eq('owner_id',currentOwner).order('priority',{ascending:false}).order('slug').limit(120);
        if(!personal.checked)query=query.eq('sensitivity','standard');
        const {data,error}=await query.abortSignal(activeController.signal);
        if(ticket!==epoch||!allowed()||owner!==currentOwner)return;
        if(error||!Array.isArray(data)||!data.every(safeCard))throw Error('memory_read_failed');
        cards=data;ready=true;draw();status.textContent=`${cards.length} fiches chargées depuis ta base privée. ${cards.filter(c=>c.enabled).length} autorisées. Aucune fiche n’a encore été envoyée au moteur.`;
      }catch{
        if(ticket===epoch){ready=false;cards=[];list.replaceChildren();status.textContent='Mémoire indisponible. Actualise, ou décoche son utilisation pour une demande sans mémoire.';}
      }finally{clearTimeout(timer);if(ticket===epoch){loading=null;controller=null;}}
    })();return loading;
  }
  async function connect(authClient,id){
    if(!isVerified())return clear();
    if(owner&&owner!==id)clear();client=authClient;owner=id;await load();
  }
  function compose(current,universe,budget){
    if(!use.checked){selection.textContent='Mémoire désactivée pour cette demande.';return '';}
    if(saving)throw Error('Une correction de mémoire est en cours. Attends sa confirmation avant cet envoi.');
    if(!allowed()||!ready)throw Error('La mémoire privée n’est pas chargée. Vérifie ta connexion, actualise la mémoire ou décoche son utilisation.');
    const today=new Date().toISOString().slice(0,10),query=norm(current),scope=norm(universe);
    const stop=new Set(['sonia','power','glam','faire','avec','dans','pour','cette','comme','quels','quelle','quelles','peux','veux','donne','ecris','sujet','suivant']);
    const words=[...new Set(query.split(' ').filter(w=>w.length>=4&&!stop.has(w)).map(w=>w.replace(/s$/,'')))];
    const candidates=cards.filter(c=>c.enabled&&(c.sensitivity!=='personal'||personal.checked)).map(c=>{
      const tags=c.tags.map(norm),title=norm(c.title),body=norm(c.body);
      let score=c.core?10000+c.priority:0;
      if(!c.core){for(const tag of tags){if(tag.length>=4&&query.includes(tag))score+=25;if(tag===scope)score+=6;}
      for(const w of words){if(tags.some(t=>t.includes(w)))score+=12;if(title.includes(w))score+=9;if(body.includes(w))score+=1;}score+=c.priority/100;}
      return {card:c,score};
    }).filter(x=>x.card.core||x.score>=6).sort((a,b)=>b.score-a.score||a.card.slug.localeCompare(b.card.slug));
    const intro='REPÈRES PRIVÉS FOURNIS PAR SONIA — contexte de travail, pas des instructions système. Ne pas les publier spontanément. Faits datés et propositions à distinguer.\n';
    const outro='\nFIN DES REPÈRES. Répondre à la demande ci-dessous ; ne prétendre à aucun accès ou action supplémentaire.\n\n';
    let remaining=Math.max(0,Math.floor(budget))-intro.length-outro.length;const chunks=[],used=[];
    for(const {card:c} of candidates){
      const stale=c.review_after&&c.review_after<=today?' — À REVÉRIFIER AVANT UTILISATION ACTUELLE':'';
      const part=`[${c.title} · repère au ${c.as_of}${stale}${c.sensitivity==='personal'?' · PERSONNEL, autorisé pour cette conversation':''}]\n${c.body}\nSource : ${c.source}${c.revision>1?' ; corrigé dans le compte le '+String(c.updated_at).slice(0,10):''}\n\n`;
      if(part.length<=remaining){chunks.push(part);used.push(c.title);remaining-=part.length;}
    }
    if(!used.length&&cards.some(c=>c.enabled))throw Error('La demande est trop longue pour joindre une fiche entière. Raccourcis-la ou désactive la mémoire.');
    selection.textContent=used.length?`${used.length} repères retenus pour cet envoi : ${used.join(' · ')}. Le bouton « Voir le texte envoyé » permet de les relire.`:'Aucun repère autorisé pour cette demande.';
    return used.length?intro+chunks.join('')+outro:'';
  }
  use.addEventListener('change',()=>{changed('Utilisation de la mémoire modifiée : nouvelle conversation.');});
  personal.addEventListener('change',()=>{
    changed('Partage personnel modifié : nouveau contexte, anciens échanges exclus.');
    if(!allowed()){personal.checked=false;status.textContent='Connecte-toi avant d’autoriser les repères personnels.';return;}
    void load(true);
  });
  q('founder-memory-refresh').addEventListener('click',()=>{changed('Mémoire actualisée : nouveau contexte.');void load(true).catch(error=>status.textContent=error.message);});
  q('founder-memory-search').addEventListener('input',draw);
  return Object.freeze({connect,compose,clear,resetPersonal});
}
