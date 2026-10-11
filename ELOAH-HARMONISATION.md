# Harmonisation ELOAH — navigation et affichage

## En place

- Menu commun : Accueil ELOAH, Changer d’univers, Planning, Documents, Notes & préparation, Assistant IA, Bases d’expertise et Compte & sauvegardes.
- L’assistant ouvert depuis un univers conserve le nom de cet univers.
- Anciennes pages Control : nom de l’univers dans le titre, palette commune, rubriques repliables sous 1000 px, largeur minimale corrigée.
- Tableaux dédiés The Crew et MAIA : menu commun et retour explicite à l’accueil.
- Power & Glam, SONIA OS et gestion Crew : accès commun ajouté sans changer leurs fonctionnalités.
- Projet : boutons tactiles de 44 px, champs de 16 px sur petit écran, messages sans zone de lecture écrasée, formulaires contenus dans la largeur.
- Pas de modification des clés de stockage ni des données utilisateur.

## Vérification effectuée

Syntaxe JavaScript vérifiée avec node --check. Dans le navigateur, via la page eloah-verification-ecrans.html :

| Écran | Largeur du cadre | Résultat |
|---|---|---|
| MAIA, anciennes notes | 320 px et 1280 px | Pas de débordement horizontal ; rubriques repliées sur mobile et ouvertes sur ordinateur |
| MAIA, tableau dédié | 320 px | Pas de débordement horizontal |
| The Crew, tableau dédié | 320 px | Pas de débordement horizontal |
| Planning commun | 320 px | Pas de débordement horizontal |
| Documents | 320 px | Pas de débordement horizontal |
| Notes & préparation | 320 px | Pas de débordement horizontal |
| Projet générique | 320 px et 390 px | Menu utilisable, messages visibles |
| Power & Glam | 320 px | Pas de débordement horizontal, menu commun présent |

Parcours vérifiés : ouvrir Menu puis Planning ; changer de projet vers Sonia Velka ; Changer d’univers ouvre l’accueil et déplie les autres univers ; ouvrir et annuler un formulaire MAIA sans enregistrer de donnée.

## Limites explicites

Les aperçus sont des cadres de navigateur aux largeurs indiquées, pas des appareils physiques. Les barres de défilement réduisent la largeur de contenu (303 px pour un cadre de 320 px). Le clavier virtuel, Safari iOS et Chrome Android sur appareil réel restent à vérifier. Toutes les rubriques secondaires n’ont pas été ouvertes une à une. Les modifications présentes ne certifient pas le fonctionnement des services externes ni des intégrations IA.
