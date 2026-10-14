# Accueil ELOAH · Évolution 12.0

Page : `mes-univers.html`. Base : `47f09ed2276b4679d4c600c46c1b596224a52480`.
Sauvegarde : `backup/mes-univers-before-pro-20261014`.

## Livré

Fond crème, menu noir prune et accents champagne conservés. Typographie et cartes plus compactes, recherche et actions principales remontées, logo ELOAH central et ses 11 cartes conservés. Le menu mobile reste lisible. Le lecteur musical est replié par défaut sur cet accueil, sauf préférence existante du navigateur ; aucun réglage enregistré n'est modifié.

Les sections auparavant masquées `mes-projets` et `services` deviennent des volets natifs accessibles : les liens vers ces sections les ouvrent. Tous les 86 liens HTML initiaux, les 38 identifiants initiaux, les 6 univers du haut et les 28 entrées du répertoire sont conservés. Le titre et les contenus existants ne sont pas remplacés. Aucun nouvel accueil n'est créé.

Recherche locale enrichie avec les accès directs, correspondance sans accents et par plusieurs mots, navigation clavier dans les résultats, et bouton de réinitialisation des filtres d'univers. Les lectures des projets, actions et notes conservent les clés et contrats existants ; aucune écriture n'est ajoutée dans ces stockages.

59 références photographiques existantes sont conservées, rendues en images à chargement différé avec dimensions réservées. Si une image distante échoue, un repère visuel apparaît sans cacher le lien. Les URL des photographies ne sont ni remplacées ni copiées vers un autre fournisseur.

Les couches CSS accumulées dans la page sont remplacées par `eloah-accueil-pro.css`. Le code de l'accueil et son invitation d'installation sont regroupés dans `eloah-accueil-pro.js`. Les thèmes partagés, la navigation partagée, Boards, les pages de connexion, le service worker et le serveur IA ne sont pas modifiés.

## Vérifications exécutées

149 vérifications locales réussies, aucun échec : 81 contrôles d'existence de cibles locales et 68 assertions de structure ou de fonctionnement dans Chromium. Formats vérifiés : 320, 390, 768, 1 024 et 1 440 pixels. Les tests couvrent notamment les deux volets, le dialogue projet, le retour du focus, les filtres, la recherche clavier, les actions archivées ou terminées, le stockage indisponible, l'absence d'écriture, les préférences du lecteur, le dock mobile et l'invitation d'installation iPhone simulée.

Tests réalisés avec des données fictives et les requêtes réseau bloquées. Les photographies distantes n'ont donc pas été chargées dans les captures locales. Leurs repères de remplacement sont visibles dans ces captures. Les essais ne valident pas une connexion réelle, un paiement, Safari iOS physique ni la disponibilité des photographies chez leur hébergeur. Aucune requête IA payante n'a été envoyée.

## Contrôle reproductible

```sh
python tests/eloah-accueil-static-check.py
```

Python 3 et Node.js sont requis. Le workflow `ELOAH home quality` relance seulement ces contrôles statiques de structure, chemins et syntaxe : ce n'est pas la suite de tests navigateur complète.

## Séparation des espaces

Les accès client et fondatrice gardent leurs destinations d'origine. Aucune clé, permission, session, table Supabase, transaction ou donnée client n'est modifiée. Comme avant, les données de projets déjà présentes dans ce navigateur peuvent apparaître sur l'accueil ; il ne s'agit pas d'une synchronisation liée au compte connecté. L'avertissement existant sur les appareils partagés est conservé.

## Retour arrière

Conserver la branche de sauvegarde. Pour annuler cette livraison, créer un commit inverse ciblé, sans forcer l'historique ni écraser les travaux ultérieurs.
