/* Offline DOM smoke test for the real ELOAH creation studio.
   No API calls, no user account, no external packages. */
'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const nodes=new Map();
class Element {
 constructor(tag='div'){this.tag=tag;this.value='';this.children=[];this.listeners={};this.attributes={};this.textContent='';this._innerHTML='';}
 set innerHTML(text){
  this._innerHTML=String(text);
  for(const m of this._innerHTML.matchAll(/\bid="([^"]+)"/g)){
   if(!nodes.has(m[1]))nodes.set(m[1],new Element());
  }
  nodes.get('ef-format').value='post';
  nodes.get('ef-intent').value='auto';
 }
 get innerHTML(){return this._innerHTML;}
 querySelector(selector){return selector.startsWith('#')?nodes.get(selector.slice(1))||null:null;}
 querySelectorAll(){return [];}
 append(...els){this.children.push(...els);}
 appendChild(el){this.append(el);return el;}
 after(el){if(el.id)nodes.set(el.id,el);}
 before(el){if(el.id)nodes.set(el.id,el);}
 replaceChildren(...els){this.children=els;this.textContent='';}
 addEventListener(name,cb){(this.listeners[name] ||= []).push(cb);}
 dispatchEvent(evt){for(const cb of this.listeners[evt.type]||[])cb(evt);return true;}
 getAttribute(key){return this.attributes[key]??null;}
 setAttribute(key,value){this.attributes[key]=value;}
 focus(){this.focused=true;}
 scrollIntoView(){this.scrolled=true;}
}
for(const id of ['eloah-home-ai','home-ai-prompt','home-ai-project','home-ai-form','eloah-create-choices','home-ai-log','home-ai-status']){
 nodes.set(id,new Element());
}
const form=nodes.get('home-ai-form');
form.submits=0;form.requestSubmit=()=>{form.submits++};
const document={
 readyState:'complete',head:new Element('head'),
 getElementById:id=>nodes.get(id)||null,
 createElement:tag=>new Element(tag),
 addEventListener:()=>{}
};
const sandbox={
 document,window:{},navigator:{onLine:true},
 MutationObserver:class{observe(){}},
 Event:class{constructor(type){this.type=type;}},
 setTimeout:fn=>{fn();return 1},
 console
};
vm.runInNewContext(fs.readFileSync('eloah-cdsqcd-evidence.js','utf8'),sandbox,{timeout:1500});
vm.runInNewContext(fs.readFileSync('eloah-livrable-studio.js','utf8'),sandbox,{timeout:1500});
const subject=nodes.get('ef-subject'),intent=nodes.get('ef-intent'),format=nodes.get('ef-format'),prompt=nodes.get('home-ai-prompt'),prepare=nodes.get('ef-prepare'),preflight=nodes.get('ef-preflight');
assert.ok(prepare?.listeners?.click?.length===1,'Studio button must be wired');
const click=()=>prepare.dispatchEvent({type:'click'});
subject.value='cdsqcd';intent.value='auto';click();
assert.equal(form.submits,0,'Ambiguous idea must never be sent without clarification');
assert.ok(preflight.children.some(x=>String(x.textContent).includes('refuse d inventer')),'Clarification explanation must be visible');
subject.value='RGPD';subject.dispatchEvent({type:'input'});click();
assert.equal(form.submits,1,'Known acronym must not be erroneously blocked');
assert.match(prompt.value,/SUJET : RGPD/);
subject.value='cdsqcd';subject.dispatchEvent({type:'input'});intent.value='concept';click();
assert.equal(form.submits,2,'Explicit fictional concept should be accepted');
assert.match(prompt.value,/CONCEPT À INVENTER/);
subject.value='cdsqcd';subject.dispatchEvent({type:'input'});intent.value='test';click();
assert.equal(form.submits,2,'Test mode must never spend an AI call');
subject.value='cdsqcd';subject.dispatchEvent({type:'input'});intent.value='real';click();
assert.equal(form.submits,2,'Unexplained real-world pseudoacronym must be blocked');
assert.ok(subject.focused);
subject.value='Une enquête sur les violences psychologiques';
subject.dispatchEvent({type:'input'});intent.value='auto';format.value='dossier';click();
assert.equal(form.submits,3,'Clearly described dossier should go to the existing assistant');
assert.match(prompt.value,/LIVRABLE ATTENDU/);
assert.match(prompt.value,/PROCÉDURE CDSQCD/);
assert.ok(!prompt.value.includes('conforme ISO 27001'), 'No fabricated confirmation should be injected');
console.log('ELOAH Studio DOM: ambiguous, RGPD, concept, test, real and dossier flows OK.');
