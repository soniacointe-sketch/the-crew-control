(()=>{'use strict';
const $=id=>document.getElementById(id),esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const status=t=>$('status').textContent=t;
if(!window.supabase){status('Connexion indisponible. Recharge la page pour réessayer.');return}
const db=supabase.createClient('https://voytsqyorhoveurnguxn.supabase.co','sb_publishable_WrZkFoX6rrC3CLjasrn1VQ_lB4pr6gy',{auth:{storageKey:'eloah-student-auth-v1',detectSessionInUrl:true}});
let user=null,courses=[],loading=false;
async function refresh(){if(loading)return;loading=true;try{
 const {data:identity,error:authError}=await db.auth.getUser();user=authError?null:identity.user;
 $('auth').hidden=!!user;$('account').hidden=!user;$('identity').textContent=user?.email||'';$('lessons').replaceChildren();$('registrations').replaceChildren();
 const {data,error}=await db.from('eloah_training_courses').select('id,title,universe,description,price_cents,currency,sales_open,session_details').eq('visible',true);if(error)throw error;courses=data;
 $('catalog').innerHTML=courses.map(c=>'<article class="card"><p class="tag">'+esc(c.universe)+'</p><h2>'+esc(c.title)+'</h2><p>'+esc(c.description)+'</p><p class="price">'+esc(new Intl.NumberFormat('fr-FR',{style:'currency',currency:c.currency}).format(c.price_cents/100))+'</p><p>'+esc(c.session_details)+'</p><button data-request="'+esc(c.id)+'">'+(user?'Enregistrer ma demande':'Me connecter pour demander une place')+'</button><p class="muted">Ventes fermées pour le moment. Une demande ne vaut ni réservation confirmée ni paiement.</p></article>').join('');
 if(user){const {data:registrations,error:rError}=await db.from('eloah_training_registrations').select('course_id,state,created_at').eq('user_id',user.id);if(rError)throw rError;
 const labels={requested:'Demande enregistrée · en attente d’ouverture',paid:'Paiement confirmé',granted:'Accès accordé',refunded:'Remboursé · accès fermé',cancelled:'Annulé'};
 $('registrations').innerHTML=registrations.length?registrations.map(r=>'<article class="card"><h3>'+esc(courses.find(c=>c.id===r.course_id)?.title||r.course_id)+'</h3><p>'+esc(labels[r.state]||r.state)+'</p>'+(['paid','granted'].includes(r.state)?'<button data-course="'+esc(r.course_id)+'">Ouvrir mon cours</button>':'')+'</article>').join(''):'<p>Aucune demande enregistrée sur ce compte.</p>';
 }status('');
}catch(e){status('Impossible de charger les formations. Réessaie dans un instant.')}finally{loading=false}}
$('login').onsubmit=async e=>{e.preventDefault();const button=e.target.querySelector('button');button.disabled=true;try{const {error}=await db.auth.signInWithOtp({email:$('email').value.trim(),options:{shouldCreateUser:true,emailRedirectTo:location.origin+location.pathname}});if(error)throw error;status('Demande envoyée. Vérifie ta messagerie et les courriers indésirables.')}catch(e){status('Le lien n’a pas pu être envoyé. Vérifie ton adresse ou réessaie plus tard.')}finally{button.disabled=false}};
$('logout').onclick=async()=>{const {error}=await db.auth.signOut();if(error){status('Déconnexion impossible. Réessaie.');return}await refresh()};$('refresh').onclick=refresh;
$('catalog').onclick=async e=>{const b=e.target.closest('[data-request]');if(!b)return;if(!user){$('email').focus();$('auth').scrollIntoView({behavior:'smooth'});return}b.disabled=true;try{const {error}=await db.from('eloah_training_registrations').insert({user_id:user.id,course_id:b.dataset.request});if(error&&error.code!=='23505')throw error;await refresh();status('Ta demande est enregistrée. Aucun paiement effectué.')}catch(e){status('Demande non enregistrée. Réessaie.')}finally{b.disabled=false}};
$('registrations').onclick=async e=>{const b=e.target.closest('[data-course]');if(!b)return;b.disabled=true;try{const {data,error}=await db.from('eloah_training_lessons').select('title,body,position').eq('course_id',b.dataset.course).order('position');if(error)throw error;$('lessons').innerHTML=data.length?data.map(l=>'<article class="card"><h2>'+esc(l.title)+'</h2><pre>'+esc(l.body)+'</pre></article>').join(''):'<p>Les supports ne sont pas encore disponibles pour ce compte.</p>';}catch(e){status('Impossible d’ouvrir le cours. Actualise tes accès.')}finally{b.disabled=false}};
db.auth.onAuthStateChange(()=>{setTimeout(refresh,0)});refresh();
})();
