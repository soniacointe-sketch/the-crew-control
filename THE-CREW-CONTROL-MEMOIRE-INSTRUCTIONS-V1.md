# THE CREW CONTROL — Mémoire maître d’instructions
Version 1.0 · État de référence : 20 octobre 2026 · Responsable : Sonia Cointe

## 1. Mission à confier à l’agent ou au développeur

Tu dois mettre en place, maintenir ou reconstruire The Crew Control, l’outil de gestion de The Crew Orchies, et son accès depuis ELOAH — L’espace Sonia OS.

Pars du dépôt existant et des services connectés. Inspecte leur état actuel avant toute modification. Réutilise les modules fonctionnels, leurs données et leurs identifiants. Évite de créer une seconde base, un second registre ou des écrans sans connexion réelle.

Le résultat attendu est un outil utilisable par Sonia pour gérer les adhérents, les essais, les cours, les présences, les ateliers, les paiements, la communication et les actions à suivre. Léa accompagne la comptabilité et les cours ; son accès doit être explicitement organisé, sans lui attribuer automatiquement les droits de Sonia.

Cette consigne décrit un système existant à consolider. Elle n’est ni une sauvegarde complète de la base ni un export des secrets et ne suffit pas, à elle seule, à redéployer toutes les fonctions historiques. Récupérer le code, le schéma, les permissions et les configurations réelles avant une restauration.

### Règles d’exécution

- Identifier ce qui existe avant de construire.
- Préserver les données réelles et les références de paiements.
- Donner à chaque module un état explicite : construit, connecté, vérifié techniquement, vérifié dans l’interface, ou à finaliser.
- Un bouton ou un fichier présent ne prouve pas que le service fonctionne.
- Ne jamais annoncer une sauvegarde, une publication, un envoi ou une synchronisation sans résultat vérifié.
- Ne pas publier de données de membres, de secrets, de justificatifs ou d’informations bancaires.
- Ne déclencher aucun paiement ni envoi collectif pour faire un test.
- Garder des confirmations claires avant les opérations financières et les suppressions.
- Livrer les liens, les contrôles réalisés et les limites restantes.

## 2. Périmètre et sources de référence

### Points d’entrée

| Élément | Adresse ou référence |
|---|---|
| Site public | https://thecreworchies.blog/ |
| Gestion The Crew Control | https://soniacointe-sketch.github.io/the-crew-control/ |
| Tableau de bord ELOAH Crew | https://soniacointe-sketch.github.io/the-crew-control/eloah-espace-sonia-os-the-crew.html |
| Espace de travail Crew | https://soniacointe-sketch.github.io/the-crew-control/eloah-the-crew.html |
| Contrôle quotidien | https://soniacointe-sketch.github.io/the-crew-control/eloah-the-crew-daily.html |
| Mailing | https://soniacointe-sketch.github.io/the-crew-control/eloah-partenaire.html?rubrique=Mailing |
| Dépôt de code | soniacointe-sketch/the-crew-control |
| Projet Supabase existant | voytsqyorhoveurnguxn |
| WordPress existant | site 257252103 ; thème Assembler lors des derniers travaux |

L’entrée principale ELOAH doit permettre d’ouvrir clairement « THE CREW ORCHIES », puis les outils de gestion et de travail. Vérifier le branchement effectivement publié dans la navigation générale ; ne pas considérer la seule existence des pages comme une intégration complète.

### Répartition des responsabilités techniques

- WordPress : pages du site public et intégration de l’assistant.
- GitHub Pages : interfaces The Crew Control, ELOAH et formulaires dédiés.
- Supabase : authentification, données privées, fonctions serveur et tâches planifiées.
- Resend : envoi des confirmations et campagnes selon les circuits configurés.
- HelloAsso : adhésions, billets et paiements.
- Google Sheets : tableau partagé de suivi et indicateurs.
- Google Docs : procédures et comptes-rendus.
- Google Agenda : rendez-vous de préparation et de revue.

Les pages HTML publiques sont des interfaces. Leur URL ne protège pas les données : les lectures et écritures privées doivent être contrôlées côté serveur.

## 3. Identité et règles métier à conserver

