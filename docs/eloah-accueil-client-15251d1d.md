# Accueil ELOAH — présentation cliente

Page : mes-univers.html. Version du 13 octobre 2026.

## Périmètre

Accueil et formulations orientés vers une cliente : Mes projets, Mon organisation, Mes outils. Recherche de titres dans les projets, actions et notes du navigateur, ainsi que dans les outils et univers de la page. Aperçu des projets et des actions, formulaire d'ouverture de projet, liens vers les modules existants. Menu commun conservé, avec libellés simplifiés et regroupement des autres outils sur cet accueil uniquement.

Les 28 entrées du répertoire sont repliées sous « Explorer les univers ELOAH ». Le lien Foi conserve exactement `foi-control.html?file=eloah-foi-dossier-personnel-complet.md`. L'ancre #maisons et plusieurs anciennes ancres sont reconnues.

L'ancien accueil est conservé octet pour octet sous `eloah-accueil-archive-f708b682.html` (blob f708b682ca1abd1d5a1ecca0b0b5067527472c43). Il contient les anciens liens, les cartes et les notes d'audit. Cette copie reste publique : il ne s'agit pas d'une protection d'accès.

Aucune suppression ou modification des données du navigateur par le nouveau code d'accueil ; aucune tâche préremplie, écriture serveur, modification des droits ou connexion de service. Le portail client pilote existant reste distinct des données locales. Les fonctions des modules de destination ne sont pas modifiées.

## Vérifications réalisées

Syntaxe JavaScript validée avec Node. Rendu et interactions testés dans Chromium à partir du HTML chargé en mémoire. La navigation partagée, le stockage et l'intention de navigation ont été reproduits par des fixtures de test : les tests ne constituent pas une exécution du site distant ni une connexion à un compte.

Cas vérifiés : accueil neuf sans données inventées ; formulaire de projet et nom vide ; fermeture Échap et retour du focus ; recherche sans accents, aucun résultat et effacement ; ancre #maisons, filtres du répertoire et destination Foi ; projets existants, archives et tâches terminées ; doublons entre listes sans éliminer les mêmes actions à des dates différentes ; titres affichés comme texte et non comme HTML ; recherche de notes ; absence d'écrasement des données ; construction des liens avec accents et caractères spéciaux ; réutilisation d'un projet existant ; données mal formées ignorées sans réécriture ; stockage inaccessible signalé ; navigation de secours.

Rendus examinés à 320, 390, 768 et 1440 pixels. Aucun débordement horizontal dans ces prévisualisations, y compris avec le répertoire ouvert. Aucune erreur JavaScript relevée dans les cas testés.

## Restant à valider

Parcours sur le site déployé avec le script partagé complet, création effective dans le module projet, sessions authentifiées, sauvegardes entre appareils et isolation multi-comptes. L'harmonisation des autres pages n'est pas incluse. Une réorganisation visuelle ne crée pas de droits d'accès privés.
