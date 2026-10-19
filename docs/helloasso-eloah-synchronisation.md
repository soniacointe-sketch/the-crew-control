# The Crew / ELOAH — Rapprochement HelloAsso (19 octobre 2026)

## État vérifié

- L'atelier Flashback Party du 24 octobre 2026 existe dans la base Supabase de production.
- Export HelloAsso du 19 octobre : 3 billets validés, 2 commandes, 24 €.
- Capacité annoncée : 20 billets ; disponibilité théorique à la date de l'export : 17.
- Les références des trois billets sont importées dans `private.crew_helloasso_ticket_imports`.
- Le registre `public.crew_event_registrations` possède 2 lignes historiques totalisant 16 € pour cet atelier. Ne pas additionner les deux sources.
- La table d'import est privée, sous RLS et sans accès aux rôles anonymes.
- Les fonctions `crew-helloasso-webhook` et `crew-helloasso-import` sont présentes, mais aucune preuve de réception automatique des billets de cet atelier n'a été obtenue.

## À terminer avant de déclarer l'automatisation active

1. Vérifier dans **HelloAsso > Mon compte > Intégrations et API** l'URL de notification des événements `Order` et `Payment`.
2. Vérifier l'authenticité à la réception. Attention : les en-têtes tels que `x-forwarded-for` ne sont pas une preuve d'origine s'ils ne sont pas garantis par une infrastructure de confiance. La signature HMAC est réservée aux partenaires HelloAsso qui en disposent. À défaut, ne pas valider automatiquement des paiements sur la seule base d'un webhook ; récupérer les commandes via l'API authentifiée.
3. Associer les billets à l'événement grâce aux identifiants HelloAsso (formSlug, ordre, billet). Éviter toute association sur le seul nom.
4. Exiger un identifiant unique de billet pour les imports répétés. Réconcilier les commandes et paiements séparément, sans double comptage.
5. Comparer les deux lignes historiques aux identifiants de billets avant d'effectuer un lien. Pas d'écrasement automatique.
6. Tester une notification réelle et vérifier le compteur privé avant de déclarer la connexion automatique opérationnelle.
7. Ne jamais publier de noms, e-mails, téléphones ni secrets API sur GitHub Pages.

## Références techniques officielles
- https://dev.helloasso.com/docs/notifications-webhook
- https://dev.helloasso.com/docs/secure-webhook
- https://dev.helloasso.com/docs/validation-de-vos-paiements

Document technique sans données nominatives et sans secrets.