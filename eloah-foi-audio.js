(()=>{
'use strict';
function init(){
if(document.getElementById('faith-audio'))return;
const root=document.querySelector('#article,#book,#view');if(!root)return;
const box=document.createElement('section');box.id='faith-audio';box.innerHTML='<small>VERSION AUDIO · LECTURE DU TEXTE</small><h2>Écouter le texte</h2><p>Lecture avec une voix française de votre appareil.</p><div class="fa-options"><label>Chapitre<select data-chapter></select></label><label>Voix<select data-voice></select></label><label>Tonalité<select data-pitch><option value=".85">Grave</option><option value="1" selected>Naturelle</option><option value="1.15">Claire</option></select></label><label>Vitesse<select data-rate><option value=".8">0,8×</option><option value="1" selected>1×</option><option value="1.15">1,15×</option><option value="1.3">1,3×</option></select></label></div><div class="fa-buttons"><button data-action="play">▶ Écouter</button><button data-action="pause">⏸ Pause</button><button data-action="resume">↪ Reprendre</button><button data-action="stop">■ Arrêter</button><button data-action="prev">↶ Passage précédent</button><button data-action="next">Passage suivant ↷</button><button data-action="restart">↻ Repartir du début</button></div><p role="status" aria-live="polite">Choisis un chapitre ou écoute tout le texte.</p>';
root.before(box);
const css=document.createElement('style');css.textContent='#faith-audio{background:#fffdf9;color:#30291f;border:1px solid #c5ac85;border-radius:14px;padding:clamp(16px,3vw,25px);margin:20px 0;font:15px/1.6 system-ui}#faith-audio h2{font:30px Georgia,serif;margin:10px 0}#faith-audio .fa-options,#faith-audio .fa-buttons{display:flex;flex-wrap:wrap;gap:10px;margin:14px 0}#faith-audio label{display:flex;flex-direction:column;gap:5px;min-width:110px;flex:1}#faith-audio select{width:100%;min-width:0;max-width:100%;padding:10px;background:white;color:#30291f;border:1px solid #d8cbb9;border-radius:8px;font:inherit}#faith-audio button{background:#f4efe7;color:#30291f;border:1px solid #c5ac85;border-radius:8px;padding:10px;font:inherit;cursor:pointer}#faith-audio button:disabled{opacity:.45;cursor:default}#faith-audio :focus-visible{outline:3px solid #987744;outline-offset:3px}#faith-audio [role=status]{font-size:13px}@media(max-width:600px){#faith-audio label{flex-basis:100%}#faith-audio button{flex:1 1 42%}}';document.head.append(css);
const get=s=>box.querySelector(s),chapter=get('[data-chapter]'),voice=get('[data-voice]'),pitch=get('[data-pitch]'),rate=get('[data-rate]'),status=get('[role=status]');
if(!window.speechSynthesis){status.textContent='Lecture vocale indisponible dans ce navigateur.';box.querySelectorAll('button,select').forEach(b=>b.disabled=true);return;}
const synth=window.speechSynthesis;let voices=[],sections=[],queue=[],position=0,token=0,state='idle',utterance;
function buttons(){get('[data-action=pause]').disabled=state!=='playing';get('[data-action=resume]').disabled=state!=='paused';get('[data-action=stop]').disabled=state==='idle';get('[data-action=prev]').disabled=!queue.length||position===0;get('[data-action=next]').disabled=!queue.length||position>=queue.length-1;}
function cancel(){token++;synth.cancel();state='idle';buttons();}
function loadVoices(){const old=voice.value;voices=synth.getVoices().filter(v=>/^fr/i.test(v.lang)).sort((a,b)=>score(b)-score(a));voice.replaceChildren(new Option('Meilleure voix française disponible','auto'));voices.forEach(v=>voice.add(new Option(v.name+' · '+v.lang+(v.localService?' · locale':''),v.voiceURI)));if(voices.some(v=>v.voiceURI===old))voice.value=old;}
function score(v){return (/natural|neural|premium|enhanced/i.test(v.name)?100:0)+(/Google/i.test(v.name)?20:0)+(/fr-FR/i.test(v.lang)?5:0);}
loadVoices();synth.addEventListener('voiceschanged',loadVoices);
function collect(){
cancel();queue=[];sections=[{title:'Lire tout le texte',texts:[]}];let current=null;
const nodes=[...root.querySelectorAll('h1,h2,h3,p,li,blockquote,td,th,summary')];
nodes.forEach(n=>{if(n.closest('button,nav,textarea,[hidden],.hide,[data-noaudio]')||!n.getClientRects().length)return;if(n.matches('p,li,blockquote')&&n.querySelector('p,li,blockquote'))return;
const t=n.textContent.replace(/\s+/g,' ').trim();if(!t)return;
if(n.matches('h1,h2,h3')){current={title:t,texts:[]};sections.push(current);}
sections[0].texts.push(t);if(current)current.texts.push(t);
});
const personal=document.getElementById('personal-items');if(personal)personal.querySelectorAll('details').forEach(d=>{const title=d.querySelector('summary')?.textContent.trim();const texts=[...d.querySelectorAll('summary,p')].map(n=>n.textContent.trim());if(title)sections.push({title,texts});});
chapter.replaceChildren();sections.forEach((s,i)=>chapter.add(new Option(s.title,String(i))));status.textContent='Choisis un chapitre ou écoute tout le texte.';buttons();
}
function prepare(){const texts=sections[Number(chapter.value)]?.texts||[];queue=[];for(const t of texts){const words=t.split(/\s+/);let part='';for(const w of words){if(part.length+w.length>230){queue.push(part);part='';}part+=(part?' ':'')+w;}if(part)queue.push(part);}position=0;}
function speak(){if(!queue.length){status.textContent='Aucun texte à lire pour le moment.';return;}cancel();state='playing';buttons();const run=token;status.textContent='Lecture · passage '+(position+1)+' sur '+queue.length;utterance=new SpeechSynthesisUtterance(queue[position]);utterance.lang='fr-FR';utterance.voice=voices.find(v=>v.voiceURI===voice.value)||voices[0]||null;utterance.rate=Number(rate.value);utterance.pitch=Number(pitch.value);
utterance.onend=()=>{if(run!==token)return;if(position<queue.length-1){position++;speak();}else{state='idle';status.textContent='Lecture terminée · '+queue.length+' passages.';buttons();}};
utterance.onerror=e=>{if(run!==token||['canceled','interrupted'].includes(e.error))return;cancel();status.textContent='Lecture interrompue. Appuie sur Écouter pour réessayer.';};synth.speak(utterance);}
box.addEventListener('click',e=>{const action=e.target.closest('[data-action]')?.dataset.action;if(!action)return;
if(action==='play'){if(!queue.length)prepare();speak();}
if(action==='restart'){prepare();speak();}
if(action==='stop'){cancel();queue=[];position=0;status.textContent='Lecture arrêtée.';buttons();}
if(action==='pause'&&state==='playing'){synth.pause();state='paused';status.textContent='Pause · passage '+(position+1)+' sur '+queue.length;buttons();}
if(action==='resume'&&state==='paused'){synth.resume();state='playing';status.textContent='Lecture · passage '+(position+1)+' sur '+queue.length;buttons();}
if(action==='prev'||action==='next'){if(!queue.length)prepare();position=Math.max(0,Math.min(queue.length-1,position+(action==='next'?1:-1)));speak();}
});
chapter.onchange=()=>{cancel();queue=[];status.textContent='Chapitre sélectionné. Appuie sur Écouter.';buttons();};
[voice,rate,pitch].forEach(select=>select.onchange=()=>{if(state==='playing')speak();});
collect();let timer;new MutationObserver(()=>{clearTimeout(timer);timer=setTimeout(collect,150);}).observe(root,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden']});
window.addEventListener('pagehide',cancel);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();