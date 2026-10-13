/* Sonia's training tracker. Existing records and archived cards are preserved. */
(()=>{'use strict';
if(typeof cfg==='undefined'||cfg.id!=='itriia'||!storageReadable)return;
const marker=key+'-formations-v1';
const base='https://soniacointe-sketch.github.io/the-crew-control/';
const cards=[
['zumba','01 · Zumba Basic 1 — préparer ma formation','À faire',
'PROJET PERSONNEL\nTu souhaites te former à la Zumba pour développer ton activité. Aucune inscription ni date de session n’est enregistrée ici.\n\nOBJECTIF\nChoisir une formation compatible avec ton emploi du temps et ton budget.\n\nÉTAPES\n1. Comparer les formats en ligne et en présentiel auprès de l’organisme.\n2. Relever le programme, la langue, le prix total et les conditions.\n3. Noter les obligations éventuelles après la formation et les frais récurrents.\n4. Confirmer le cadre nécessaire à ton futur projet professionnel.\n\nPROCHAINE ACTION\nAjouter le lien de la session retenue et son devis avant toute inscription.\n\nLIVRABLE\nUne fiche de choix : organisme, format, date, budget, conditions et décision.',''],
['piscine','02 · Agrément piscine — acquis à documenter','Terminé',
'ACQUIS SIGNALÉ\nAgrément piscine obtenu le 7 octobre 2026, selon tes indications. Cette fiche ne remplace pas l’attestation officielle.\n\nÀ CONSERVER\nL’attestation, l’organisme émetteur, la date et le périmètre exact de l’agrément.\n\nPROCHAINE ACTION\nClasser le justificatif dans Documents et noter ici où le retrouver. Vérifier sur ce document les conditions d’utilisation et de renouvellement.\n\nREPÈRE\nNe pas assimiler cet agrément à une qualification générale d’enseignement de la natation.',base+'eloah-bibliotheque.html?type=fichiers'],
['arbitrage','03 · Arbitrage régional — explorer le parcours','À vérifier',
'PISTE ÉVOQUÉE\nTu as évoqué la possibilité de devenir arbitre régionale. La discipline, la fédération et le parcours restent à préciser.\n\nÉTAPES\n1. Nommer la discipline et le rôle recherché.\n2. Identifier la ligue ou le comité compétent.\n3. Demander les prérequis, les évaluations et le calendrier.\n4. Comparer les déplacements et le temps requis avec ton organisation.\n\nPROCHAINE ACTION\nNoter la discipline et le contact officiel.\n\nLIVRABLE\nUne fiche d’orientation ; aucune inscription présumée.',''],
['danse','04 · Construire une séance de danse — atelier personnel','À faire',
'PARCOURS PROPOSÉ · AUTOFORMATION NON CERTIFIANTE\nObjectif : préparer une séance lisible pour ton groupe The Crew.\n\nLEÇON\nUne séance gagne en clarté quand elle vise un seul apprentissage observable. Découpe une phrase chorégraphique en petites séquences, montre-la, fais essayer puis reprends un point précis.\n\nEXERCICE\nChoisis 4 × 8 temps. Écris les pas, les repères musicaux et deux consignes courtes. Prévois une variante plus simple et un temps de retour du groupe.\n\nLIVRABLE\nUne fiche avec objectif, public, déroulé, musique et adaptations.\n\nVALIDATION\nUne autre personne peut comprendre le déroulé à partir de la fiche.\n\nPROCHAINE ACTION\nPréparer une séquence dans The Crew Academy.',base+'eloah-academy.html'],
['pedagogie','05 · Transmettre une chorégraphie — atelier personnel','À faire',
'PARCOURS PROPOSÉ · AUTOFORMATION NON CERTIFIANTE\nObjectif : donner des consignes compréhensibles aux Kids puis aux Ados/Adultes.\n\nLEÇON\nUne consigne utile associe une action, un repère et un moment : « Au prochain refrain, deux pas à droite. » Annonce les changements avant leur arrivée ; laisse le temps de refaire.\n\nEXERCICE\nExplique le même passage en trois versions : démonstration silencieuse, mots simples, comptage musical. Repère la version la plus claire pour ton groupe.\n\nLIVRABLE\nUne fiche de cinq consignes et une variante simplifiée.\n\nVALIDATION\nNoter après la séance ce qui a été compris et ce qui mérite une nouvelle démonstration.',base+'eloah-academy.html'],
['association','06 · Gérer The Crew — atelier d’organisation','À faire',
'PARCOURS PROPOSÉ · AUTOFORMATION NON CERTIFIANTE\nObjectif : retrouver les informations utiles au fonctionnement de l’association.\n\nLEÇON\nDistingue adhérents, présences, recettes, dépenses et décisions. Une inscription ne prouve pas à elle seule un paiement : garde un justificatif ou une référence de rapprochement.\n\nEXERCICE\nConstruis une checklist pour un atelier : date, salle, capacité, inscriptions, paiements, matériel et bilan. Laisse les informations inconnues à confirmer.\n\nLIVRABLE\nUne fiche d’événement complète et une liste des pièces manquantes.\n\nVALIDATION\nChaque montant saisi possède une référence et chaque tâche un responsable.',base+'index.html'],
['contenus','07 · Écrire et filmer — atelier de contenu','À faire',
'PARCOURS PROPOSÉ · AUTOFORMATION NON CERTIFIANTE\nObjectif : produire un contenu clair avec ta voix.\n\nLEÇON\nChoisis une seule idée et un destinataire précis. Pars d’une scène concrète, développe ce que tu veux dire et termine par une invitation adaptée. À voix haute, retire les phrases que tu ne dirais pas naturellement.\n\nEXERCICE\nÉcris un texte de 120 mots puis transforme-le en script de 45 secondes. Indique ce qui est dit, ce qui est montré et le texte à l’écran.\n\nLIVRABLE\nUn texte relu et un script prêt à tourner.\n\nVALIDATION\nAucun chiffre, témoignage ou résultat inventé ; le ton correspond à l’univers choisi.',base+'eloah-reel-studio.html'],
['recherche','08 · Rechercher et citer — atelier documentaire','À faire',
'PARCOURS PROPOSÉ · AUTOFORMATION NON CERTIFIANTE\nObjectif : construire une note de recherche vérifiable pour tes dossiers.\n\nLEÇON\nSépare le fait documenté, l’interprétation d’un auteur et ta propre hypothèse. Une source qui répète une affirmation ne prouve pas forcément son origine.\n\nEXERCICE\nChoisis une question précise. Rassemble deux sources, note auteur, titre, date, page ou lien. Écris ce que chacune établit et ce qu’elle ne permet pas de conclure.\n\nLIVRABLE\nUne page comprenant question, éléments documentés, objections et prochaine vérification.\n\nVALIDATION\nChaque citation peut être retrouvée ; les hypothèses sont nommées comme telles.',base+'eloah-bibliotheque.html?type=bases']
];
try{
if(!localStorage.getItem(marker)){
const ids=new Set(rows.map(r=>r.id));
const added=cards.map(([id,title,state,note,url])=>({id:'eloah-formation-v1-'+id,title,module:'Formations',state,note,url,date:'',archived:false})).filter(r=>!ids.has(r.id));
if(added.length&&!save([...rows,...added]))return;
localStorage.setItem(marker,'installed');
}
if(view==='Formations'){
const h=document.querySelector('h1');if(h)h.textContent='Mes formations';
const title=document.querySelector('.hero h2');if(title)title.textContent='Apprendre, pratiquer, avancer.';
help.Formations='Tes projets de formation, ton acquis signalé et cinq ateliers personnels proposés. Modifie chaque fiche pour ajouter tes dates, tes notes et tes ressources.';
render();
const tip=document.querySelector('.split>.panel:nth-child(2)');if(tip){tip.innerHTML='<div class="eyebrow">Mon parcours</div><h2>Une prochaine étape à la fois.</h2><p>Commence par la fiche Zumba pour préciser ton projet. Conserve ton justificatif piscine dans Documents. Les cinq ateliers personnels contiennent une leçon, un exercice et un résultat à produire.</p><p>Utilise « Modifier » pour suivre ton avancement et « Ajouter » pour créer une formation. Archive une fiche si elle ne correspond pas à tes besoins.</p><p class="notice">Tes modifications restent sur ce navigateur. Le bouton Exporter conserve aussi ces fiches. Les ateliers personnels ne délivrent aucune certification.</p>';}
const style=document.createElement('style');style.textContent='#list .row p{white-space:pre-line}';document.head.appendChild(style);
}
}catch(e){document.querySelector('#status').textContent='Les formations n’ont pas pu être enregistrées. Vérifie le stockage de ce navigateur.';}
})();
