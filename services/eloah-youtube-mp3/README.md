# ELOAH — service MP3 privé

Statut : code préparé ; aucun serveur de conversion déployé ou vérifié en ligne.

Le bouton YouTube de eloah-music.html conserve des liens sur l'appareil et affiche le lecteur officiel. Les fichiers MP3 exigent ce service distinct. Aucun fichier audio, lien personnel ou secret n'est commité.

## Installation sur un serveur Linux privé
Installer Python 3.12+, FFmpeg, un runtime JavaScript pris en charge par yt-dlp (par exemple Deno), puis :
```sh
python -m venv .venv
. .venv/bin/activate
pip install fastapi uvicorn 'yt-dlp[default]'
export ELOAH_CONVERTER_TOKEN="$(python -c 'import secrets; print(secrets.token_urlsafe(48))')"
uvicorn server:app --host 127.0.0.1 --port 8787 --workers 1
```
Conserver la clé dans le gestionnaire de secrets de l'hébergeur. Ne jamais la publier dans le dépôt. Placer le service derrière un proxy HTTPS, avec délai supérieur à 200 secondes, limites CPU/mémoire/disque et limitation de débit. Utiliser une seule instance / un seul worker : le verrou de concurrence est local au processus. Mettre à jour yt-dlp en cas d'évolution de YouTube.

## Raccordement
Dans ELOAH Music → YouTube → Récupérer un MP3, saisir l'URL HTTPS du service et sa clé privée. La clé n'est pas persistée. Elle est envoyée uniquement au service choisi. Après conversion, deux actions : télécharger le MP3 et importer dans la bibliothèque existante. L'import utilise la sauvegarde IndexedDB existante ; consulter son statut pour confirmer la persistance. Le cloud reste une action séparée.

Le service accepte uniquement des identifiants vidéo YouTube de 11 caractères, impose une authentification, limite à une conversion simultanée, 180 secondes de traitement, 20 minutes de contenu et 50 Mo de sortie. Les fichiers temporaires sont supprimés après réponse ou erreur. Ne pas exposer publiquement sans limites de ressources et de débit.

Aucun contournement d'accès, cookie ou compte YouTube n'est fourni. Les vidéos privées, protégées, indisponibles, nécessitant une connexion ou refusant l'intégration peuvent échouer. Utiliser pour des contenus dont le téléchargement est autorisé.

## Vérification avant mise en service
Tester une vidéo personnelle ou autorisée, un identifiant invalide, une mauvaise clé, une conversion dépassant les limites, l'import local et le téléchargement sur téléphone. Le test de téléchargement réel reste à faire sur l'hébergement choisi.

Documentation : https://github.com/yt-dlp/yt-dlp et https://developers.google.com/youtube/player_parameters
