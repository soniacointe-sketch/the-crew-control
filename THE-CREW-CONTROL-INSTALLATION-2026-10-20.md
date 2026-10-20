# Installation du mémoire dans The Crew Control
20 octobre 2026

## Destination
https://soniacointe-sketch.github.io/the-crew-control/index.html#crew-controls

## Réalisé
Le centre de pilotage comporte désormais cinq rubriques et 27 accès :
- Gérer : adhérents, familles, préinscriptions, essais, planning, présences, absences, événements, participants.
- Argent : gestion financière existante, brouillons de facturation et relances.
- Communiquer : mailing, messages, calendrier éditorial, studio et articles.
- Piloter : tâches, décisions, comptages, automatismes, système et contrôle quotidien.
- Références : procédures, mémoire consultable avec recherche, règles métier, espace de travail et site public.

Les modules existants sont réutilisés. Les outils distincts s’ouvrent dans un nouvel onglet.

## Nouveaux écrans reliés à la base privée
- Planning : lecture des séances à venir, filtre par groupe, création d’une séance, annulation motivée, remise au planning et statut terminé.
- En cas d’annulation avec essais planifiés : une tâche interne de replanification est ajoutée ; aucun message n’est envoyé automatiquement.
- Absences : recherche, filtre à traiter/traitées, lecture des dates et notes, changement d’état. Le pointage des présences reste distinct.
- Événements : création et modification de la fiche, dates, horaires, tarif, capacité plafonnée à 20, public, lieu, responsable et billetterie.
- Indicateurs : comptages instantanés privés ; aucun taux de conversion par cohorte inventé.
- Automatismes : lecture en direct de la configuration des trois contrôles en base.
- Documents : accès aux procédures et lecture/recherche du mémoire d’instructions.

## Technique
- Nouveau fichier : crew-control-installation.js.
- Chargement depuis index.html.
- Extension de crew-control-action, version 14 lors de l’installation.
- Nouvelles actions : hub_overview, hub_absences, hub_absence_status, hub_session_create, hub_session_status, hub_event_save, hub_indicators.
- Même vérification administrative que la fonction existante ; aucun nouvel utilisateur autorisé.
- Fonction SQL crew_control_automation_state(), exécutable uniquement par service_role.
- La modification d’un événement dans ELOAH ne modifie pas automatiquement WordPress ou HelloAsso.

## Vérifications réalisées
- Déploiement serveur accepté.
- Fonction SQL d’état des tâches vérifiée sous le rôle service_role.
- Accès SQL refusé aux rôles anon et authenticated.
- Appels HTTP réels sans connexion : 401 sur les nouvelles lectures et écritures contrôlées.
- Treize tests isolés du code serveur : refus anonyme, refus d’un non-administrateur, lecture d’absences, absence de confirmation, date invalide, annulation sans motif, statut d’absence interdit, capacité supérieure à 20, URL dangereuse, création de séance, création d’événement, traitement d’absence et comptages.
- Aucun enregistrement réel, paiement ou e-mail lors de ces tests isolés.
- Syntaxe du nouveau script vérifiée.

## Limites
La connexion du navigateur de contrôle a renvoyé « Invalid login credentials ». Les nouveaux écrans privés n’ont donc pas été validés visuellement dans une session administratrice.
Restent le contrôle sur téléphone et les autres navigateurs, les tests de réception d’e-mail du parcours d’essai, les vérifications HelloAsso, la finalisation K-pop et les données d’indicateurs non collectées.
Les factures restent des brouillons non émis. L’identité et les mentions fiscales ne sont pas considérées comme vérifiées.
Le portail individuel sécurisé, les statistiques propres au chatbot et l’envoi automatique mensuel de newsletters ne sont pas activés par cette installation.
