# ELOAH 2040 — Mémoire cloud et réseau SONIA OS

_Date : 16 octobre 2026 — phase 1 de pilotage multi-agents._

## Ce qui a été livré

- `eloah-cloud-memory.js` : interface de mémoire cloud **par univers** dans `eloah-2040.html`, affichage seulement sur action de la fondatrice et partage au modèle IA **désactivé par défaut**.
- `eloah-agent-network.js` : tableau de bord en **lecture seule** interrogeant les registres réels `sonia_os_agents`, `sonia_os_missions`, `sonia_os_tasks` et `sonia_os_automations`.
- `eloah-2040-ai.js` : reprise du contexte cloud seulement quand la case de partage est cochée après chargement ou sauvegarde ; effacement de l'affichage sensible à la déconnexion ou au changement de projet.
- `eloah-2040.html` : navigation vers **Mémoire cloud** et **Mes agents**. Les autres univers et leurs styles sont préservés.

## Sauvegarde / sécurité

Une nouvelle table `public.eloah_agent_memory` est disponible dans Supabase Production, avec une ligne par couple compte + univers, texte de 1 à 6 000 caractères, date de modification, et quatre politiques RLS. Seul le compte fondatrice autorisé peut lire / écrire / modifier / supprimer ses lignes depuis un navigateur authentifié. Le rôle `anon` n'a pas le droit de sélection.

Le contenu n'est **jamais transmis à l'IA au chargement**. Pour le transmettre, il faut sélectionner l'univers, cliquer sur **Charger**, relire, cocher **Joindre l'extrait** puis **Envoyer** dans le formulaire IA. L'extrait est limité à 3 000 caractères. Aucun transfert automatique d'une conversation ChatGPT vers ELOAH n'a été ajouté.

Un bouton permet de réimporter, **après chargement de l'univers**, l'ancienne mémoire locale `eloah-agent-memory-v1`. La sauvegarde cloud nécessite ensuite une action explicite. Les anciennes sauvegardes locales ne sont jamais supprimées automatiquement.

Les comptes clients, paiements, emails, messageries, fichiers et données des enfants ne sont **pas synchronisés** dans cette mémoire.

## Utiliser cette version

1. Ouvrir `eloah-2040.html` sur le site.
2. Se connecter dans `eloah-fondatrice.html`, puis vérifier la session dans ELOAH 2040.
3. Aller à **Mémoire cloud** ; choisir un univers et cliquer sur **Charger depuis mon compte**.
4. Saisir ou importer un texte non sensible et cliquer sur **Sauvegarder dans mon cloud**.
5. Recharger la page, se reconnecter si nécessaire et vérifier que la mémoire revient via **Charger**.
6. Aller à **Mes agents** et cliquer sur **Consulter mon réseau**. Les chiffres sont ceux des registres existants, pas un nombre d'agents effectivement démarrés.
7. Activer le partage volontaire d'un extrait seulement si nécessaire et vérifier l'aperçu avant **Envoyer**.

## Vérifications effectuées

- Fichiers JS analysables syntaxiquement après retrait des imports de modules.
- Règles RLS installées et quatre politiques présentes.
- Droit `SELECT` absent pour `anon` sur `eloah_agent_memory`.
- Nouvelle table initialement vide, aucune mémoire privée préremplie à partir de l'historique.
- Flux de lecture des agents uniquement, sans commandes d'exécution.
- Workflow GitHub **ELOAH UI quality** réussi sur le commit de publication (tests statiques).
- **À vérifier sur iPhone avec session réelle** : cycle complet connexion → sauvegarde → recharge → partage IA. Aucun jeton fondateur n'a été utilisé durant l'implémentation.

## Ce qui reste à réaliser

