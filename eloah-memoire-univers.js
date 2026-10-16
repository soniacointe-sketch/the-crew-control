(() => {
  const KEY = 'eloah-universe-notes-v1';
  const choices = ['Power & Glam','The Crew Orchies','PARISIS ENGINE','Sonia Velka','SONIA OS','ELOAH'];
  const read = () => { try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; } };
  const save = data => localStorage.setItem(KEY,JSON.stringify(data));
  window.EloahValidatedMemory = {
    context(universe) {
      return read().filter(x => x.validated && x.universe === universe)
        .slice(-8).map(x => x.title + ' : ' + x.note.slice(0,300)).join('\n').slice(0,2300);
    }
  };
  function init() {
    const root = document.getElementById('eloah-home-ai');
    if (!root || document.getElementById('eloah-memory')) return;
    const section = document.createElement('section');
    section.id = 'eloah-memory';
    section.innerHTML = '<details><summary>Ma mémoire par univers</summary><p>Ajoute tes règles et décisions. Elles ne sont utilisées par l’IA que lorsque tu les valides. Stockage sur cet appareil uniquement.</p><label>Univers <select id="em-universe"></select></label><label>Titre <input id="em-title" maxlength="100"></label><label>Contenu <textarea id="em-note" rows="3" maxlength="2000"></textarea></label><button id="em-add" type="button">Ajouter</button><div id="em-list"></div><p id="em-status" role="status"></p></details>';
    root.append(section);
    const $ = id => document.getElementById(id);
    choices.forEach(v => {const o=document.createElement('option');o.value=v;o.textContent=v;$('em-universe').append(o)});
    function draw(){
      const list=$('em-list');list.replaceChildren();
      read().forEach((entry,index)=>{
        const item=document.createElement('article');
        const title=document.createElement('strong');title.textContent=entry.universe+' · '+entry.title;
        const desc=document.createElement('p');desc.textContent=entry.note;
        const btn=document.createElement('button');btn.type='button';btn.textContent=entry.validated?'Annuler la validation':'Valider pour l’IA';
        btn.addEventListener('click',()=>{const a=read();a[index].validated=!a[index].validated;save(a);draw()});
        const del=document.createElement('button');del.type='button';del.textContent='Supprimer';
        del.addEventListener('click',()=>{if(!confirm('Supprimer cette note ?'))return;save(read().filter((_,i)=>i!==index));draw()});
        item.append(title,desc,btn,del);list.append(item);
      });
    }
    $('em-add').addEventListener('click',()=>{
      const title=$('em-title').value.trim(),note=$('em-note').value.trim();
      if(!title||!note){$('em-status').textContent='Renseigne le titre et le contenu.';return}
      try{save([...read(),{universe:$('em-universe').value,title,note,validated:false}]);$('em-title').value='';$('em-note').value='';draw();$('em-status').textContent='Note ajoutée. Valide-la pour que l’IA la retrouve.'}
      catch{$('em-status').textContent='Stockage indisponible.'}
    });
    draw();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();