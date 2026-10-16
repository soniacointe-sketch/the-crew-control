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