The Crew Orchies est une association de danse et pompom à Orchies, accueillant dès 4 ans, dans un esprit convivial, inclusif et bienveillant.

- Sonia Cointe : fondatrice, présidente, animatrice et coordination.
- Léa Boulinguiez : accompagnement comptable et aide aux cours.
- Lieu d’activité : Espace Marypomme, 18 rue Gaston Leroy, 59310 Orchies.
- Contact public : soniacointe@icloud.com ; 06 11 87 81 77.
- Accessibilité : toilettes accessibles ; une marche à l’entrée. Ne pas annoncer une entrée de plain-pied.

### Groupes et horaires

| Groupe | Public | Horaire habituel |
|---|---|---|
| KIDS | 4–11 ans | Samedi 18 h 30–19 h 30 |
| ADOS & ADULTES | Dès 12 ans | Samedi 19 h 30–20 h 30 |

Les cours réguliers s’arrêtent pendant les vacances scolaires. Les ateliers programmés peuvent remplacer des cours. Un horaire hebdomadaire théorique ne remplace jamais le calendrier réel des séances.

Capacité maximale : 20 personnes par groupe et par atelier. Pour les essais, compter les adhérents déjà inscrits et les essais planifiés ; ne pas ajouter 20 visiteurs aux 20 adhérents.

### Tarifs de référence, saison 2026–2027

| Formule | Montant |
|---|---:|
| Enfant | 70 € |
| Ado / adulte | 85 € |
| Duo / couple | 110 € |
| Famille | 220 € |
| Solidaire individuel dès 12 ans | 75 € |
| Atelier | 8 € par participant |
| Premier essai | Gratuit |

Paiement annuel en une fois. Solidaire notamment pour étudiants, demandeurs d’emploi, bénéficiaires RSA ou AAH, selon les conditions validées ; justificatif présenté en privé sans copie conservée. Non cumulable avec duo et famille.

La dernière décision remplace les anciennes annonces de gratuité des ateliers pour les adhérents : ne pas les réintroduire.

Ne jamais déduire une disponibilité réelle de la seule capacité maximale. Les changements de tarif doivent être répercutés sur les supports concernés après vérification.

## 4. Présentation et navigation

Conserver l’identité noir et or. Prévoir des textes lisibles et des contrastes suffisants, également quand le site possède un mode clair.

L’interface doit donner accès aux rubriques suivantes :

1. Tableau de bord.
2. Actions et décisions.
3. Adhérents.
4. Familles.
5. Préinscriptions.
6. Essais.
7. Planning et présences.
8. Ateliers et événements.
9. Participants aux ateliers.
10. Paiements et contrôle financier.
11. Facturation — brouillons.
12. Relances et tâches.
13. Communication et newsletters.
14. Documents, mémoire et procédures.
15. État du système.

Adapter les libellés à Sonia : mots simples, informations utiles, absence de jargon dans les parcours ordinaires. Ne pas afficher des détails techniques sans utilité pour l’action.

Sur téléphone : navigation accessible, formulaires sans débordement, champs d’au moins 16 px, boutons faciles à toucher, tableaux défilables et fenêtres fermables. Un panneau flottant ne doit pas passer derrière le menu du site ni masquer durablement son contenu.

## 5. Authentification et séparation des accès

Utiliser l’authentification Supabase existante pour les opérations privées. Inspecter les contrôles d’autorisation de chaque fonction serveur avant d’ajouter un utilisateur : certaines fonctions historiques utilisent une autorisation administrative particulière.

Ne pas confondre « connecté » et « autorisé ». Une personne qui crée un compte ne doit pas recevoir automatiquement les droits de gestion.

- Aucun nom, contact, historique de présence ou paiement individuel dans une réponse publique.
- Les endpoints publics ne renvoient que les données strictement nécessaires.
- Les fonctions administratives vérifient l’identité et les droits côté serveur.
- Conserver les clés de service et clés des fournisseurs dans les secrets serveur.
- Appliquer RLS et permissions cohérentes aux tables et vues ; examiner les privilèges des fonctions.
- Ne pas résoudre une erreur de permissions en ouvrant toutes les tables.
- Les journaux ne doivent contenir ni secrets ni copies inutiles des formulaires.

