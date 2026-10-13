# Coffre-fort — présentation cliente « Mes repères »

Route conservée : `eloah-partenaire.html?rubrique=Coffre-fort`.

## Présentation

La rubrique affiche « Mes repères », une introduction orientée vers l’usage, un bouton « Ajouter un lien ou une note », la recherche dans les titres, les liens et les notes, les filtres, et un accès aux archives. Le formulaire présente un nom, un lien public et une note ; l’avancement et la date sont facultatifs et repliés. Les sauvegardes et l’aide sont secondaires.

Le caractère non chiffré et non verrouillé est indiqué avant toute saisie. Ce n’est pas un gestionnaire de mots de passe. Les fiches du navigateur ne sont pas isolées par compte. Aucun chiffrement, compte, paiement, notification ni synchronisation serveur n’est ajouté.

## Intégration limitée à la route

`eloah-coffre-client.js` se charge uniquement pour cette rubrique. Le chargeur est ajouté au script `eloah-creations.js` déjà présent dans la page, sans réécriture du grand fichier HTML partagé avec le mailing et les formations. Les 14 061 octets de l’ancien `eloah-creations.js` restent un préfixe inchangé (blob `79581fe5915f2c0012046221b702082d1060b100`).

La vue lit les enregistrements existants de `sonia-universe-v1-itriia`, module `Coffre-fort`. Aucun repère n’est ajouté à l’ouverture par ce nouveau module. Les initialisations historiques des autres modules du moteur partagé n’ont pas été modifiées dans cette intervention.

Les changements sont faits uniquement sur action explicite. Avant chaque enregistrement, le contenu courant est relu. Une fiche modifiée dans un autre onglet n’est pas écrasée par l’ancien formulaire. Les champs supplémentaires des fiches existantes sont préservés. Archiver ne supprime pas ; la restauration remet la fiche dans la liste active.

La copie exportée contient seulement cette rubrique, archives comprises. L’import accepte le format existant `sonia-universe-v1`, filtre la rubrique, valide les fiches, affiche un aperçu puis ajoute seulement les identifiants absents. Il ne remplace pas les autres rubriques ni les fiches existantes. Les URL exécutables et les URL contenant un identifiant ou un mot de passe sont refusées. Aucun détecteur universel de secret n’est prétendu : les liens doivent rester publics et non confidentiels.

## Vérifications réalisées

Syntaxe des deux scripts vérifiée avec Node. Empreintes des fichiers publiés identiques aux fichiers testés :

- `eloah-coffre-client.js` : `b2b9446e4d69f045f7fa5f9bdb8578ecd7b548bd`.
- `eloah-creations.js` avec chargeur : `4e0ff40141a1fe23c360e490306da4d5f285bc97`.

21 scénarios ont réussi dans Chromium en prévisualisation : absence de repères inventés, formulaire et titre vide, création, modification, texte HTML affiché sans exécution, recherche sans accents, aucun résultat et réinitialisation, archivage et restauration, annulation d’un formulaire modifié et retour du focus, URL refusées, génération du fichier d’export, aperçu d’import et conservation des autres rubriques, absence de doublon, conflit d’édition, lecture invalide ou indisponible, non-activation dans Mailing, Formations et ELOAH Studio.

Les rendus à 320, 390, 768 et 1440 pixels et les formulaires ont été contrôlés ; aucun débordement horizontal relevé dans ces prévisualisations.

## Limites de ces essais

Le navigateur de test n’autorise pas la navigation vers les URL. Les tests utilisent donc un document en mémoire, une imitation de l’interface Storage, un adaptateur de route, et une structure représentant la navigation et le moteur de notes historiques. Le script du studio est repris du dépôt ; son chargeur est adapté dans la simulation pour n’effectuer aucune requête réseau. La création du contenu de l’export est vérifiée, pas un téléchargement réel dans le navigateur de Sonia.

Ces essais ne constituent pas une navigation du site distant complet ni un test de session authentifiée. Le parcours avec tous les scripts de la page publiée reste à contrôler sur l’appareil utilisateur. Aucun accès à ses données de navigateur n’a été réalisé.
