# Audit des accès ELOAH — 14 octobre 2026

## Constats vérifiés

- Les deux tables `eloah_customer_workspaces` et `eloah_customer_workspace_items` disposent chacune de quatre politiques d'accès.
- Les huit politiques contiennent une vérification de la table `eloah_customer_entitlements`.
- Le statut d'abonnement actif est requis dans ces politiques, en complément du contrôle du propriétaire.
- Le dossier `docs/ELOAH-STRIPE-MISE-EN-SERVICE.md` est présent dans le dépôt.

## Tests encore nécessaires

1. Vérifier la création et la confirmation d'un nouveau compte.
2. Tester l'isolation des données entre deux comptes distincts.
3. Tester le refus d'accès sans abonnement, puis l'ouverture après validation d'un abonnement de test.
4. Vérifier les modules et fichiers autres que les espaces pilotes.
5. Tester les événements Stripe en mode test, y compris annulation et échec de paiement.

Les abonnements ELOAH ne doivent pas être ouverts à la vente avant ces tests. Ce rapport est un état des contrôles réalisés, et non une certification complète de sécurité.

## Simulations SQL effectuées le 14 octobre 2026

Deux identifiants UUID fictifs différents ont été simulés avec le rôle `authenticated` dans des transactions annulées (`ROLLBACK`). Pour chacun, les requêtes sur `eloah_customer_entitlements`, `eloah_customer_workspaces` et `eloah_customer_workspace_items` ont retourné zéro ligne visible. Aucun utilisateur réel ni paiement n'a été créé. Ces simulations démontrent le refus de lecture pour deux identités dépourvues d'abonnement ; elles ne remplacent **pas** un test intercomptes A/B avec deux abonnements actifs et des données possédées distinctes, ni des tests d'écriture.

## Vérification des liens entre espaces et actions

La base impose une clé étrangère composite `(workspace_id, owner_id)` pour les actions, pointant vers `(id, owner_id)` des espaces. Elle empêche qu'une action soit rattachée à l'espace d'une autre personne avec un propriétaire différent, même si l'identifiant de l'espace est connu. La contrainte est gérée côté PostgreSQL, en complément des politiques RLS. Les espaces ont également une clé étrangère `owner_id` vers `auth.users(id)` et une contrainte d'unicité `(id, owner_id)`.

Cette vérification structurelle est réussie. Elle ne remplace pas un test de connexion effectif avec deux comptes distincts.

## Audit du stockage et des médias (14 octobre 2026)

- Les trois compartiments Supabase `eloah-private`, `eloah-music-private` et `eloah-boards-media` sont configurés comme **non publics**.
- `eloah-private` et `eloah-music-private` disposent de règles Storage RLS qui exigent que le premier dossier du chemin corresponde à `auth.uid()` (opérations de lecture, ajout et suppression).
- Le compartiment `eloah-boards-media` n'a pas de politique Storage RLS directe visible dans l'inventaire consulté : son accès est géré par la fonction `eloah-boards-private-media` utilisant un jeton de lien privé et un accès serveur privilégié.
- Cette fonction vérifie un jeton aléatoire haché dans `eloah_private_view_links`, son expiration et sa révocation, puis l'identifiant propriétaire `user_id`. Les médias signés sont choisis depuis les cartes de cet utilisateur ; les URLs signées expirent après **180 secondes**. La modification nécessite le mode `edit`.
- **Limite** : l'authentification par lien privé donne des droits à toute personne qui possède ce lien tant qu'il reste valide. Vérifier la durée, la portée, le mode d'édition, la révocation, et les fonctions privilégiées qui génèrent ces liens. Le contrôle d'origine du navigateur ne constitue pas une authentification.
- Les fichiers placés sur GitHub Pages ne deviennent pas privés grâce aux réglages Supabase. Un test réel d'accès croisé, avec deux comptes autorisés, reste nécessaire.

Aucun fichier ni droit de stockage n'a été modifié lors de ce contrôle.

## Audit du partage Boards — contrôles du code serveur

Examen de la fonction déployée `eloah-boards-private-edit` : un jeton de 43 caractères est requis, haché SHA-256 puis recherché en base. Lien absent, expiré ou révoqué : refus. La fonction vérifie `access_mode === 'edit'` avant une modification ; les liens de lecture seule n'autorisent que la consultation. L'écriture vérifie `expectedUpdatedAt` et passe par une fonction de commit pour éviter l'écrasement de modifications simultanées. Les contrôles sont présents dans le code mais n'ont pas fait l'objet de tests fonctionnels exhaustifs avec des liens réels.

Points restant à tester : création de liens, durée maximale, révocation immédiate, transmission accidentelle du jeton, partage lecture seule/édition et validation complète du propriétaire dans les fonctions privilégiées.

## Contrôle des liens de partage — 14 octobre 2026

Inspection des contraintes PostgreSQL : jeton stocké en empreinte de 64 caractères, clé primaire sur `token_hash`, accès limité aux modes `read` et `edit`, et propriétaire relié à `auth.users`. Lors de l'inspection, la table contenait **deux liens valides, aucun révoqué et aucun expiré**. Les liens n'ont pas été modifiés. La vérification des conditions de refus est statique (code + schéma) : la révocation effective d'un lien lors d'un appel API réel n'a pas encore été testée.

## Simulation des conditions de révocation — 14 octobre 2026

Une requête SQL utilisant quatre scénarios calculés en mémoire (sans INSERT/UPDATE/DELETE) a vérifié le prédicat `revoked_at IS NULL AND expires_at > now()` : lien valide autorisé, lien expiré refusé, lien révoqué refusé, lien à la fois révoqué et expiré refusé. **4 scénarios sur 4 conformes.** Il s'agit d'un test logique et non d'un test HTTP bout en bout. Les deux liens existants sont restés inchangés. À tester ensuite : un jeton temporaire dédié via les fonctions `eloah-boards-private-edit` et `eloah-boards-private-media`, avant et après révocation ; attention, les URL de média déjà signées peuvent rester valides jusqu'à leur expiration (180 secondes actuellement).