## 6. Modèle de données à reprendre

Les noms ci-dessous existent dans le schéma inspecté. Certains objets sont des vues : relever leur type et leur définition avant de les recréer. Ne pas inventer leurs colonnes à partir de leur nom.

| Domaine | Objets de référence |
|---|---|
| Membres et inscriptions | crew_members, crew_registrations, crew_groups |
| Préinscriptions | crew_intake_submissions, crew_preregistrations |
| Essais | crew_trials |
| Séances et présences | crew_sessions, crew_attendance |
| Absences déclarées | crew_absence_declarations |
| Familles | crew_family_groups, crew_family_links |
| Ateliers | crew_events, crew_event_registrations |
| Paiements | crew_payments, crew_payment_reconciliations |
| Commandes et billets | crew_event_payment_orders, crew_event_payment_items, crew_helloasso_events |
| Finances manuelles | crew_finance_manual_entries, crew_finance_bank_entries |
| Budget et subventions | crew_finance_budgets, crew_finance_subsidies, crew_finance_settings |
| Historique financier | crew_finance_change_log |
| Facturation | crew_billing_config, crew_invoice_drafts |
| Tâches et suivi | crew_tasks, crew_followups, crew_decisions |
| Documents et contenus | crew_documents, crew_content_queue, crew_content_review |
| Projets créatifs | crew_creative_projects, crew_creative_project_steps |
| Newsletter | crew_newsletter_signups, crew_newsletter_rate_limits |
| Suivi web | crew_web_events, crew_tracking_links |
| Pilotage | crew_daily_runs, crew_action_log, crew_workflow_events |

Préserver les identifiants et relations : personne → inscription de saison → groupe → paiements ; séance → pointages ; préinscription → essai ; événement → participants et commandes.

Un participant à un atelier n’est pas automatiquement un adhérent annuel. Une famille supposée n’est pas automatiquement un foyer confirmé.

Avant toute reconstruction, exporter le schéma, les contraintes, les index, les fonctions, les vues, les permissions et la configuration des tâches. Ce document ne remplace pas cet export.

## 7. Adhérents, inscriptions et familles

Reprendre la liste privée, les fiches et les actions de création/modification présentes dans index.html.

Une fiche doit permettre de retrouver les informations utiles : identité, date de naissance, groupe, saison, formule, état du dossier, contact et responsable légal pour un mineur. Les paiements, présences et liens familiaux doivent rester consultables sans copier les mêmes données dans plusieurs registres.

Passer une préinscription en adhérent crée un dossier à finaliser ; cette action ne crée pas de paiement et ne prouve pas que la cotisation est réglée.

Pour les familles :
- Proposer un rapprochement à partir d’un contact commun.
- Présenter ce rapprochement comme une suggestion.
- Confirmer le foyer explicitement.
- Ne pas fusionner automatiquement les personnes ni appliquer automatiquement une réduction.
- Conserver les inscriptions individuelles et la traçabilité de la formule retenue.

Une correction administrative ne doit pas effacer les références financières ou les présences historiques.

## 8. Réservation d’essai et confirmation

### Circuit principal

Visiteur → formulaire sécurisé → validation serveur → préinscription → réservation d’essai → tâches internes → tentative de confirmation par e-mail → suivi privé.

Pour un mineur : responsable légal et autorisation obligatoires. Prévoir au moins un contact utilisable. L’abonnement à la newsletter doit rester distinct de la demande d’essai.

### Parcours guidé depuis l’assistant

1. Le visiteur demande un essai.
2. L’assistant propose KIDS ou ADOS & ADULTES.
3. Il charge jusqu’à trois prochaines séances disponibles pour le groupe.
4. Le visiteur choisit une date.
5. Le formulaire public s’ouvre avec cette date présélectionnée.
6. La date de naissance détermine le groupe réel.
7. Le visiteur confirme le créneau et les consentements puis envoie le formulaire.
8. Le serveur revérifie la capacité lors de l’enregistrement.
9. La page de résultat indique la date retenue, un essai déjà existant ou une demande à planifier.

