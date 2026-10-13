(()=>{'use strict';
if(new URLSearchParams(location.search).get('rubrique')!=='Mailing')return;
const root=document.getElementById('mailing-dashboard');if(!root)return;
const existing=document.getElementById('eloah-resend-campaign-control');if(existing)existing.remove();
const section=document.createElement('section');section.id='eloah-resend-campaign-control';
section.style.cssText='background:#fff;color:#242426;border:1px solid #ddd6cd;border-radius:12px;padding:20px;margin:18px 0';
section.innerHTML='<h2 style="font:28px Georgia,serif">Newsletters · ELOAH vers Resend</h2><p>Prépare le texte ici, puis vérifie les contacts et envoie depuis Resend. Aucun envoi collectif ne part depuis cet écran.</p><div style="display:grid;gap:12px"><label>Liste <select id="erc-brand" style="display:block;padding:10px;width:100%"><option>The Crew Orchies</option><option>Power &amp; Glam</option><option>Le Lion Blanc</option></select></label><label>Objet <input id="erc-subject" maxlength="180" style="display:block;padding:10px;width:100%"></label><label>Texte d’aperçu <input id="erc-preview" maxlength="150" style="display:block;padding:10px;width:100%"></label><label>Newsletter <textarea id="erc-body" rows="10" style="display:block;padding:10px;width:100%"></textarea></label><div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" id="erc-view">Aperçu</button><button type="button" id="erc-copy">Copier le contenu</button><button type="button" id="erc-save">Créer un brouillon Resend (The Crew)</button><a href="https://resend.com/broadcasts" target="_blank" rel="noopener noreferrer">Ouvrir mes campagnes Resend ↗</a></div><div id="erc-preview-panel" hidden style="white-space:pre-wrap;background:#faf7f2;padding:18px;border:1px solid #ddd"></div><p id="erc-link"></p><p id="erc-status" role="status"></p></div>';
root.append(section);
const q=id=>section.querySelector('#'+id),brand=q('erc-brand'),subject=q('erc-subject'),body=q('erc-body'),preview=q('erc-preview'),status=q('erc-status');
const endpoint='https://voytsqyorhoveurnguxn.supabase.co/functions/v1/eloah-mailing-resend',pub='sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy';
const knownDraft='https://resend.com/broadcasts/e3c0ee44-6bb5-4de2-9ceb-d48c0754662d';
let busy=false;
function buttons(){q('erc-save').disabled=busy||brand.value!=='The Crew Orchies';q('erc-save').textContent=brand.value==='The Crew Orchies'?'Créer un brouillon Resend (The Crew)':'Préparer dans ELOAH, puis ouvrir Resend';}
brand.addEventListener('change',buttons);
q('erc-view').onclick=()=>{q('erc-preview-panel').hidden=false;q('erc-preview-panel').textContent=brand.value+'\n\n'+subject.value+'\n\n'+body.value};
q('erc-copy').onclick=async()=>{try{await navigator.clipboard.writeText('Objet : '+subject.value+'\nAperçu : '+preview.value+'\n\n'+body.value);status.textContent='Newsletter copiée. Colle-la dans l’éditeur Resend.'}catch{status.textContent='Copie indisponible sur cet appareil.'}};
q('erc-save').onclick=async()=>{if(busy||brand.value!=='The Crew Orchies')return;if(subject.value.trim().length<3||body.value.trim().length<20){status.textContent='Renseigne un objet et un contenu avant de créer le brouillon.';return}
busy=true;buttons();status.textContent='Création du brouillon…';
try{if(!window.supabase?.createClient)throw Error('Connexion ELOAH indisponible');const client=window.supabase.createClient('https://voytsqyorhoveurnguxn.supabase.co',pub,{auth:{persistSession:true,autoRefreshToken:true}});const auth=await client.auth.getSession();const token=auth.data?.session?.access_token;if(!token)throw Error('Connecte-toi à ton compte ELOAH.');
const res=await fetch(endpoint,{method:'POST',headers:{Authorization:'Bearer '+token,apikey:pub,'Content-Type':'application/json'},body:JSON.stringify({action:'broadcast-create',brand:brand.value,subject:subject.value,body:body.value,preview:preview.value})});const data=await res.json();if(!res.ok||!data.id)throw Error(data.error||'Brouillon refusé');
const a=document.createElement('a');a.href='https://resend.com/broadcasts/'+encodeURIComponent(data.id);a.target='_blank';a.rel='noopener noreferrer';a.textContent='Vérifier et envoyer ce brouillon dans Resend ↗';q('erc-link').replaceChildren(a);status.textContent='Brouillon enregistré. Aucune diffusion effectuée.';
}catch(e){status.textContent=e.message||'Brouillon non enregistré.'}finally{busy=false;buttons()}};
buttons();
})();