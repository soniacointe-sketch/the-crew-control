# ELOAH — Passage en vente (préparation, octobre 2026)

**Statut : NON OUVERT AUX VENTES.** Les prix sur eloah-offres.html sont encore « envisagés » ; ne pas annoncer l’achat automatique tant que les étapes ci-dessous ne sont pas réalisées.

## Architecture actuelle
- Vitrine : `eloah-decouvrir.html` ; offres : `eloah-offres.html`.
- Connexion : `eloah-espace-prive.html` avec Supabase Auth.
- Edge Functions déployées : `eloah-checkout` (JWT requis) ; `eloah-stripe-webhook` (signature Stripe exigée).
- Table : `public.eloah_customer_entitlements` ; les règles RLS des workspaces et items exigent un statut `active`.
- Compte Stripe connecté : « soniacointe » (livemode) ; **aucun produit Stripe ELOAH récurrent confirmé** lors de la vérification.

## Obligatoire avant toute ouverture commerciale
1. Valider les fonctionnalités disponibles pour chaque offre, le montant TTC/HT, modalités de résiliation, CGV et informations légales.
2. Créer les produits et prix d'abonnement **ELOAH** dans un environnement Stripe de test, puis reprendre leurs IDs, sans réutiliser un prix Power & Glam.
3. Configurer les secrets **uniquement côté Supabase** : `ELOAH_STRIPE_SECRET_KEY`, `ELOAH_STRIPE_WEBHOOK_SECRET`, `ELOAH_STRIPE_PRICE_ENTREE`, `ELOAH_STRIPE_PRICE_PARTENAIRE`. Ne jamais les committer, ni les afficher en HTML/JS.
4. Dans Stripe, créer un endpoint de webhook vers `https://voytsqyorhoveurnguxn.supabase.co/functions/v1/eloah-stripe-webhook`. Vérifier les événements `checkout.session.completed`, `customer.subscription.created/updated/deleted`, `invoice.paid`, `invoice.payment_failed`. Le webhook accepte des requêtes sans JWT mais exige la signature Stripe.
5. Vérifier que Supabase Auth autorise bien l'inscription, la confirmation e-mail, le redirect URL du portail ELOAH et les règles anti-abus.
6. Contrôler la correspondance des Price IDs, des metadata `eloah_user_id` et du statut de facture dans le webhook. Prévoir gestion des abonnements multiples, renouvellements, remboursements, erreurs de livraison, délais de webhook et états de paiement avant production.
7. Tester avec Stripe **test mode** : création de compte → connexion → Checkout → webhook → statut actif → projet privé → refus d’accès à un autre compte → échec de paiement → annulation → réactivation. Tester les rejouements d’événements et l’ordre inversé des événements.
8. Faire relire les règles RLS des autres modules (Mailing, Boards, Documents, Studio, etc.). **Le seul portail pilote protégé ne rend pas toutes les pages GitHub Pages privées.**
9. Seulement après ces tests, ajouter un bouton « Souscrire » visible, et basculer délibérément sur les prix de production.

## Pièges critiques
- Jamais activer sur une simple redirection `?checkout=retour` : seul un événement Stripe signé, recoupé avec l'API Stripe, peut ouvrir les droits.
- Les clés `service_role` et Stripe Secret ne doivent jamais être exposées dans GitHub Pages.
- Ne pas considérer le seul statut `active` dans l'interface comme une preuve de paiement ; les contrôles serveur sont indispensables.
- Conserver le parcours de demande d’accès tant que les ventes ne sont pas testées.