L’affichage d’une séance ne bloque aucune place. Si elle n’est plus disponible à l’envoi, aucune autre date ne doit être attribuée silencieusement. Le dossier doit être clairement signalé comme restant à planifier.

### Références techniques

- Fonction serveur : crew-public-registration.
- Lecture publique : GET avec resource=trial-slots.
- Fonction SQL privée : crew_public_trial_slots().
- Réservation sous verrou de groupe : crew_reserve_public_trial(...).
- Origine des demandes guidées : assistant_AAAAMMJJ.
- Origine découverte : open_day_AAAAMMJJ.
- Formulaire WordPress : /inscription/.
- Fichier du formulaire découverte : crew-seance-decouverte.html.

Exclure les séances annulées et celles qui chevauchent un atelier enregistré non annulé/non terminé. Le contrôle actuel écarte aussi un atelier en préparation : maintenir le planning à jour pour éviter les blocages indus.

Les coordonnées sont saisies dans le formulaire, pas transmises au modèle IA. Les disponibilités publiques ne contiennent ni listes nominatives ni coordonnées.

### Essais après la séance

Prévoir les états et actions utiles : planifié, venu, absent, intéressé, converti. Respecter les valeurs réelles acceptées en base.

Une conversion doit être justifiée par l’adhésion enregistrée ; ne pas transformer un simple clic vers HelloAsso en adhésion.

## 9. Présences et absences

Le pointage privé doit permettre de choisir une séance puis de marquer chaque personne. Une séance non pointée n’est pas une absence.

La déclaration publique d’absence doit :
- recueillir l’identité nécessaire, le groupe, les dates et un contact ;
- être enregistrée dans crew_absence_declarations ;
- conserver l’état de la notification ;
- donner une confirmation claire ;
- être consultable dans le suivi privé.

Une déclaration et le pointage réel sont deux informations différentes. Ne pas écraser automatiquement une présence constatée avec une déclaration antérieure.

Fonction de pointage repérée : crew-attendance-control. Le dépôt contient aussi des interfaces d’historique individuel. Leur présence ne vaut pas test complet de toutes les opérations privées.

## 10. Ateliers, événements et participants

Une fiche datée doit contenir : titre, description, public, date, horaires, lieu, responsable, capacité, tarif, statut et lien de billetterie.

Conserver une seule fiche pour un atelier qui est aussi un événement. Distinguer :
- fiche en préparation ;
- événement programmé ;
- événement terminé ;
- événement annulé.

Le module participants aux ateliers est distinct des adhérents. Il doit gérer les inscriptions à l’événement et leur rapprochement avec les billets, sans marquer un paiement vérifié sur la seule saisie d’un nom.

### Repères datés à conserver comme historique

- Flashback Party années 80 : 24 octobre 2026, 18 h 30–20 h 30, dès 12 ans, 8 €, 20 maximum.
- Musiques retenues : Footloose ; Girls Just Want to Have Fun.
- K-pop Hunters : créneau du 7 novembre à clarifier ; conflit KIDS identifié.
- Découverte : 14 novembre 2026 aux horaires des deux groupes ; capacité partagée avec les membres.
- Prochaine découverte envisagée : 5 décembre, à revérifier avant annonce.

Ces dates sont un état de référence, pas une programmation à reproduire indéfiniment.

## 11. HelloAsso et paiements

### Liens de référence

Adhésion :
https://www.helloasso.com/associations/the-crew-orchies/adhesions/inscription-the-crew-orchies-saison-2026-2027

Paiement libre convenu avec l’association :
https://www.helloasso.com/associations/the-crew-orchies/paiements/paiement-securise-the-crew-orchies

Flashback :
https://www.helloasso.com/associations/the-crew-orchies/evenements/flashback-party-annees-80-the-crew-orchies

### Règles de rapprochement

Conserver la référence du fournisseur, la commande, le billet éventuel, la date, le montant, le statut et le lien au dossier.

Distinguer impérativement :
1. montant attendu ;
2. paiement déclaré ;
3. paiement vérifié ;
4. montant reversé par le fournisseur ;
5. somme effectivement reçue en banque.

