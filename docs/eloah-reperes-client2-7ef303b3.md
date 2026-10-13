# Mes repères — deuxième passe du parcours cliente

Fichier concerné : `eloah-coffre-client.js`.
Empreinte Git du fichier testé et publié : `7ef303b3fd4ebe0139148db8b5735c9077893ca7`.
La route `eloah-partenaire.html?rubrique=Coffre-fort`, la clé `sonia-universe-v1-itriia` et le module enregistré `Coffre-fort` restent inchangés.

## Changements

- Le bandeau et le lien du menu présent sur cet écran portent le même nom : « Mes repères ». Cette intervention ne renomme pas le menu des autres pages.
- Les liens des fiches affichent « Ouvrir le lien », avec le domaine juste en dessous.
- Les erreurs de saisie sont écrites en français sous les champs concernés. Elles sont associées aux champs pour les lecteurs d’écran.
- Quitter une saisie modifiée présente « Continuer la saisie » et « Quitter sans enregistrer ». Le choix initial garde le travail en cours.
- Archiver ou restaurer propose une annulation de la dernière opération. Une fiche changée depuis dans un autre onglet n’est pas écrasée par cette annulation.
- Après enregistrement, les filtres sont effacés et la bonne liste est affichée pour retrouver la fiche. Le clavier revient sur la fiche enregistrée.
- Les erreurs d’import et les confirmations d’export apparaissent près des commandes de sauvegarde. Les copies vides ou déjà importées ont un message adapté.

Aucun chiffrement, verrouillage, cloisonnement par compte ou service de synchronisation n’a été ajouté. La mise en garde sur les liens publics et les notes non confidentielles reste visible. Les autres champs des fiches et les autres rubriques sont conservés lors des opérations testées. Les scripts historiques de la page partagée et leurs initialisations n’ont pas été modifiés.

## Vérifications réellement exécutées

La syntaxe JavaScript a été contrôlée avec Node. Les empreintes du fichier local testé et du blob retourné par GitHub sont identiques.

21 groupes de scénarios sont passés dans Chromium :

1. Démarrage vide, nom cohérent, un seul titre visible et aucune écriture automatique du nouveau module.
2. Nom vide : erreur lisible et aucune sauvegarde.
3. Rejet des liens exécutables et des URL contenant des identifiants.
4. Création, format de stockage historique, libellé du lien et domaine.
5. Archivage et annulation.
6. Création depuis les archives avec recherche et filtre actifs ; visibilité et retour du focus sur la nouvelle fiche.
7. Fermeture d’une saisie modifiée, confirmation, conservation du texte et touche Échap.
8. Recherche sans accents, remise à zéro et affichage du HTML saisi comme texte inerte.
9. Modification sans perte des champs supplémentaires ou des autres rubriques.
10. Refus d’écraser une fiche modifiée dans un autre onglet.
11. Annulation refusée si la fiche a changé entre-temps.
12. Contenu d’export limité aux repères, archives comprises.
13. Erreur d’import affichée près du bouton.
14. Aperçu d’import puis ajout explicite sans doublons ni remplacement.
15. Réimport sans ajout et bouton « Fermer ».
16. Copie ne contenant aucun repère de la rubrique.
17. Échec d’écriture : saisie maintenue, données existantes préservées.
18. Lecture illisible ou inaccessible : écritures bloquées sans réinitialisation.
19. Non-activation sur les routes Mailing, Formations et ELOAH Studio.
20. Page, erreurs de formulaire et confirmation à 320, 390, 768 et 1440 pixels, sans débordement horizontal relevé dans ces essais.
21. Aucune erreur JavaScript dans ces cas.

Les captures du formulaire et de la confirmation à 390 pixels ont été examinées visuellement.

## Limites

Le site distant n’a pas pu être ouvert depuis cet environnement : échec de résolution réseau, puis navigation Chromium refusée par sa politique. Les essais ont donc été exécutés dans un document en mémoire avec une représentation de la structure de page partagée, une interface Storage en mémoire et le garde de route adapté uniquement pour le test. Le fichier de production garde son garde de route réel.

Les téléchargements ont été interceptés pour vérifier leur nom et leur contenu ; aucun téléchargement sur l’appareil de Sonia n’est revendiqué. Les scripts partagés complets, les sessions authentifiées, les données réelles du navigateur utilisateur et l’affichage effectif du site déployé restent à vérifier séparément. Une réussite du déploiement ne remplace pas ces essais.
