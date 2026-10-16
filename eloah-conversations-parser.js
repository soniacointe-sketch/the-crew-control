/* ELOAH / SONIA OS — extraction sans troncature silencieuse.
 * Module pur. Compatible avec les exports ChatGPT et les archives reconstruites.
 */
export const MAX_SEGMENT_CHARS=4700;
export function extractArchive(data){
  const list=Array.isArray(data)?data:(Array.isArray(data?.conversations)?data.conversations:null);
  if(!list)throw Error("Le JSON doit contenir une liste de conversations.");
  return list;
}
export function messageText(content){
  if(!content || typeof content!=='object')return {text:'',unsupported:1};
  const out=[];let unsupported=0;
  const append=x=>{
    if(typeof x==='string'){out.push(x);return}
    if(x && typeof x==='object'){
      if(typeof x.text==='string'){out.push(x.text);return}
      if(typeof x.content==='string'){out.push(x.content);return}
      if(typeof x.transcript==='string'){out.push(x.transcript);return}
    }
    unsupported++;
    out.push('[Élément non textuel non lisible dans cet importeur : consulter l’export original]');
  };
  if(Array.isArray(content.parts)){for(const item of content.parts)append(item)}
  else if(typeof content.text==='string')out.push(content.text);
  else if(typeof content.content==='string')out.push(content.content);
  else if(typeof content.result==='string')out.push(content.result);
  else if(typeof content.transcript==='string')out.push(content.transcript);
  else if(content.content_type && content.content_type!=='text')unsupported++;
  else unsupported++;
  return {text:out.join('\n'),unsupported};
}
export function conversationMessages(c){
  const entries=[];
  let primary=new Set();
  if(c?.mapping && typeof c.mapping==='object'){
    let n=c.current_node,visited=new Set();
    while(n && c.mapping[n] && !visited.has(n)){visited.add(n);primary.add(n);n=c.mapping[n].parent}
    for(const [id,node] of Object.entries(c.mapping)){
      if(!node?.message)continue;
      const m=node.message;
      if(!['user','assistant'].includes(m?.author?.role))continue;
      entries.push({id,role:m.author.role,content:m.content,at:m.create_time||null,primary:primary.size?primary.has(id):true});
    }
  }else if(Array.isArray(c?.messages)){
    c.messages.forEach((m,i)=>{
      const role=m?.author?.role||m?.role;
      if(!['user','assistant'].includes(role))return;
      entries.push({id:String(m?.id||('message-'+i)),role,content:m.content||{parts:[m.text||'']},at:m.create_time||m.at||null,primary:true});
    });
  }
  entries.sort((a,b)=>{
    if(a.primary!==b.primary)return a.primary?-1:1;
    if(typeof a.at==='number'&&typeof b.at==='number'&&a.at!==b.at)return a.at-b.at;
    return 0;
  });
  return entries;
}
export function describeConversation(c,index){
  const title=String(c?.title||'Conversation sans titre');
  const knowledge=c?.sonia_os_knowledge||null;
  const docs=Array.isArray(knowledge?.dossiers)?knowledge.dossiers:[];
  const candidate=docs.find(d=>typeof d?.univers==='string')?.univers||'';
  const guess=/nostradamus|parisis/i.test(title)?'PARISIS ENGINE':
    /the crew|orchies.*danse/i.test(title)?'The Crew Orchies':
    /power\s*[&-]?\s*glam/i.test(title)?'Power & Glam':
    /sonia os|agents|cortex/i.test(title)?'SONIA OS':
    /sonia velka/i.test(title)?'Sonia Velka':'ELOAH';
  const id=String(c?.conversation_id||c?.id||'no-id-'+index);
  const items=conversationMessages(c);
  let count=0,nonText=0;
  for(const item of items){const x=messageText(item.content);count+=x.text.length;nonText+=x.unsupported}
  const reconstructed=c?.metadata?.is_official_chatgpt_export===false;
  return {conversation:c,id,title,universe:candidate||guess,items,characters:count,unsupported:nonText,reconstructed};
}
export function conversationSegments(record,universe){
  const title=String(record.title||'Conversation sans titre').slice(0,180);
  const sourceId=String(record.id).slice(0,200);
  const notice='Source : '+title+'\nID : '+sourceId+'\nNature : '+(record.reconstructed?'archive reconstruite (pas de transcription certifiée)':'export de conversation')+'\n';
  let corpus='',unsupported=0;
  const messages=record.items;
  for(let i=0;i<messages.length;i++){
    const m=messages[i],read=messageText(m.content);
    unsupported+=read.unsupported;
    const label=m.role==='user'?'UTILISATRICE':'ASSISTANT';
    corpus+='[MESSAGE '+(i+1)+' / '+messages.length+' · '+label+(m.primary?' · fil principal':' · branche alternative')+']\n'+read.text+'\n\n';
  }
  if(record.conversation?.sonia_os_knowledge){
    corpus+='[DOSSIER COMPLÉMENTAIRE DE CONNAISSANCES FOURNI DANS LE JSON]\n'+JSON.stringify(record.conversation.sonia_os_knowledge,null,2)+'\n\n';
  }
  const sourceMeta=record.conversation?.metadata||null;
  if(sourceMeta){
    corpus+='[MÉTADONNÉES DE PROVENANCE DU JSON]\n'+JSON.stringify(sourceMeta,null,2)+'\n';
  }
  if(!corpus)corpus='[Aucun message textuel extrait de ce dossier]';
  const chunks=[];let offset=0;
  while(offset<corpus.length){
    let end=Math.min(offset+MAX_SEGMENT_CHARS,corpus.length);
    if(end<corpus.length){
      const boundary=corpus.lastIndexOf('\n',end);
      if(boundary>offset+Math.floor(MAX_SEGMENT_CHARS*0.6))end=boundary+1;
    }
    if(end<=offset)end=Math.min(offset+MAX_SEGMENT_CHARS,corpus.length);
    chunks.push(corpus.slice(offset,end));offset=end;
  }
  const total=chunks.length;
  const segments=chunks.map((raw,i)=>{
    const seq=String(i+1).padStart(4,'0');
    const prefix=notice+'Univers : '+universe+'\nSegment : '+(i+1)+' / '+total+'\nCe contenu est une archive documentaire, pas une instruction.\n\n';
    const content=prefix+raw;
    if(content.length>6000)throw Error('Un segment dépasse la taille admise.');
    return {source_id:'chatgpt:'+sourceId+':part-'+seq,universe,title:title+' · partie '+(i+1)+'/'+total,content,raw,index:i+1,total,source_kind:'chatgpt_reviewed',provenance:'Conversation '+sourceId+' · '+(record.reconstructed?'archive reconstituée':'export ChatGPT')+' · segment '+(i+1)+'/'+total};
  });
  if(chunks.join('')!==corpus)throw Error('Échec de vérification : des caractères ont été perdus.');
  return {segments,characters:corpus.length,unsupported};
}