Une synchronisation n’est complète que si les dernières opérations ont été comparées à la source, les doublons contrôlés et les échecs visibles. Ne pas présenter la présence d’un webhook ou d’un import comme la preuve que toutes les ventes sont intégrées.

Reprendre les fonctions HelloAsso existantes plutôt que créer un import parallèle. Vérifier la signature/authentification des notifications, l’idempotence, la gestion des remboursements et la possibilité de rejouer une opération sans double comptage.

Pour un paiement manuel, demander une confirmation de réception réelle et conserver le mode et la date. Ne pas fabriquer de référence HelloAsso.

## 12. Finances, dépenses, banque et budget

Le code actuel comprend une vue financière et des outils de saisie. Consolider :
- transactions documentées ;
- cotisations attendues et encaissées ;
- billets rapprochés et non rapprochés ;
- dépenses et recettes manuelles ;
- mouvements bancaires saisis ;
- budget prévisionnel ;
- éléments restant à vérifier ;
- export de la feuille consultée.

Prévoir description, date, catégorie, montant, moyen de paiement, référence de justificatif et état de vérification. Les corrections et archivages doivent laisser une trace adaptée.

Une recette HelloAsso et sa réception en banque sont deux étapes d’une même recette : ne pas les additionner comme deux revenus. Un mouvement bancaire transcrit manuellement ne constitue pas une synchronisation bancaire ni une preuve automatiquement vérifiée.

Ne pas remplacer les dépenses manquantes par une estimation présentée comme réelle. Ne pas afficher un solde bancaire officiel sans relevé fiable et point de départ.

Fonction de saisie repérée : crew-finance-input. La présence de tableaux et de formulaires dans le code a été inspectée ; toutes leurs actions privées n’ont pas été rejouées lors de la rédaction de ce mémoire.

## 13. Relances internes et facturation

### Alertes de paiement

Tâche planifiée active vérifiée : crew-payment-followups-hourly, minute 23 de chaque heure.

Créer une tâche de vérification si le montant attendu est positif, l’échéance dépassée et le statut pertinent. Pour un paiement partiel, comparer réellement reçu et attendu. Une seule tâche par paiement ; ne pas recréer les tâches traitées ou écartées.

Léa vérifie les paiements récents et les références avant une relance. Aucun e-mail automatique de relance aux adhérents n’est activé par ce mécanisme.

### Brouillons de facturation

Tâche active vérifiée : crew-invoice-drafts-hourly, minute 28 de chaque heure.

Le mécanisme prépare des brouillons pour les cotisations payées et vérifiées. Il ne couvre pas encore l’ensemble des ateliers et événements.

Conserver la mention « BROUILLON — NON ÉMIS ». Ne pas attribuer de numéro définitif, envoyer un document final ou produire un reçu fiscal sans dispositif validé.

La configuration administrative fournie par Sonia reste privée et doit être vérifiée. La mention « Paiement non soumis à TVA » a été confirmée par Sonia pour HelloAsso ; ne pas en déduire automatiquement un article fiscal précis.

Avant émission : identité, situation fiscale, données du destinataire, date et nature de l’opération, numérotation, corrections/remboursements et archivage à finaliser. Les instantanés de brouillons doivent être revérifiés si un paiement change.

## 14. Communication, newsletter et contenus

ELOAH Mailing sert à préparer les modèles ; Resend sert aux campagnes. Une copie de travail locale ou un modèle ELOAH n’est pas automatiquement synchronisé avec un brouillon Resend.

### Modèle mensuel

Prévoir :
- introduction courte ;
- agenda du mois ;
- rappel des cours et de l’essai offert ;
- atelier mis en avant ;
- bouton adapté ;
- déclaration d’absence et contact ;
- désabonnement pour une campagne destinée à une liste.

Conserver l’identité noir et or et vérifier la lisibilité mobile des e-mails. Distinguer enregistré, brouillon, programmé, envoyé et livré. Livré ne signifie pas lu.

Ne pas réabonner une personne désinscrite. Ne pas inscrire automatiquement un visiteur ou demandeur d’essai à une campagne.

