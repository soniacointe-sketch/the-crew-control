# ELOAH — Activation Google Agenda OAuth

État : interface et script de connexion implémentés, activation OAuth et test utilisateur non confirmés.

## 1. Google Cloud (compte souhaité)
- Ouvrir https://console.cloud.google.com/apis/credentials et créer/choisir un projet Google Cloud.
- Activer **Google Calendar API** dans la bibliothèque des API.
- Configurer l'écran de consentement : nom ELOAH, utilisateurs autorisés (si application en mode test), portée **https://www.googleapis.com/auth/calendar.readonly**.
- Créer un client OAuth de type **Application Web**.
- Origine JavaScript autorisée : `https://soniacointe-sketch.github.io`
- URI de redirection autorisée côté Google : `https://voytsqyorhoveurnguxn.supabase.co/auth/v1/callback`
- Conserver Client ID et Client Secret dans Google Cloud/Supabase, jamais dans GitHub.

## 2. Supabase
- Projet `voytsqyorhoveurnguxn` → Authentication → Providers → Google.
- Activer Google, renseigner Client ID et Client Secret dans le panneau privé.
- Authentication → URL Configuration → Redirect URLs :
  `https://soniacointe-sketch.github.io/the-crew-control/eloah-actions.html`
- Vérifier les règles de connexion et les utilisateurs autorisés avant toute ouverture publique.

## 3. Test réel
1. Ouvrir https://soniacointe-sketch.github.io/the-crew-control/eloah-actions.html
2. Cliquer **Connecter Google Agenda** et sélectionner explicitement le compte voulu (l’index `/u/1` n’est pas un identifiant de compte OAuth).
3. Valider les permissions de lecture ; observer le retour vers ELOAH.
4. Vérifier l’affichage d'événements à venir, puis tester **Actualiser** et **Déconnecter**.
5. Vérifier sur ordinateur et téléphone. Si erreur de redirection, vérifier les deux listes d’URI ci-dessus.

**Confidentialité** : le script utilise le scope read-only et n’effectue pas d’écriture Google Calendar. Il n’enregistre pas les rendez-vous dans GitHub. La session d’authentification est gérée côté navigateur par supabase-js ; ne pas utiliser sur un poste partagé sans se déconnecter.

**Limite** : la connexion autonome du site n’est pas la même que le connecteur Google Calendar de ChatGPT. Ce dernier ne donne pas automatiquement au site des jetons OAuth.
