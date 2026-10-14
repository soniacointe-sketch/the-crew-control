# ELOAH — Recette avant ouverture commerciale

Statut : **à tester**. Ce document ne certifie aucun paiement et n'active aucune vente.

## Préconditions
- Stripe en **mode test** (clé `sk_test_`, prix `price_...` rattachés aux produits de test, webhook de test). Ne jamais afficher les clés dans GitHub.
- Compte cliente de test distinct du compte administrateur, e-mail confirmé.
- Les variables `ELOAH_SALES_ENABLED`, `ELOAH_STRIPE_PRICE_ENTREE`, `ELOAH_STRIPE_PRICE_PARTENAIRE` et les secrets doivent correspondre **au même environnement**. Ne pas activer les ventes réelles durant cette recette.
- Vérifier l'URL de retour et la destination du webhook. Aucune carte réelle.

## Scénarios à exécuter
| Scénario | Résultat attendu | Statut |
|---|---|---|
| Visite sans session | Aucun accès à l'espace privé | À tester |
| Compte sans abonnement | Message d'attente, aucun projet privé | À tester |
| Paiement Stripe test réussi | Session Checkout puis événement Stripe validé; droit activé | À tester |
| Retour success sans webhook | Aucun accès accordé sur simple paramètre URL | À tester |
| Paiement échoué | Pas de droit actif | À tester |
| Résiliation effective | Droit révoqué après synchronisation | À tester |
| Autre utilisateur | Impossible d'accéder aux espaces du premier compte | À tester |
| Double tentative de paiement | Pas de double abonnement involontaire | À tester |
| Installation Android | Icône et écran de lancement corrects | À tester |
| Installation iOS | Ajout écran d'accueil et ouverture corrects | À tester |

## Vérifications après test
1. Consulter les événements Stripe et la livraison du webhook.
2. Vérifier l'état de l'abonnement dans la table `eloah_customer_entitlements` par l'interface sécurisée.
3. Vérifier la protection RLS sur les espaces et actions, avec **deux comptes distincts**.
4. Tester les retours `checkout=retour` et l'indisponibilité du réseau.
5. Effacer les données de test uniquement après analyse.
6. Maintenir les ventes fermées tant que le cycle complet n'est pas validé.

## Risques connus
- Une PWA installée ne rend pas privées les pages statiques de GitHub Pages.
- L'installation iPhone réclame une validation de l'icône et du manifeste sur un appareil réel.
- Les tests de Stripe exigent un environnement test réellement isolé du mode live.

## Configuration Stripe TEST — sans toucher à la production

1. Dans le Dashboard Stripe, sélectionner un **bac à sable / environnement de test**. Vérifier visuellement que les objets et clés sont des données de test.
2. Créer deux prix récurrents mensuels EUR dans cet environnement, à 1 490 et 6 900 centimes. Relever leurs identifiants `price_...`.
3. Créer une destination webhook de test pointant vers une **fonction Supabase de test isolée** (idéalement un projet Supabase de staging distinct). Activer les événements `checkout.session.completed`, `customer.subscription.created`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.paid` et `invoice.payment_failed`.
4. Dans le projet de staging, configurer `ELOAH_STRIPE_SECRET_KEY` avec une clé Stripe de test, `ELOAH_STRIPE_WEBHOOK_SECRET` avec le secret de la destination de test, `ELOAH_STRIPE_PRICE_ENTREE` et `ELOAH_STRIPE_PRICE_PARTENAIRE` avec les prix de test.
5. Ne mettre `ELOAH_SALES_ENABLED=true` **que dans le staging**, après vérification de l'origine et des URLs de retour du Checkout. Le code actuellement déployé utilise des URLs de retour de production : elles devront être paramétrées pour le staging avant le test.
6. Exécuter les scénarios de recette avec un compte utilisateur de test. Vérifier dans les journaux Stripe et Supabase que l'accès change seulement après webhook signé.
7. Désactiver l'ouverture des ventes du staging après les tests. La production reste non modifiée.

**Attention :** le connecteur Stripe visible lors de la vérification du 14 octobre 2026 ne présentait qu'un compte en mode réel. Aucune création de produits, prix, session ou webhook n'a été effectuée. Ce plan n'est pas la preuve d'un paiement test réussi.

Sources : https://docs.stripe.com/testing et https://docs.stripe.com/api
