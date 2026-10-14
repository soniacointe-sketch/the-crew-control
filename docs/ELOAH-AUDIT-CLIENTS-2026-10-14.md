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
