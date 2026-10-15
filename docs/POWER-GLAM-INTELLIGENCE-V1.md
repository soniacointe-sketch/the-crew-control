# Power & Glam Intelligence — V1

15 octobre 2026. Intégration dans `power-glam-control.html`, sans réécriture de la page et sans modification d’ELOAH 2040.

## Fonctions livrées

Bloc IA repliable noir prune et champagne ; commandes post, carrousel, article, reel, offre et e-mail. Neuf contextes P&G, formats, choix explicite Groq/OpenAI, aperçu exact du contexte, brief facultatif uniquement sur consentement, conversation temporaire. Copier, exporter en texte, préparer un nouveau contenu/une offre/un e-mail ou une note dans l’éditeur natif, préparer une adaptation carrousel/reel avant un nouvel envoi. Article Studio conserve un lien d’accès : collage manuel du texte, pas d’importation silencieuse.

La nouvelle interface reprend la passerelle existante `eloah-2040-founder-ai` et le stockage de session `eloah-founder-auth-v1`. La connexion est vérifiée sur action explicite ; aucun message n’est envoyé automatiquement. La fonction serveur lue avant intégration vérifie le JWT et l’identifiant fondatrice. Aucun changement du serveur, des clés, des comptes, des tables ou des règles de partage.

Pas de lecture automatique du cockpit ni de sauvegarde des conversations par le module. Une préparation dans l’éditeur remplit un NOUVEAU formulaire : l’utilisateur doit encore valider l’enregistrement. Une déconnexion efface l’échange temporaire et tout formulaire non enregistré que le module a lui-même préparé. Elle ne supprime jamais les fiches déjà sauvegardées ni les projets existants.

## Vérifications

64 assertions locales réussies, 0 échec, dans Chromium. Dimensions : 320, 390, 768, 1024, 1440 pixels. Authentification, chemin de page, stockage et réponses simulés, requêtes externes bloquées. Contrôles : aucun envoi initial, brief volontaire, refus d’un compte différent, contexte borné, copie, export, éditeur sans sauvegarde automatique, interruption, rejet des réponses tardives, déconnexion, contenu HTML traité comme texte, défaut du module, quota, réponse vide, mobile et clavier.

Ces essais ne prouvent pas une réponse réelle depuis le compte fondatrice, la disponibilité des clés/quota des moteurs, un paiement ni Safari iOS physique. Aucun appel IA payant effectué pendant cette livraison.

Contrôles statiques reproductibles : `python tests/power-glam-intelligence-check.py` (Python 3 et Node.js). Ce script ne relance pas la suite navigateur.

## Fichiers

`power-glam-intelligence.js` et `power-glam-intelligence.css` forment un composant isolé (Shadow DOM). Une ligne dans le point de chargement Power & Glam d’`eloah-lecture-universelle.js` le charge uniquement sur cette page. Les fichiers ELOAH 2040, les rubriques métier, le mode travail et le menu unique restent inchangés.
