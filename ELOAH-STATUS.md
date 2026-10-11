# ELOAH — état du développement (12 octobre 2026)

## Ajouts opérationnels

- `eloah-workspace.js` s’exécute après les scripts existants du projet. Il complète les onglets sans remplacer le travail des autres modules.
- Planning global `eloah-pilotage.html` et onglet Planning : CRUD d’actions, statuts, archives/restauration, vue liste/mois, export CSV/ICS et sauvegarde JSON.
- Le planning rassemble les actions de `eloah-planning-v1`, les échéances des projets et les notes datées de `sonia-universe-v1-itriia`. Il ne déclenche aucune publication ni notification.
- Équipe : répertoire local de personnes et responsabilités, modification et archivage. Aucun compte ni permission accordés.
- Facturation : journal manuel dans `state.ledger`, montants EUR/USD séparés, recettes/dépenses, statuts, archives et CSV. Budget USD calculé sur les dépenses réglées de la période. Pas de facture légale générée.
- Analytics : indicateurs calculés sur les données locales du projet, sans audience ou revenus externes simulés.
- Documents : atelier existant accessible directement, exports Markdown/texte, impression PDF, comparaison et restauration de versions sans écrasement de l’historique, ajout aux fichiers.
- Fichiers : classement par type avec validation, champ `folder`, journal `state.fileOrganizations`, annulation pendant 72 h. Métadonnées de dossier conservées par les sauvegardes cloud.
- Meta Projets : choix de projets locaux, liens et contexte croisé préparé explicitement, conversations exclues respectées. Correction correspondante appliquée à `eloah-assistant-v2.js`.
- Import JSON de projet : validation de structure puis création d’une copie distincte ; aucun écrasement du projet source.
- Sélecteurs des 24 univers et navigation vers le planning commun.

## Vérification exécutée

- Syntaxe JavaScript et scripts inline.
- Test de fusion du calendrier (actions, notes et échéances), filtrage des archives, liste de 24 univers + projet personnalisé, date Europe/Paris et échappement CSV.
- Test de validation des imports : export compatible accepté, états mal formés rejetés.
- Navigateur, projet de vérification : création et persistance d’une action après rechargement, statut terminé, vue mensuelle, archivage de l’action de test.
- Navigateur : création d’une personne, opération de dépense fictive et calcul du solde, création de deux versions de document, comparaison et restauration en troisième version.
- Navigateur : ajout du document aux fichiers, classement dans Documents puis annulation vérifiée (Sans dossier).
- Navigateur : affichage des indicateurs, du panneau Meta Projets, du planning global et des services.

## Limites restantes

- L’IA intégrée ajoutée par `eloah-assistant-v2.js` est conditionnelle à une session et au service serveur. Aucun appel IA authentifié ni consommation de crédits effectué dans cet audit.
- Sauvegardes Supabase présentes, mais aucun cycle authentifié utilisateur exécuté dans cet audit. Les actions du planning disposent d’un export JSON distinct ; elles ne font pas partie des sauvegardes cloud d’un projet.
- Aucune intégration directe WordPress, Listmonk, Stripe, générateur d’image/voix, supervision HTTP/SSL ou tâches d’arrière-plan ajoutée.
- Coffre chiffré et partage d’équipe réel non implémentés.
- Les bases utilisent un index textuel local ; ne pas présenter cela comme une indexation sémantique par modèle.
- Le navigateur de test ne contient pas les données présentes dans le navigateur personnel de Sonia.

Préserver les autres modules et relire les fichiers actuels avant modification : plusieurs conversations interviennent sur ce dépôt.