Repère historique : la campagne Flashback du 20 octobre a été envoyée et sa livraison vérifiée. Ne pas la renvoyer lors d’une restauration. Les brouillons de novembre et de découverte ne sont pas des envois programmés.

L’automatisation mensuelle de préparation de newsletter n’a pas été activée : sa création avait échoué en raison de la limite de tâches. Ne pas la considérer comme acquise.

Le dépôt comprend également des studios de contenus, des modèles et une bibliothèque. Les conserver comme outils de préparation ; aucune génération ou publication externe ne doit être supposée automatique sans connexion vérifiée.

## 15. Assistant public du site

Fichier principal : crew-public-assistant.js.
Intégration : script dans le pied de page WordPress partagé.
Fonction serveur : crew-public-assistant.

Prévoir les réponses pratiques validées : horaires, tarifs, essai, adhésion, lieu, ateliers, absence, paiement et contact.

Les boutons répondent sans recours au modèle. Les questions libres peuvent être orientées par Groq vers des réponses prédéfinies. Le modèle ne doit pas inventer des tarifs, des disponibilités ou des confirmations.

Conserver une présentation discrète et naturelle, identifiable comme assistant virtuel. Ne pas se faire passer pour Sonia ou Léa. Pas de case d’activation de l’IA : elle a été retirée à la demande de Sonia. L’explication du traitement se trouve dans « À propos de cet assistant ».

L’assistant ne doit pas demander de coordonnées dans la conversation, donner accès à un dossier privé, déclarer une absence ou déclencher un paiement. Le parcours d’essai ouvre le formulaire sécurisé.

Le code actuel ne sauvegarde pas le texte des conversations dans une table applicative. Cela ne constitue pas une garantie sur tous les journaux, prestataires ou sauvegardes : vérifier leurs réglages séparément.

Sur mobile : panneau compact, fermeture visible, position au-dessus du menu du site, bouton flottant masqué quand le panneau est ouvert, adaptation au clavier. Ces modifications ont été enregistrées ; le contrôle visuel complet sur iPhone reste à terminer.

Les statistiques propres au chatbot, la mise à jour individuelle par lien sécurisé et un portail membres authentifié ne sont pas inclus dans les réalisations vérifiées de ce chantier.

## 16. Indicateurs, suivi et réunions

Tableau Google Sheets de référence :
https://docs.google.com/spreadsheets/d/13GHP82yVauZkAEGZLzJDClLtnNUkNV7lu7iUCv7qr_U

Onglets de travail : communication, tests, revue mensuelle, KPIs, essais hebdomadaires et satisfaction. Reprendre les onglets existants avant d’en ajouter.

Indicateurs :
- essais réservés par semaine ;
- essais réellement effectués ;
- conversion vers une adhésion ;
- recettes par nature ;
- absences déclarées et présences pointées ;
- satisfaction lorsque collectée ;
- suivi des actions de communication.

Documenter les dénominateurs. Ne pas compter une donnée manquante comme zéro ni une séance non pointée comme absence. Utiliser des cohortes cohérentes pour la conversion.

Une actualisation quotidienne des agrégats disponibles a été configurée ; vérifier son état dans le planificateur concerné lors d’une remise en place. Elle ne garantit ni l’exhaustivité HelloAsso ni la collecte de satisfaction.

### Rendez-vous de référence, heure de Paris

- Préparation et prise en main : 21 octobre 2026, 10 h–10 h 30.
- Revue mensuelle : le 20, 10 h–11 h, à partir du 20 novembre 2026.
- Revue trimestrielle : dernier mardi de mars, juin, septembre et décembre, 10 h–11 h 30 ; première le 29 décembre 2026.

Rechercher les rendez-vous existants avant de les créer pour éviter les doublons. La création d’un événement ne prouve ni la présence de Léa ni l’exécution des tests.

Procédure inscriptions/absences :
https://docs.google.com/document/d/1jw6TArstqJz4PE4EARYLmEm9wW5Oxya6NlwXQevAVGE

Support des revues trimestrielles :
https://docs.google.com/document/d/1mw5wjIu-p6vp-qF227GypD3Fy8HppxAWuMAVGeGqoZw

## 17. Données personnelles, conservation et documents

