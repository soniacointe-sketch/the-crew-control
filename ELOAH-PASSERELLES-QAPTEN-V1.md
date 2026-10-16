# ELOAH 2040 — Passerelles : 7 capacités inspirées de Qapten
Version du 16 octobre 2026 · livrable d'intégration contrôlée.

## Où accéder à l'interface
- Page dédiée : `eloah-passerelles.html`
- Menu ELOAH 2040 : « Mes passerelles ↗ »
- Répertoire de l'assistant ELOAH : « ELOAH Passerelles · connexions, import, export »

## État vérifié, sans surestimation

| Besoin | Implémentation ELOAH | Limites |
|---|---|---|
| 1. Mémoire persistante | Table Supabase `eloah_agent_memory` déjà créée, lecture par univers, contrôle fondatrice | Pas de collecte automatique depuis ChatGPT |
| 2. Connexions | Lecture seule du registre `sonia_os_connections` | Statut déclaré ≠ authentification OAuth testée ; pas 150 connecteurs opérationnels |
| 3. Automatisations | Vue `sonia_os_automations` + lien Centre de missions A0–A3 | N'envoie, ne publie et ne déclenche aucune action externe |
| 4. Plusieurs IA | Vue `sonia_os_model_registry`, choix existant Groq / OpenAI dans ELOAH Intelligence | Pas de promesse de 30 modèles utilisables. Changement de moteur : historique local conservé, transfert à l'autre moteur désactivé par défaut |
| 5. WhatsApp/Telegram | États distincts et mention du webhook The Crew existant | Pas de bot ELOAH personnel connecté et vérifié |
| 6. Import ChatGPT | Lecture locale d'un fichier `conversations.json` (8 Mo max), sélection des échanges, extrait modifiable, confirmation avant ajout à la mémoire cloud ; saisie manuelle des préférences et consignes | Pas d'import intégral d'un ZIP ni de recréation automatique des assistants personnalisés |
| 7. Export mémoires | Export JSON/Markdown de la mémoire cloud après vérification du compte fondatrice | N'exporte pas automatiquement Gmail, WhatsApp, les bases SONIA OS ou l'ensemble de l'historique ChatGPT |

## Sécurité et fonctionnement
- L'interface ne demande pas de mot de passe : elle réutilise l'identification ELOAH Fondatrice existante.
- Toute requête aux tables propriétaires est filtrée par `owner_id`, sous RLS du projet Supabase.
- Les compteurs de connexions, modèles et routines sont des **enregistrements**, jamais une preuve d'exécution ou de connexion authentifiée.
- L'import ChatGPT reste entièrement local **jusqu'au clic de confirmation de sauvegarde**. L'utilisateur choisit une conversation, vérifie et modifie l'extrait, puis sélectionne son univers.
- Limite de la mémoire : 6 000 caractères par univers. Si la mémoire existante + le nouvel extrait dépasse cette limite, l'enregistrement est refusé.
- Pour une mémoire déjà existante, la mise à jour compare le `updated_at` initial afin d'éviter d'effacer une nouvelle version enregistrée entre-temps sur un autre appareil. L'import dans un univers inexistant utilise `insert` afin de ne pas écraser une création concurrente.
- Les exports JSON et Markdown sont en clair. Le propriétaire doit les conserver dans un stockage privé.
- Ne jamais coller de jetons, clés, mots de passe, données médicales ou informations confidentielles sur des tiers dans la mémoire.
- Les clés de service privées Supabase ne sont pas utilisées dans le code client.

## Vérifications
- Syntaxe des modules `eloah-passerelles.js`, `eloah-2040-ai.js` et `eloah-2040-ui.js` analysable.
- Tous les identifiants DOM utilisés par le module Passerelles existent dans la page.
- Parser testé sur un exemple de conversation ChatGPT avec une chaîne parent-enfant de trois messages, dans le bon ordre.
- Tests GitHub Actions ELOAH UI quality sur la version intégrée.
- **Reste à tester en personne** : compte fondatrice réel dans un navigateur mobile, cycle export, réimport et synchronisation cross-device.
- **Non vérifié** : connexions OAuth effectives, exécution de modèles externes, WhatsApp personnel, Telegram personnel.

## Utiliser la fonctionnalité
1. Ouvrir `eloah-passerelles.html`, se connecter à `eloah-fondatrice.html` si nécessaire.
2. Cliquer « Vérifier mes services », consulter les données réellement référencées.
3. Pour l'import ChatGPT, extraire `conversations.json` de l'archive exportée depuis ChatGPT.
4. Sélectionner un échange, relire la zone de texte (6 000 caractères maximum) et choisir l'univers.
5. Cocher la confirmation et enregistrer. La mémoire est ensuite disponible dans ELOAH 2040 → Mémoire cloud.
6. Pour transférer ses mémoires, cliquer « Exporter mes mémoires JSON » ou « Exporter en Markdown ».

Aucune synchronisation ou copie intégrale de l'historique ChatGPT n'a été effectuée automatiquement dans le cadre de ce développement.
