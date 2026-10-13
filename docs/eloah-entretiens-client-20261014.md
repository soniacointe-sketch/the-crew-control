# Mes entretiens — parcours cliente

Route demandée conservée : `eloah-partenaire.html?rubrique=Entretiens`. Elle charge déjà le module `eloah-entretiens-control.html` dans un cadre. Le grand fichier partenaire, ses autres rubriques et son moteur historique n'ont pas été réécrits.

## Présentation

Titre : « Mes entretiens ». Introduction : « Prépare tes rendez-vous, garde le fil de tes échanges et retrouve tes prochaines étapes. »

Trois entrées principales : Mes rendez-vous ; Avant l'entretien ; Après l'entretien. La vue calendrier et le regroupement par nom restent secondaires. Les compteurs, copies de données et commandes de connexion sont repliés. Les formulations destinées à la coach, le conducteur minute par minute et le tarif de référence ont été retirés de cette vue ; les fichiers modèles existants n'ont pas été supprimés.

Le bouton principal « Noter un rendez-vous » indique explicitement qu'il crée une fiche et non une réservation. Le formulaire demande le nom du rendez-vous, une date facultative et les sujets à préparer. Activité, statut, repère de contact et date de suivi sont facultatifs. Modifier une date ou un statut ne contacte pas l'autre personne.

La préparation présente trois questions : mon sujet, ce que je souhaite clarifier, mes questions. Les listes de préparation et de bilan ne sont plus limitées à Power & Glam. La préparation exclut les fiches terminées, refusées ou annulées ; le bilan exclut celles refusées ou annulées. Aucune nouvelle fiche ni plan de sept jours n'est imposé au chargement.

Le bilan est présenté comme un écrit personnel de la cliente, pas un compte rendu reçu de la coach. Les champs de bilan existants sont conservés. L'intitulé de l'export PDF devient « Mon bilan personnel » ; le chargement de la bibliothèque PDF demeure nécessaire.

L'aide à la formulation ouvre une demande générique à relire et copier. Contrairement à l'ancien lien direct, aucune note, aucun nom ni contact du rendez-vous ne sont incorporés automatiquement dans la demande destinée à ChatGPT. Le lien ouvre ensuite ChatGPT séparément ; aucun envoi automatique.

## Données et limites conservées

Clés locales : `eloah-entretiens-crm-local-v1` et `eloah-report-<id>`. Champs de rendez-vous : id, name, universe, date, state, contact, followup, notes. Les champs supplémentaires d'une fiche locale sont préservés lors d'une modification.

Tables existantes : `eloah_appointments` et `eloah_appointment_reports`. Les appels de compte, les règles d'accès et les schémas de base n'ont pas été remplacés par une nouvelle intégration. Aucune modification de droits ni écriture serveur réelle n'a été effectuée lors de cette intervention. Le mode authentifié et ses conversions horaires héritées restent à vérifier séparément.

La copie JSON des rendez-vous n'inclut pas les bilans. La restauration héritée remplace les fiches locales après confirmation, ce qui est indiqué avant utilisation. Le transfert local-vers-compte existant peut créer des doublons. Ces mécanismes n'ont pas été transformés en synchronisation automatique.

Les données locales ne sont ni verrouillées ni séparées par compte. La vue indique de ne pas y saisir de contenu confidentiel. Cette refonte ne crée pas un portail privé de consultation et ne valide pas la séparation entre plusieurs clientes.

Écriture locale : une donnée illisible ou modifiée depuis un autre onglet bloque l'enregistrement plutôt que d'être écrasée. Un échec d'écriture conserve la saisie ouverte et rétablit les données en mémoire ; une nouvelle tentative ne crée pas de doublon dans les scénarios testés. Le formulaire propose de continuer une saisie ou de quitter sans enregistrer. Les bilans non enregistrés demandent confirmation avant changement de vue.

## Intégration visuelle

Le cadre réutilise le menu de la page parente et adapte sa hauteur au contenu. Les éléments historiques parasites du parent sont masqués uniquement lorsque la route Entretiens charge ce module. Les dialogues sont ajustés à la hauteur disponible du navigateur parent. Le module seul charge la navigation commune.

## Fichiers testés et publiés

- `eloah-entretiens-control.html` : blob `2594796c88445fd088a90e6514cc9d2297cc5014`.
- `eloah-entretiens-client.js` : blob `b51d85751cb158e42b529ff5f1ded496d984d8e6`.

Les empreintes locales des fichiers testés correspondent aux empreintes retournées par GitHub.

## Vérifications réellement exécutées

Syntaxe JavaScript vérifiée avec Node et absence de doublons d'identifiants dans le HTML. Deux suites Chromium, 36 et 13 contrôles : titre visible unique, absence d'écriture au démarrage, trois entrées principales, avertissement de non-réservation, formulaire et nom vide, création et format historique, texte HTML utilisateur inerte, préparation hors Power & Glam, demande IA sans données de la fiche, abandon et reprise d'une saisie, bilan initial non prérempli, sauvegarde du bilan, recherche et absence de résultat, contenu de l'export intercepté, anciens enregistrements, exclusion des rendez-vous terminés et annulés en préparation, conservation des champs supplémentaires, calendrier, échec d'écriture et reprise, conflit entre onglets, recherche sans accents, protection du bilan non enregistré, intégration dans le cadre et absence d'erreurs JavaScript dans ces essais.

Affichage du module et du formulaire contrôlé à 320, 390, 768 et 1440 pixels. Aucun débordement horizontal de page relevé dans ces essais. Le calendrier conserve un défilement horizontal interne pour rester lisible sur téléphone. Les captures de l'accueil, de la préparation et du formulaire à 390 pixels ont été examinées.

### Limites des essais

Le téléchargement réseau direct du dépôt depuis le conteneur a échoué (résolution DNS). Les tests ont utilisé le HTML et le JavaScript en mémoire, un stockage simulé et des données fictives. Les scripts distants ont été bloqués. Le cas du cadre utilise une structure parente représentative et un garde de paramètre adapté uniquement pour le test ; le garde réel est conservé dans le code publié.

La navigation partagée complète, le moteur historique entier du parent, les comptes authentifiés, les droits multi-utilisateurs et les données réelles de Sonia n'ont pas été testés. La création réelle du PDF avec la bibliothèque distante et les téléchargements sur l'appareil utilisateur ne sont pas revendiqués. Le fichier JSON a été intercepté pour contrôler sa destination ; aucun fichier personnel n'a été importé ni envoyé. Une réussite du déploiement est distincte de ces vérifications.
