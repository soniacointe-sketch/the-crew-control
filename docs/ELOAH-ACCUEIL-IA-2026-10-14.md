# IA directement sur l’accueil ELOAH — 13.0

Page : mes-univers.html. Base : b3135bc7f7a98fe136f21c3b7a196ec1c2c7fbdd.
Sauvegarde : backup/accueil-before-inline-ai-20261014.

## Ajout

Le bloc « ELOAH, aide-moi à… » est placé sous la recherche de l’accueil. Il permet de rédiger une demande, choisir un projet et un moteur, poursuivre un échange temporaire, prévisualiser le texte transmis, copier ou enregistrer la réponse et interrompre la réception. Les suggestions préremplissent le champ sans envoyer de demande.

Le nouveau fichier eloah-accueil-ia.js est chargé par une balise ajoutée en fin de page. Le HTML, les photos, les liens, le thème, les résumés locaux et leur contrôleur sont autrement inchangés. Une erreur du module IA ne remplace pas les outils existants.

## Connexion et périmètre

Réutilisation de la session Supabase eloah-founder-auth-v1 et de la passerelle serveur existante eloah-2040-founder-ai, réservée à l’identité fondatrice. Le code de cette fonction a été relu et son statut ACTIVE vérifié avant intégration. Aucune fonction Supabase, clé, table, permission ou page de connexion n’est modifiée par cette livraison.

Le SDK existant reste épinglé à la version 2.116.0 et n’est chargé qu’au clic de vérification ou d’envoi. L’identité est vérifiée via getUser avant la demande. Une clé publishable existante est utilisée côté navigateur ; les clés des moteurs restent sur le serveur. Les comptes clientes ne reçoivent pas de nouveaux droits.

Seuls le message rédigé, le nom du projet choisi et, lorsque l’option est active, un contexte borné des derniers échanges sont transmis au moteur choisi. Aucune lecture automatique de notes, documents, titres de projets ou données clientes. Les réponses sont affichées en texte, sans exécution de HTML. Aucun envoi automatique au chargement, après connexion ou vers un autre fournisseur en cas d’échec. Les frais éventuels du moteur OpenAI sont signalés dans les réglages.

Les échanges sont temporaires dans la page, sans sauvegarde automatique dans le navigateur ni la base. Changement de projet, de moteur ou d’option de contexte : remise à zéro. Déconnexion, changement de session ou fermeture : suppression de l’échange à l’écran et abandon des réponses tardives. Interrompre une réception n’annule pas nécessairement le traitement déjà lancé sur le serveur.

## Vérification

47 assertions locales réussies dans Chromium avec Auth et IA simulées, réseau externe intercepté. Couverture : absence d’appel IA au chargement, préremplissage, réponse sur place, continuité, exclusion du contexte privé du navigateur, copie, double envoi, annulation et réponses tardives, compte absent/différent, échec SDK, moteur non configuré, texte HTML inerte, préservation d’un brouillon saisi pendant une demande, fermeture, formats 320 / 390 / 768 / 1440 pixels et clavier mobile.

Le contrôle statique existant de l’accueil a également réussi. Le workflow de qualité de l’accueil vérifie désormais la syntaxe du nouveau module. Les essais navigateur ont été exécutés localement ; ce workflow ne les relance pas.

Limites : aucune session fondatrice réelle n’a été utilisée et aucun appel fournisseur n’a été facturé pendant ces essais. Une première réponse réelle reste à confirmer par Sonia ; elle dépend de la connexion, des clés serveur et des quotas disponibles. Les tests ne constituent pas un audit global de la plateforme ou de Safari iOS.

Sources techniques consultées : documentation Supabase getUser, onAuthStateChange et changelog, plus les fichiers existants eloah-2040-ai.js et eloah-2040-founder-ai. Aucun modèle ou nouveau compte fournisseur n’est créé.
