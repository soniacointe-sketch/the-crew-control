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