- Import sélectif et approuvé des mémoires historiques des agents ; déduplication et provenance.
- Un moteur d'exécution serveur avec politiques A0 à A3, journal de chaque action, validations humaines et tests d'idempotence.
- Connecteurs réellement autorisés (agenda, Gmail, GitHub, WordPress...) — ne jamais assimiler un lien d'accès à une connexion authentifiée.
- Tests d'intégration multi-appareils, restauration, conflits simultanés et vérification des droits côté session fondatrice.
- Une recherche documentaire par univers et une mémoire thématique avec indexation réelle, non simulée.

**Ne pas enregistrer de clés d'API, tokens, mots de passe, dossiers de clients ou informations de mineurs dans GitHub Pages ou dans des champs de mémoire en texte brut.**


---

## Phase 2 — Centre de missions SONIA OS (16 octobre 2026)

**Livré dans ELOAH 2040 :** lien « Centre de missions », formulaire par univers, classement A0 à A3, préparation d'une demande dans ELOAH Intelligence, récupération manuelle d'une réponse IA, sauvegarde d'un plan, soumission, confirmation humaine, refus/révocation, finalisation interne A0/A1 et journal des changements.

**Fichiers :** `eloah-mission-desk.js` (interface responsive), `eloah-2040-ai.js` (montage/effacement de session), `eloah-2040.html` (navigation), `eloah-ai-pilot.js` (accès à la rubrique).

**Backend existant conservé :** les tables de SONIA OS (`sonia_os_agents`, `sonia_os_missions`, `sonia_os_tasks`, `sonia_os_automations`) ne sont **pas modifiées** et aucune nouvelle mission n'est insérée automatiquement dans leur file d'exécution.

**Backend nouveau, séparé :**
- `public.eloah_mission_desk` : dossiers privés et plans validés.
- `public.eloah_mission_desk_events` : journal des transitions, clé d'idempotence par requête.
- `public.eloah_mission_desk_apply` : transitions atomiques, vérification de version, journal et idempotence, exécutable par le rôle serveur seulement.
- `eloah_private.apply_mission_from_ui` : fonction privée privilégiée, accès refusé sans une identité fondatrice Auth vérifiée dans la session JWT.
- `public.eloah_mission_ui_action` : petite interface RPC sans privilège élevé, qui appelle le contrôle privé.

Les tables utilisent RLS. Aucun droit `INSERT` ou `UPDATE` direct n'est ouvert au navigateur, et le rôle anonyme ne peut pas lire les données. Le rôle `authenticated` ne peut appeler que le point d'entrée de commande, lequel vérifie l'identité fondatrice avant de déléguer au contrôleur privé. Une demande répétée avec la même clé n'entraîne pas une seconde transition. Un conflit de version doit entraîner une relecture.

**Niveaux A0–A3 :**
- A0 / A1 : préparer, soumettre, approuver, puis enregistrer un livrable **strictement documentaire et interne**.
- A2 / A3 : préparer et approuver le *plan*, mais aucune finalisation d'action externe dans cette interface. Lancer réellement des envois, des publications, des paiements ou des suppressions nécessiterait une autre fonction serveur avec autorisations et confirmations spécifiques.

**Contrôles techniques :**
- Migration créée sur le projet staging, contrôles des droits, puis même migration sur production.
- Contrôle des deux tables : RLS actif, lecture anonyme refusée, écriture directe `authenticated` refusée.
- Contrôle des fonctions : RPC public non privilégié ; fonction privée privilégiée non ouverte à `anon`.
- Parcours SQL de test effectué dans une transaction annulée (`ROLLBACK`) sur production : création, enregistrement du plan, soumission, approbation, finalisation A0 ; rejeu idempotent, conflit de version et impossibilité de finaliser A2.
- Aucune ligne de test ne subsiste après les transactions.
- **Test restant :** parcours complet sur l'iPhone avec une vraie session ELOAH Fondatrice. Les contrôles SQL simulent l'identité côté base mais ne remplacent pas une connexion JWT réelle en navigateur.

Cette phase n'ajoute **pas** de connexion à Qapten ; elle s'inspire du concept de centre de missions. Aucune automatisation autonome n'est lancée et aucun contenu privé n'a été importé depuis ChatGPT.
