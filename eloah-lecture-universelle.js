/* ELOAH universal read-aloud — on-demand, no external service or data transfer. */
(()=>{'use strict';
if(window.__eloahReaderInstalled||document.getElementById('lecture-audio')||document.querySelector('script[src*="eloah-foi-audio"]'))return;
window.__eloahReaderInstalled=true;
const engine=window.speechSynthesis;if(!engine||!window.SpeechSynthesisUtterance)return;
const style=document.createElement('style');
style.textContent=`
#eloahReadOpen{position:fixed;right:18px;bottom:18px;z-index:9000;background:#365e53;color:#fff;border:1px solid #d6c5ac;border-radius:99px;padding:11px 17px;box-shadow:0 5px 22px #0002;font:600 13px system-ui;cursor:pointer}
#eloahReadBox{position:fixed;right:18px;bottom:76px;z-index:9001;max-width:min(410px,calc(100vw - 24px));width:390px;background:#fffdf9;color:#302b24;border:1px solid #d8c6af;border-radius:16px;box-shadow:0 15px 45px #0003;padding:17px;font:13px/1.5 system-ui}
#eloahReadBox[hidden],#eloahReadOpen[hidden]{display:none!important}
#eloahReadBox h2{font:24px Georgia,serif;margin:2px 0 10px}#eloahReadBox label{display:grid;gap:4px;font-size:12px;margin-bottom:8px}
#eloahReadBox select{padding:9px;border-radius:8px;border:1px solid #dacbb9;background:#faf7f1;width:100%;color:#333}
#eloahReadBox .reader-actions{display:flex;flex-wrap:wrap;gap:7px}
#eloahReadBox button{padding:9px;border-radius:8px;border:1px solid #d6c5af;cursor:pointer;background:#eee6da;color:#302b24}
#eloahReadBox button:disabled{opacity:.4}#eloahReadBox .reader-actions button:first-child{background:#365e53;color:white}
#eloahReadBox progress{width:100%;height:9px;accent-color:#365e53}
.eloah-reader-highlight{outline:2px solid #ac8850;outline-offset:3px;background:#fff1d7!important}
@media(max-width:600px){#eloahReadBox{left:12px;right:12px;bottom:68px;width:auto;max-height:75dvh;overflow:auto}#eloahReadOpen{bottom:12px;right:12px}}
`;document.head.appendChild(style);
const open=document.createElement('button');open.id='eloahReadOpen';open.type='button';open.textContent='♫ Écouter cette page';document.body.appendChild(open);
const panel=document.createElement('section');panel.id='eloahReadBox';panel.hidden=true;panel.setAttribute('aria-label','Lecture vocale ELOAH');
panel.innerHTML='<div style="display:flex;justify-content:space-between;align-items:center"><div><small>VERSION AUDIO · LECTURE DU TEXTE</small><h2>Écouter le texte</h2></div><button type="button" id="eloahReadClose" aria-label="Fermer le lecteur">✕</button></div><label>Chapitre<select id="eloahReadChapter"><option value="">Lire tout le texte</option></select></label><label>Tonalité<select id="eloahReadPitch"><option value="0.85">Grave</option><option value="1" selected>Naturelle</option><option value="1.15">Claire</option></select></label><label>Voix française<select id="eloahReadVoice"><option value="">Automatique</option></select></label><label>Vitesse<select id="eloahReadRate"><option value="0.8">Douce · 0,8×</option><option value="1" selected>Normale · 1×</option><option value="1.15">Rapide · 1,15×</option><option value="1.3">1,3×</option></select></label><div class="reader-actions"><button type="button" id="eloahReadPlay">▶ Lire</button><button type="button" id="eloahReadPause" disabled>⏸ Pause</button><button type="button" id="eloahReadResume" disabled>↪ Reprendre</button><button type="button" id="eloahReadStop" disabled>■ Arrêter</button><button type="button" id="eloahReadPrev">↶ Passage précédent</button><button type="button" id="eloahReadNext">Passage suivant ↷</button><button type="button" id="eloahReadRestart">↻ Repartir du début</button></div><progress id="eloahReadProgress" value="0" max="100"></progress><p id="eloahReadStatus" role="status" aria-live="polite">Prêt à lire le contenu principal.</p><small>Utilise les voix disponibles sur cet appareil. La disponibilité et la qualité des voix dépendent de votre appareil.</small>';
document.body.appendChild(panel);
const q=id=>document.getElementById(id),voice=q('eloahReadVoice'),rate=q('eloahReadRate'),status=q('eloahReadStatus'),progress=q('eloahReadProgress');
const chapter=q('eloahReadChapter'),pitch=q('eloahReadPitch');let headings=[];
let voices=[],segments=[],at=0,enabled=false,gen=0,mark=null,mode='idle';
function score(v){return (/natural|neural|premium|enhanced/i.test(v.name)?12:0)+(v.lang.toLowerCase()==='fr-fr'?3:0)+(/Google/i.test(v.name)?5:0);}
function voicesUpdate(){let selected=voice.value;voices=engine.getVoices().filter(x=>/^fr/i.test(x.lang)).sort((a,b)=>score(b)-score(a));voice.replaceChildren(new Option('Meilleure voix disponible',''));voices.forEach(v=>voice.add(new Option((score(v)>10?'★ ':'')+v.name+' · '+v.lang+(v.localService?' · locale':''),v.voiceURI)));if(voices.some(v=>v.voiceURI===selected))voice.value=selected;}
voicesUpdate();engine.addEventListener?.('voiceschanged',voicesUpdate);
function buttons(){q('eloahReadPlay').disabled=mode==='playing'||mode==='paused';q('eloahReadPause').disabled=mode!=='playing';q('eloahReadResume').disabled=mode!=='paused';q('eloahReadStop').disabled=mode==='idle';}
function unmark(){if(mark){mark.classList.remove('eloah-reader-highlight');mark=null;}}
function stop(){enabled=false;gen++;engine.cancel();unmark();mode='idle';buttons();}
function getContent(){let container=document.querySelector('[data-eloah-readable]')||document.querySelector('#docContent,.document-content,.markdown-body,.reading-content,main,article')||document.body;
const exclude='nav,aside,footer,header,button,form,script,style,select,textarea,input,#eloahReadBox,#eloahReadOpen,[hidden],.toolbar';
let els=[...container.querySelectorAll('h1,h2,h3,h4,p,li,blockquote')].filter(el=>!el.closest(exclude)&&el.getClientRects().length&&el.innerText.trim().length>0&&!el.querySelector('p,li,blockquote'));
headings=els.filter(el=>/^H[1-4]$/.test(el.tagName));const selected=chapter.value;chapter.replaceChildren(new Option('Lire tout le texte',''));headings.forEach((h,i)=>chapter.add(new Option(h.innerText,String(i))));if(selected!==''&&headings[Number(selected)]){chapter.value=selected;const begin=els.indexOf(headings[Number(selected)]),level=Number(headings[Number(selected)].tagName[1]);let end=els.findIndex((e,i)=>i>begin&&/^H[1-4]$/.test(e.tagName)&&Number(e.tagName[1])<=level);els=els.slice(begin,end<0?undefined:end);}const out=[];for(const el of els){let txt=el.innerText.replace(/\s+/g,' ').trim(),sent=txt.match(/[^.!?;:…]+[.!?;:…]?/g)||[txt],buf='';for(const v of sent){if((buf+v).length>210&&buf.trim()){out.push({text:buf.trim(),el});buf='';}buf+=v;if(buf.length>115){out.push({text:buf.trim(),el});buf='';}}if(buf.trim())out.push({text:buf.trim(),el});}return out;}
function update(){progress.value=segments.length?Math.round(at/segments.length*100):0;}
function speak(g){if(!enabled||g!==gen)return;if(at>=segments.length){stop();status.textContent='Lecture terminée.';progress.value=100;return;}let part=segments[at];unmark();mark=part.el;mark.classList.add('eloah-reader-highlight');let utter=new SpeechSynthesisUtterance(part.text);utter.lang='fr-FR';utter.rate=Number(rate.value);utter.pitch=Number(pitch.value);utter.voice=voices.find(v=>v.voiceURI===voice.value)||voices[0]||null;utter.onend=()=>{if(!enabled||gen!==g)return;at++;update();speak(g)};utter.onerror=e=>{if(gen!==g||['canceled','interrupted'].includes(e.error))return;stop();status.textContent='Lecture interrompue : '+e.error;};engine.speak(utter);mode='playing';buttons();status.textContent='Passage '+(at+1)+' / '+segments.length;update();}
function start(n){stop();segments=getContent();if(!segments.length){status.textContent='Aucun texte lisible trouvé sur cette page.';return;}at=Math.max(0,Math.min(n,segments.length-1));enabled=true;speak(gen);}
open.onclick=()=>{panel.hidden=!panel.hidden;if(!panel.hidden){segments=getContent();status.textContent=segments.length?'Prêt · '+segments.length+' passages à écouter.':'Aucun texte lisible détecté.';}else stop();};
q('eloahReadClose').onclick=()=>{stop();panel.hidden=true;};
q('eloahReadPlay').onclick=()=>start(at);q('eloahReadPause').onclick=()=>{if(enabled){engine.pause();mode='paused';buttons();status.textContent='En pause.';}};
q('eloahReadResume').onclick=()=>{if(enabled){engine.resume();mode='playing';buttons();}};
q('eloahReadStop').onclick=()=>{stop();status.textContent='Arrêté.';};
q('eloahReadRestart').onclick=()=>start(0);chapter.onchange=()=>{stop();at=0;segments=getContent();status.textContent='Chapitre prêt · '+segments.length+' passages.';};pitch.onchange=()=>{if(enabled)start(at);};
q('eloahReadPrev').onclick=()=>start(at-1);q('eloahReadNext').onclick=()=>start(at+1);
rate.onchange=()=>{if(enabled)start(at);};voice.onchange=()=>{if(enabled)start(at);};
window.addEventListener('pagehide',stop);
})();

