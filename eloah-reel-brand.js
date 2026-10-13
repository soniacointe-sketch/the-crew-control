(()=>{
'use strict';
/* Bibliothèque de marques ELOAH — identités propres, sans emprunt d'assets Canva. */
const KEY='eloah_reel_brand_kits_v1';
const defaults=[
 {id:'power-glam',name:'Power & Glam',tagline:'Maison éditoriale',colors:[['Crème','#F4EFE7'],['Noir','#111111'],['Rouge signature','#D32027'],['Amour','#A63D57'],['Beauté','#C98E9A'],['Argent','#28705A'],['Vie','#789477'],['Désir','#D7654F']],heading:'bodoni',body:'inter',accent:'caveat',signature:'POWER & GLAM',voice:'Éditorial, naturel, adulte et nuancé. Dire les choses sans formules artificielles.',doText:'Photographies sensibles, titres précis, fond crème et hiérarchie simple.',dontText:'Éviter les textes publicitaires impersonnels et l’accumulation de slogans.'},
 {id:'the-crew',name:'The Crew Orchies',tagline:'Danse et collectif',colors:[['Noir','#171717'],['Or','#D0AA56'],['Crème','#F6E9CF'],['Blanc','#FFFFFF'],['Gris','#555555']],heading:'poster',body:'sans',signature:'THE CREW ORCHIES',voice:'Naturel, chaleureux, énergique et accessible. Un message depuis le téléphone.',doText:'Dire les informations essentielles, rappeler que tous les niveaux sont accueillis.',dontText:'Ne pas présenter les cours comme de la Zumba et éviter les slogans empilés.'},
 {id:'sonia-velka',name:'Sonia Velka',tagline:'Identité artistique',colors:[['Prune','#401D32'],['Or','#C7A15E'],['Crème','#FFF0DC'],['Noir','#191619'],['Rose sombre','#A65A71']],heading:'poster',body:'classic',signature:'SONIA VELKA',voice:'Puissance, liberté, mystère et humour mordant. Direct, sans être lisse.',doText:'Privilégier les portraits authentiques et les textes qui ont une voix personnelle.',dontText:'Éviter les clichés tout faits et les portraits IA présentés comme réels.'},
 {id:'eloah',name:'ELOAH',tagline:'Studio et espace de création',colors:[['Bleu','#1688BE'],['Turquoise','#07999F'],['Marine','#203A61'],['Crème','#F4EFE7'],['Blanc','#FFFFFF']],heading:'sans',body:'sans',signature:'ELOAH STUDIO',voice:'Clair, utile et créatif. Privilégier des commandes compréhensibles.',doText:'Présenter les outils et leur résultat réel.',dontText:'Ne pas annoncer de fonctionnalités non branchées.'},
 {id:'lion-blanc',name:'Le Lion Blanc',tagline:'Association citoyenne',colors:[['Noir','#161616'],['Blanc','#FFFFFF'],['Rouge','#B63E43'],['Crème','#F3EDE5'],['Gris','#767676']],heading:'poster',body:'sans',signature:'LE LION BLANC',voice:'Citoyen, exigeant, humain, clair et factuel.',doText:'Des messages responsables et compréhensibles.',dontText:'Ne pas présenter une opinion comme un fait vérifié.'},
 {id:'parisis',name:'PARISIS Engine',tagline:'Enquêtes et patrimoine',colors:[['Encre','#21292D'],['Pierre','#C9BC9C'],['Parchemin','#F4F0E5'],['Bleu-gris','#597B8C'],['Or','#AA8A4D']],heading:'classic',body:'editorial',signature:'PARISIS ENGINE',voice:'Documenté, prudent, précis. Distinguer hypothèses et faits sourcés.',doText:'Nommer les archives, sources, datations et incertitudes.',dontText:'Ne pas transformer une correspondance en preuve sans vérification.'}
];
const families=['sans','rounded','editorial','classic','poster','hand','mono','condensed','bodoni','inter','caveat'];
const validColor=s=>/^#[0-9a-fA-F]{6}$/.test(String(s||''))?String(s).toUpperCase():null;
const validImageData=(value,maxLength=750000)=>typeof value==='string'&&value.length<=maxLength&&
 /^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/i.test(value);
const copy=o=>JSON.parse(JSON.stringify(o));
const normalizeName=s=>String(s||'').trim().slice(0,80);
const slug=s=>normalizeName(s).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,55)||'nouvelle-marque';
const safeFamily=s=>families.includes(s)?s:'sans';
function normalize(raw,base=null){
 const baseData=base||{id:'user-'+slug(raw?.name||'Marque'),name:'Ma marque',tagline:'Identité personnalisée',colors:[['Principale','#171717'],['Secondaire','#F4EFE7'],['Accent','#D0AA56']],heading:'editorial',body:'sans',signature:'MA MARQUE',voice:'',doText:'',dontText:''};
 const out={...copy(baseData),id:String(raw?.id||baseData.id).slice(0,90),name:normalizeName(raw?.name||baseData.name),
 tagline:String(raw?.tagline??baseData.tagline).slice(0,125),signature:String(raw?.signature??baseData.signature).slice(0,110),
 heading:safeFamily(raw?.heading||baseData.heading),body:safeFamily(raw?.body||baseData.body),accent:safeFamily(raw?.accent||baseData.accent||'hand'),
 voice:String(raw?.voice??baseData.voice).slice(0,1400),doText:String(raw?.doText??baseData.doText).slice(0,1400),
 dontText:String(raw?.dontText??baseData.dontText).slice(0,1400)};
 const colors=Array.isArray(raw?.colors)?raw.colors:baseData.colors;
 out.colors=colors.slice(0,12).map((item,i)=>{
  const v=Array.isArray(item)?item:[item?.name,item?.hex];
  return [normalizeName(v[0]||'Couleur '+(i+1)),validColor(v[1])||'#777777'];
 }).filter(x=>x[0]);if(!out.colors.length)out.colors=copy(baseData.colors);
 out.logo=validImageData(raw?.logo)?raw.logo:null;
 out.assets=Array.isArray(raw?.assets)?raw.assets.slice(0,36).map(item=>({
  id:String(item?.id||'').slice(0,100),name:normalizeName(item?.name||'Ressource'),
  category:['photos','illustrations','icons'].includes(item?.category)?item.category:'photos',
  data:validImageData(item?.data,650000)?item.data:''
 })).filter(item=>item.id&&item.data):[];
 out.models=Array.isArray(raw?.models)?raw.models.slice(0,25).map(item=>({
  id:String(item?.id||'').slice(0,100),name:normalizeName(item?.name||'Modèle'),
  elements:Array.isArray(item?.elements)?copy(item.elements.slice(0,60).filter(x=>x&&typeof x==='object'&&!['image','photoFrame'].includes(x.kind))):[]
 })).filter(m=>m.id):[];
 return out;
}
let kits=defaults.map(seed=>normalize(seed,seed));
try{
 const raw=JSON.parse(localStorage.getItem(KEY)||'null');
 if(Array.isArray(raw)&&raw.length){
  const override=new Map(raw.filter(x=>x&&typeof x.id==='string').map(x=>[x.id,x]));
  kits=defaults.map(seed=>normalize(override.get(seed.id)||seed,seed));
  for(const custom of raw){if(custom?.id&&!defaults.some(d=>d.id===custom.id)&&kits.length<24)kits.push(normalize(custom))}
 }
}catch(e){console.warn('Impossible de lire les identités visuelles ELOAH',e)}
function save(){try{localStorage.setItem(KEY,JSON.stringify(kits));return {ok:true}}catch(e){return {ok:false,message:'Le stockage de ce navigateur est plein ou inaccessible. Exporte ton identité en JSON.'}}}
function get(id){return kits.find(x=>x.id===id)||kits[0]}
function all(){return kits}
function edit(id,changes){const k=kits.find(x=>x.id===id);if(!k)return null;
 for(const [key,val] of Object.entries(changes||{})){
  if(['name','tagline','signature','voice','doText','dontText'].includes(key))k[key]=String(val||'').slice(0,key==='voice'||key==='doText'||key==='dontText'?1400:125);
  if(['heading','body','accent'].includes(key))k[key]=safeFamily(val);
 }
 return save()
}
function recolor(id,index,hex){const k=kits.find(x=>x.id===id),color=validColor(hex);if(!k||!color||index<0||index>=k.colors.length)return null;k.colors[index][1]=color;return save()}
function addColor(id){const k=kits.find(x=>x.id===id);if(!k||k.colors.length>=12)return null;k.colors.push(['Accent '+(k.colors.length+1),'#777777']);return save()}
function removeColor(id,index){const k=kits.find(x=>x.id===id);if(!k||k.colors.length<=1||index<0||index>=k.colors.length)return null;k.colors.splice(index,1);return save()}
function colorName(id,index,name){const k=kits.find(x=>x.id===id);if(!k||!k.colors[index])return null;k.colors[index][0]=normalizeName(name);return save()}
function create(name){const label=normalizeName(name)||'Nouvelle marque';const id='user-'+slug(label)+'-'+Date.now().toString(36);if(kits.length>=24)return null;
 const kit=normalize({id,name:label,signature:label.toUpperCase()});kits.push(kit);return {kit,result:save()}}
function setLogo(id,data){const k=kits.find(x=>x.id===id);if(!k)return null;if(data!==null&&!validImageData(data))return null;k.logo=data;return save()}
function addAsset(id,item){const k=kits.find(x=>x.id===id);if(!k||k.assets.length>=36)return null;
 const asset={id:'asset-'+Date.now().toString(36)+'-'+Math.floor(Math.random()*1e6),name:normalizeName(item.name||'Image'),category:item.category||'photos',data:item.data};
 if(!validImageData(asset.data,650000))return null;
 k.assets.push(asset);return {asset,result:save()}}
function removeAsset(id,assetId){const k=kits.find(x=>x.id===id);if(!k)return null;k.assets=k.assets.filter(a=>a.id!==assetId);return save()}
function getAsset(id,assetId){const k=kits.find(x=>x.id===id);if(!k)return null;if(assetId==='logo')return k.logo?{id:'logo',name:'Logo '+k.name,data:k.logo}:null;return k.assets.find(x=>x.id===assetId)||null}
function addModel(id,name,elements){const k=kits.find(x=>x.id===id);if(!k||k.models.length>=25)return null;
 const model={id:'model-'+Date.now().toString(36)+'-'+Math.floor(Math.random()*1e6),name:normalizeName(name)||'Mon modèle',
 elements:copy((elements||[]).filter(x=>x&&typeof x==='object'&&!['image','photoFrame'].includes(x.kind)).slice(0,60))};
 k.models.push(model);return {model,result:save()}}
function removeModel(id,modelId){const k=kits.find(x=>x.id===id);if(!k)return null;k.models=k.models.filter(x=>x.id!==modelId);return save()}
function exportKit(id){const k=kits.find(x=>x.id===id);return k?JSON.stringify({kind:'ELOAH_BRAND_KIT',version:1,brand:copy(k)},null,2):''}
function importKit(text){
 const data=typeof text==='string'?JSON.parse(text):text;
 if(data?.kind!=='ELOAH_BRAND_KIT'||!data.brand?.name)throw Error('Fichier de marque ELOAH invalide.');
 if(kits.length>=24)throw Error('Limite de 24 identités atteinte.');
 const k=normalize(data.brand);
 k.id='user-'+slug(k.name)+'-'+Date.now().toString(36);
 kits.push(k);
 return {kit:k,result:save()};
}
window.ELOAHBrand={all,get,edit,recolor,addColor,removeColor,colorName,create,setLogo,addAsset,removeAsset,getAsset,addModel,removeModel,exportKit,importKit,save,colors:defaults,families};
})();