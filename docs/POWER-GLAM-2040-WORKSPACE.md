# Power & Glam 2040 — affinage du bureau

15 octobre 2026. Périmètre : `power-glam-control.html` uniquement.

Le décor noir prune et champagne est conservé. Ajout d'anneaux décoratifs désactivables, d'un mode travail temporaire, de trois actions directes (éditeur existant, planning, lien vers ELOAH Intelligence), d'un filtre des neuf espaces et d'une recherche des 22 rubriques. Le menu unique et tous les liens sont conservés. Affichage téléphone plus compact, textes des éditeurs et lecteur harmonisés.

Le module ne lit ni compte ni donnée de projet, ne modifie aucun stockage et ne lance aucun appel IA. Les boutons renvoient aux fonctions existantes. Les états des cartes, dont « À connecter » et « Verrouillé », restent inchangés. Le lien ELOAH Intelligence ouvre l'assistante existante, il ne connecte pas une nouvelle IA dans Power & Glam.

Chargement limité à Power & Glam par le point de chargement visuel déjà présent dans `eloah-lecture-universelle.js`. La logique de lecture audio et les fichiers ELOAH 2040 ne sont pas changés.

## Vérifications

99 vérifications locales réussies dans Chromium : sections natives, filtres, recherche clavier, modes d'affichage, éditeur existant, absence de sauvegarde automatique par les nouveaux contrôles, ordre de chargement et absence de débordement sur 320, 390, 768, 900, 1024 et 1440 pixels.

Essais avec stockage fictif en mémoire, chemin de page simulé et requêtes réseau bloquées. Ils ne valident pas une connexion réelle, un paiement, une réponse IA ou Safari iOS physique. Aucun appel payant effectué.

Contrôle statique reproductible (Python 3 et Node.js) :

```sh
python tests/power-glam-2040-workspace-check.py
```

Les captures et résultats détaillés du navigateur accompagnent la livraison dans la conversation. Le contrôle statique ci-dessus ne relance pas cette suite navigateur.
