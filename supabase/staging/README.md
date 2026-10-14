# ELOAH — préparation Stripe staging

Ces sources sont **non déployées**. Ne pas les publier dans le projet Supabase utilisé par les clientes. Ne jamais committer de clé secrète.

## Fichiers
- `eloah-checkout/index.ts` : copie isolée de la fonction Checkout, avec garde-fous `ELOAH_TEST_ENVIRONMENT=true`, `sk_test_` et URL de retour configurable.
- `eloah-stripe-webhook/index.ts` : copie isolée de la fonction webhook, avec garde-fous d'environnement de test.

## Préconditions
1. Créer ou sélectionner un projet **Supabase staging distinct** : base, utilisateurs et sessions séparés de la production.
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
4. Vérifier que les tables et règles RLS du staging sont préparées et que le compte de test ne correspond à aucune vraie cliente.
5. Déployer ces sources **seulement sur le projet staging**, avec vérification JWT pour Checkout et une destination publique limitée au webhook Stripe signé.
6. Simuler les états : checkout réussi, paiement refusé, renouvellement, expiration, annulation. Vérifier la mise à jour de `eloah_customer_entitlements` et l'isolement de deux utilisateurs.
7. Désactiver `ELOAH_SALES_ENABLED` dans staging après recette. Ne modifier aucune configuration de production sans validation distincte.

## Limitations
- Les sources sont une **base de recette** : aucun test d'intégration Stripe ou de webhook n'a été passé.
- Les URL de retour et les connexions publiques du site de staging doivent être adaptées.
- Les gardes test ne prouvent pas à eux seuls la sécurité complète du parcours.
