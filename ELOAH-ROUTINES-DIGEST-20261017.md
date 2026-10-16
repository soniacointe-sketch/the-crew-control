# ELOAH — Synthèses sourcées des routines (17 octobre 2026)

## Objectif

Un rappel programmé doit faire ressortir des éléments exploitables et vérifiables, plutôt que de simples compteurs. Cette version fournit une **sélection déterministe de sources indexées**, sans génération par un modèle IA ni accès automatique à Gmail ou à des comptes tiers.

## Fonctionnement

- La routine programmée reste désactivée tant que la fondatrice ne l'a pas activée. La routine « messages » déjà activée conserve son horaire et sa fréquence.
- Au créneau programmé, la fonction privée Supabase `eloah_private.enqueue_due_routines` enregistre dans `eloah_routine_runs` un instantané contenant les compteurs existants, un titre explicatif et une liste de **trois courriers P1 maximum**.
- L'assistant privilégie les échéances confirmées, puis les dossiers dont l'index a été actualisé récemment.
- Les champs stockés sont limités aux titres, actions proposées, dates, et avertissement de fraîcheur. Aucun corps intégral d'e-mail, mot de passe ni jeton OAuth n'est copié.
- Les résultats apparaissent dans ELOAH → Mes routines → Ma boîte de routines, avec accès à Agent Courrier pour vérifier le dossier.
- « Préparer le brief » reporte les éléments visibles dans un brouillon local. Il faut encore relire et cliquer soi-même sur « Envoyer » dans ELOAH Intelligence.

## Sécurité et limites

- Fonctions privées non exécutables par `anon` ou `authenticated` ; la création des instantanés appartient au moteur de planification serveur.
- Table `eloah_routine_runs` soumise à RLS ; seuls les résultats du compte fondatrice sont lisibles.
- Les données `eloah_mail_items` sont un **index existant**, pas la preuve d'une synchronisation Gmail en temps réel. L'ancienneté est signalée. Une échéance n'est affichée que lorsqu'elle est confirmée.
- Aucun envoi Gmail, aucune publication, aucun paiement, aucune notification push, ni appel à une IA externe au moment du cron.
- Si la routine « messages » est active, le premier créneau prévu reste **le 17 octobre 2026 à 08:00 heure de Paris**. Le résultat effectif ne peut être confirmé qu'après cette exécution. Le moteur peut manquer un créneau en cas d'indisponibilité prolongée.

## Contrôles

- Migrations Supabase de la fonction de sélection P1 et du moteur horaire appliquées en production.
- Contrôle que l'appel anonyme et l'appel `authenticated` aux fonctions privées sont interdits.
- La tâche pg_cron existante reste configurée toutes les cinq minutes.
- Syntaxe JS et tests statiques du site, présence du composant de synthèse et liens de provenance.
- Le schéma de test ne contenait pas de copie de `eloah_mail_items`, donc la migration métier n'y a pas été appliquée.
- Il reste à constater le **premier vrai résultat** après 08:00 dans la boîte ELOAH pour conclure à un fonctionnement bout en bout.