La suppression des demandes d’essai après trois mois sans adhésion a été décidée. Une tâche nommée crew-trials-retention-three-months est active, avec l’expression 15 3 * * *. Vérifier le fuseau du planificateur et la définition exacte du traitement avant une restauration ; ne pas interpréter ce seul horaire comme 3 h 15 à Paris.

Contrôler les tables et relations concernées, l’exclusion des personnes devenues adhérentes et les traces techniques nécessaires. La règle ne supprime pas automatiquement les e-mails, les exports et les sauvegardes.

Distinguer les durées par usage ; ne pas appliquer la suppression à trois mois aux pièces comptables et historiques d’adhésion sans analyse adaptée.

Les liens de documents ne confèrent pas de permissions. Ne pas ajouter Léa à un document ou envoyer des invitations sans instruction explicite.

L’ancien projet collaboratif « Les voix du Crew » est annulé. Des tables et fichiers historiques peuvent subsister : leur présence ne justifie pas une réactivation.

## 18. Fichiers à reprendre en priorité

| Fichier | Utilité |
|---|---|
| index.html | Gestion principale, modules privés et extensions |
| eloah-espace-sonia-os-the-crew.html | Accès, mémoire et procédures du Crew |
| eloah-the-crew.html | Espace de travail et liens projet |
| eloah-the-crew-daily.html | Contrôle quotidien |
| crew-public-assistant.js | Widget public |
| crew-seance-decouverte.html | Formulaire découverte |
| eloah-partenaire.html | Interface de mailing |
| eloah-crew-impact.js | Modèles de newsletters |
| eloah-crew-impact-send.js | Parcours d’envoi à inspecter |
| eloah-mailing-crew-resend.js | Liaison mailing à inspecter |
| eloah-crew-participants.js | Intégration participants |
| crew-identity.css | Identité graphique |
| finance-v24.js / finance-v24.css | Compléments financiers à inspecter |
| supabase/functions/crew-public-registration/index.ts | Formulaires, créneaux publics et confirmations |
| supabase/functions/crew-public-assistant/index.ts | Orientation des questions publiques |
| supabase/crew-assistant-trial-slots.sql | Disponibilités et réservation par date |

Autres interfaces repérées : crew-digital-studio.html, crew-magazine.html, eloah-the-crew-article-studio.html, crew-article-studio.js, crew-studio-live.js et la bibliothèque eloah-bibliotheque-the-crew*. Leur périmètre doit être inspecté avant de promettre une reproduction complète.

Plusieurs fonctions serveur historiques sont déployées sans être nécessairement présentes dans les deux dossiers exportés ci-dessus. Récupérer leur code depuis Supabase et relever leurs dépendances.

Fonctions appelées dans la gestion inspectée : crew-dashboard-details, crew-dashboard-public, crew-control-action, crew-trial-summary, crew-growth-funnel, crew-capacity-summary, crew-next-sessions, crew-readable-summary, crew-member-edit, crew-manual-payment, crew-attendance-control, crew-families-manage, crew-member-remove, crew-event-clients et crew-finance-input.

## 19. Ordre de mise en place

### Phase A — Inventaire et sauvegarde
Récupérer le dépôt, les fonctions, le schéma, les permissions, les configurations et les médias. Identifier les versions actives. Sauvegarder avant migration. Ne jamais exporter de secrets dans le dépôt.

### Phase B — Données et accès
Restaurer les structures et les relations ; activer les protections ; configurer les utilisateurs autorisés et secrets nécessaires. Tester les refus d’accès avant de charger des identités réelles.

### Phase C — Gestion centrale
Relier les listes et fiches aux données ; vérifier création/modification, inscriptions de saison, familles, essais, planning et présences.

### Phase D — Site et formulaires
Relier essai, absence, disponibilité et assistant. Conserver les pages existantes et leurs styles. Vérifier le parcours enfant/adulte et les erreurs explicites.

### Phase E — Paiements et finances
Configurer les connexions HelloAsso autorisées ; rapprocher les paiements ; tester les imports répétés sans doublons ; relier dépenses, banque et budget. Garder les factures en brouillon.

