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
