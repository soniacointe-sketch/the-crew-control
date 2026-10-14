# ELOAH — préproduction Stripe (staging)

**État au 14 octobre 2026 :** projet Supabase de test **ELOAH — STAGING TEST** créé dans l'organisation de l'utilisatrice, identifiant `aozfylgqjndqaozvfnlj` (région `eu-west-1`). Les 3 tables clients et les 9 politiques RLS sont créées ; les deux fonctions `eloah-checkout` et `eloah-stripe-webhook` sont déployées et actives dans CE projet uniquement.

**Tests de paiement non lancés :** aucune clé Stripe Test ni aucun webhook de test n'ont été ajoutés par cette intervention. Les ventes restent fermées tant que le verrou `ELOAH_TEST_ENVIRONMENT=true`, la clé `sk_test_...`, `ELOAH_SALES_ENABLED=true` et les autres prérequis ne sont pas réunis.

**Contrôles effectués :** RLS active sur les 3 tables, 1+4+4 politiques, lecture interdite au rôle `anon`, lecture autorisée sous RLS au rôle `authenticated`, aucune alerte de sécurité remontée par les advisors pour ce nouveau projet.

Ces sources sont **non déployées**. Ne pas les publier dans le projet Supabase utilisé par les clientes. Ne jamais committer de clé secrète.

## Fichiers
- `eloah-checkout/index.ts` : copie isolée de la fonction Checkout, avec garde-fous `ELOAH_TEST_ENVIRONMENT=true`, `sk_test_` et URL de retour configurable.
- `eloah-stripe-webhook/index.ts` : copie isolée de la fonction webhook, avec garde-fous d'environnement de test.

## Préconditions
1. Utiliser **exclusivement le projet Supabase staging** `aozfylgqjndqaozvfnlj` : base, utilisateurs et sessions sont séparés de la production.
2. Créer un environnement Stripe de test (aucun prix ni webhook réel réutilisé).
3. Configurer les secrets **uniquement côté serveur** dans le projet staging :
   - `ELOAH_TEST_ENVIRONMENT=true`
   - `ELOAH_SALES_ENABLED=true` uniquement durant les tests
   - `ELOAH_TEST_ORIGIN=https://<domaine-de-staging>`
   - `ELOAH_TEST_RETURN_ROOT=https://<domaine-de-staging>/<chemin>/`
   - `ELOAH_STRIPE_SECRET_KEY=sk_test_...`
   - `ELOAH_STRIPE_WEBHOOK_SECRET=whsec_...` (secret du webhook de test)
   - `ELOAH_STRIPE_PRICE_ENTREE=price_...`
   - `ELOAH_STRIPE_PRICE_PARTENAIRE=price_...`
   - `ELOAH_STRIPE_PRODUCT_ENTREE=prod_...`
   - `ELOAH_STRIPE_PRODUCT_PARTENAIRE=prod_...`
4. Vérifier que les tables et règles RLS du staging sont préparées et que le compte de test ne correspond à aucune vraie cliente.
5. Les sources sont déjà déployées **sur le projet staging uniquement**. Checkout exige un JWT ; le webhook accepte les appels sans JWT pour permettre à Stripe de livrer des événements, puis exige l'environnement de test et une signature Stripe valide. Configurer ensuite la destination Stripe Test.
6. Simuler les états : checkout réussi, paiement refusé, renouvellement, expiration, annulation. Vérifier la mise à jour de `eloah_customer_entitlements` et l'isolement de deux utilisateurs.
7. Désactiver `ELOAH_SALES_ENABLED` dans staging après recette. Ne modifier aucune configuration de production sans validation distincte.

## Limitations
- Les sources sont **déployées mais inactives pour la vente** : aucun test de paiement, d'événement Stripe ni d'activation d'abonnement n'a été passé.
- Les URL de retour et les connexions publiques du site de staging doivent être adaptées.
- Les gardes test ne prouvent pas à eux seuls la sécurité complète du parcours.
