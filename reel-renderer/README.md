# ELOAH Reel Studio — moteur MP4

## État

Le site GitHub Pages héberge l'éditeur visuel. Le serveur de rendu ci-joint est un **composant à déployer séparément** : GitHub Pages ne peut pas exécuter FFmpeg ni recevoir des vidéos pour les encoder.

Le bouton « Exporter MP4 avec son (serveur) » envoie la vidéo et les réglages à l'URL HTTPS renseignée. Le serveur produit un MP4 H.264/AAC avec texte et colorimétrie. Le son original est conservé lorsqu'il existe dans la source. **Il ne détecte pas encore les temps musicaux, ne choisit pas une chorégraphie et ne réalise pas de montage multi-plans.**

## Démarrage sur serveur privé (Python 3.11/3.12 + FFmpeg)

```bash
sudo apt-get update
sudo apt-get install -y ffmpeg fonts-dejavu-core python3
export ELOAH_RENDER_TOKEN='UN_SECRET_LONG_ET_ALEATOIRE'
export ELOAH_ALLOWED_ORIGIN='https://soniacointe-sketch.github.io'
export HOST=127.0.0.1
export PORT=8765
python3 reel-renderer/server.py
```

Installer un reverse proxy HTTPS (Caddy, Nginx, etc.) vers 127.0.0.1:8765, avec limite de requête d'au moins 250 Mo et délais adaptés. Ne jamais placer le jeton dans GitHub, le HTML ou un lien public. Saisir l'adresse du serveur et le jeton directement dans le studio lors de l'export.

## API

`POST /render` avec `Authorization: Bearer <token>` et multipart/form-data :
- `video` : fichier source (max. 250 Mo)
- `settings` : JSON `{"start":28,"duration":14,"effect":"gold","texts":["Pas besoin d'être pro","Bienvenue dans le Crew"]}`

Réponse : `video/mp4`. Fichiers temporaires supprimés après chaque requête. Maximum deux rendus simultanés.

## Limites et sécurité

- Le service n'est pas déployé automatiquement.
- Le backend est une première base technique, non auditée pour exposition publique à grande échelle. Utiliser un serveur privé, authentification, HTTPS, quotas, pare-feu et supervision.
- Python 3.13+ a retiré `cgi`; utiliser Python 3.11 ou 3.12 pour cette version.
- Le navigateur peut limiter l'upload des gros fichiers et la qualité de prévisualisation.
- Avant diffusion, tester la lecture MP4 et le son sur téléphone.
- Ne jamais importer une vidéo contenant des mineurs sans les autorisations nécessaires pour l'usage prévu.