/* Power & Glam 2040 visual layer: appearance only. */
(()=>{'use strict';
 const apply=()=>{
  if(location.pathname.split('/').pop()!=='power-glam-control.html'||document.getElementById('power-glam-2040-theme'))return;
  document.body.classList.add('power-glam-2040');
  const meta=document.querySelector('meta[name="theme-color"]');if(meta)meta.setAttribute('content','#160912');
  const link=document.createElement('link');link.id='power-glam-2040-theme';link.rel='stylesheet';link.href='power-glam-2040.css?v=20261015';document.head.append(link);
  const cockpit=document.createElement('link');cockpit.id='power-glam-2040-cockpit-theme';cockpit.rel='stylesheet';cockpit.href='power-glam-2040-cockpit.css?v=20261015';document.head.append(cockpit);
  const polish=document.createElement('link');polish.rel='stylesheet';polish.href='power-glam-2040-workspace.css?v=20261015-2';document.head.append(polish);
  const controls=document.createElement('script');controls.src='power-glam-2040-workspace.js?v=20261015-2';controls.defer=true;document.head.append(controls);
  const intelligence=document.createElement('script');intelligence.type='module';intelligence.src='power-glam-intelligence.js?v=20261016-maison';document.head.append(intelligence);
 };
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',apply,{once:true});else apply();
})();