### Phase F — Communication et suivi
Vérifier Resend, modèles, listes et désabonnement. Relier documents et tableaux ; vérifier les tâches planifiées sans les dupliquer. Ne programmer aucun envoi nouveau sans instruction.

### Phase G — Recette et livraison
Contrôler les interfaces sur ordinateur et téléphone, les cas limites, les notifications et les permissions. Fournir un bilan factuel avant de déclarer la mise en place terminée.

## 20. Recette obligatoire

| Contrôle | Résultat attendu |
|---|---|
| Visiteur non connecté | Aucun accès à une identité privée |
| Compte sans droit administratif | Refus des lectures et écritures privées |
| Essai enfant | Groupe correct, responsable et autorisation nécessaires |
| Essai adulte | Contact utilisable et groupe correct |
| Créneau annulé ou chevauchant un atelier | Non proposé |
| Groupe complet | Aucune place confirmée |
| Date choisie devenue indisponible | Demande à planifier, sans autre date imposée |
| Demande répétée | Essai actif conservé, pas de doublon pour le dossier |
| Envois simultanés | Capacité revérifiée sous verrou |
| Confirmation e-mail | Réception et état d’échec vérifiables |
| Déclaration d’absence | Enregistrement et confirmation |
| Pointage | Persiste au rechargement ; non pointé distinct d’absent |
| Paiement répété / notification rejouée | Pas de double recette |
| Remboursement | Statut et agrégats cohérents |
| Banque | Pas de confusion encaissement / reversement / relevé |
| Brouillon de facture | Aucune émission ni numéro définitif |
| Newsletter | Brouillon conservé, liens et désabonnement valides |
| Assistant sans fournisseur disponible | Réponses pratiques et contact encore utilisables |
| Mobile | Panneau fermé/ouvert, clavier, rotation, défilement |
| Navigateur | Chrome, Safari, Firefox et Edge selon accès réel |
| Conservation | Échéance et exclusions correctes sur données de test |

Les tests de réservation par date, doublon et groupe complet ont réussi en base le 20 octobre, avec annulation des données de test. Ils ne remplacent pas le contrôle visuel et la réception réelle du message dans le nouveau parcours.

Utiliser des données synthétiques et un destinataire de test autorisé. Nettoyer les tests de façon contrôlée. Ne pas utiliser la vraie liste de diffusion comme environnement de recette.

## 21. Limites et travaux encore ouverts

- Contrôle complet sur téléphone et autres navigateurs.
- Réception de la confirmation dans le nouveau parcours guidé.
- Vérification de l’exhaustivité et de l’actualisation HelloAsso.
- Finalisation du programme K-pop et de son conflit de planning.
- Complément des indicateurs non collectés.
- Vérification administrative et fiscale avant émission de factures.
- Accès éventuel de Léa, à organiser explicitement.
- Statistiques propres au chatbot.
- Mise à jour individuelle des coordonnées via lien sécurisé.
- Audit détaillé des studios et des modules historiques non rejoués.

La présence d’une fonction, d’une vue ou d’un formulaire constitue une référence de construction, pas une certification complète de fonctionnement.

## 22. Livrable à exiger à la fin de chaque intervention

Fournir :
1. Ce qui a changé et à quoi cela sert.
2. Les fichiers et services concernés.
3. Les liens pour utiliser le résultat.
4. Les vérifications réellement effectuées.
5. Les données de test créées et leur traitement.
6. Les éventuels blocages et limites.
7. La prochaine action nécessaire.

Actualiser la mémoire du projet après un changement important. Cette mémoire est un document daté : elle ne synchronise pas automatiquement les conversations ni les services.

---

### Instruction courte à coller avec ce fichier

« Utilise ce mémoire comme consigne de référence pour The Crew Control. Inspecte d’abord le dépôt et les services actuels. Reprends les réalisations existantes, préserve les données privées et les règles validées, puis mets en place les connexions manquantes dans l’ordre prévu. Ne déclare aucun module opérationnel sans vérification. Ne déclenche pas d’envoi collectif, de paiement ni d’émission de facture pour tester. Termine par un bilan des réalisations, tests et points restant à finaliser. »
