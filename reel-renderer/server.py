#!/usr/bin/env python3
"""ELOAH Reel Studio render service. Python stdlib + FFmpeg. Run behind HTTPS reverse proxy.
Set ELOAH_RENDER_TOKEN and ELOAH_ALLOWED_ORIGIN. No persistent uploads."""
import cgi
import json
import os
import pathlib
import re
import shutil
import subprocess
import tempfile
import threading
import time
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from urllib.parse import urlparse

HOST = os.environ.get("HOST", "127.0.0.1")
PORT = int(os.environ.get("PORT", "8765"))
TOKEN = os.environ.get("ELOAH_RENDER_TOKEN", "")
ORIGIN = os.environ.get("ELOAH_ALLOWED_ORIGIN", "")
MAX_BYTES = 250 * 1024 * 1024
SEMAPHORE = threading.BoundedSemaphore(2)
FILTERS = {
    "none": "eq=contrast=1:saturation=1",
    "gold": "eq=contrast=1.07:saturation=1.18:gamma_r=1.04:gamma_b=0.96",
    "vivid": "eq=contrast=1.10:saturation=1.35",
    "cinema": "eq=contrast=1.16:saturation=0.88",
    "mono": "hue=s=0,eq=contrast=1.12",
}
def ff_escape(s):
    return s.replace("\\", "\\\\").replace(":", "\\:").replace("'", "\\'").replace("%", "\\%").replace(",", "\\,").replace("[", "\\[").replace("]", "\\]")
class Handler(BaseHTTPRequestHandler):
    def _headers(self, status, content_type="application/json", length=None):
        self.send_response(status)
        self.send_header("Content-Type", content_type)
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        if ORIGIN:
            self.send_header("Access-Control-Allow-Origin", ORIGIN)
            self.send_header("Vary", "Origin")
            self.send_header("Access-Control-Allow-Headers", "Authorization, Content-Type")
            self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        if length is not None: self.send_header("Content-Length", str(length))
        self.end_headers()
    def _error(self, code, message):
        data = json.dumps({"error": message}).encode()
        self._headers(code, length=len(data)); self.wfile.write(data)
    def do_OPTIONS(self):
        if ORIGIN and self.headers.get("Origin") != ORIGIN: return self._error(403, "Origin refusée")
        self._headers(204)
    def do_POST(self):
        if urlparse(self.path).path != "/render": return self._error(404, "Introuvable")
        if not TOKEN or self.headers.get("Authorization") != "Bearer " + TOKEN: return self._error(401, "Non autorisé")
        if ORIGIN and self.headers.get("Origin") != ORIGIN: return self._error(403, "Origin refusée")
        try: length = int(self.headers.get("Content-Length", "0"))
        except ValueError: return self._error(400, "Longueur invalide")
        if length < 1 or length > MAX_BYTES: return self._error(413, "Fichier trop volumineux (250 Mo maximum)")
        if not SEMAPHORE.acquire(blocking=False): return self._error(429, "Rendu occupé, réessaie")
        try:
            with tempfile.TemporaryDirectory(prefix="eloah-") as folder:
                # Limit the incoming body before multipart parsing.
                body = self.rfile.read(length)
                import io
                env = {"REQUEST_METHOD": "POST", "CONTENT_TYPE": self.headers.get("Content-Type", "")}
                form = cgi.FieldStorage(fp=io.BytesIO(body), environ=env, keep_blank_values=True)
                video = form["video"] if "video" in form else None
                if video is None or not getattr(video, "file", None): return self._error(400, "Vidéo absente")
                source = pathlib.Path(folder) / "source.mp4"
                with source.open("wb") as dest: shutil.copyfileobj(video.file, dest)
                if source.stat().st_size > MAX_BYTES: return self._error(413, "Fichier trop volumineux")
                raw = form.getfirst("settings", "{}")
                settings = json.loads(raw)
                start = max(0, min(float(settings.get("start", 0)), 7200))
                duration = max(1, min(float(settings.get("duration", 14)), 30))
                color = FILTERS.get(settings.get("effect", "none"), FILTERS["none"])
                phrases = [str(x).strip()[:100] for x in settings.get("texts", []) if str(x).strip()][:12]
                vf = "scale=1080:1920:force_original_aspect_ratio=increase,crop=1080:1920," + color
                font = os.environ.get("ELOAH_FONT", "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf")
                if not os.path.isfile(font): return self._error(500, "Police manquante sur le serveur")
                if phrases:
                    slot = duration / len(phrases)
                    for i, phrase in enumerate(phrases):
                        # Use textfile to avoid injection into FFmpeg's filter syntax.
                        txt = pathlib.Path(folder) / f"text-{i}.txt"
                        txt.write_text(phrase, encoding="utf-8")
                        vf += (f",drawtext=fontfile='{font}':textfile='{txt}':fontcolor=white:"
                               f"fontsize=49:borderw=3:bordercolor=black@0.7:x=(w-text_w)/2:y=h*0.79:"
                               f"enable='between(t,{i*slot:.3f},{(i+1)*slot:.3f})'")
                dest = pathlib.Path(folder) / "reel.mp4"
                cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-y",
                       "-ss", str(start), "-i", str(source), "-t", str(duration),
                       "-vf", vf, "-c:v", "libx264", "-preset", "veryfast", "-crf", "20",
                       "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k",
                       "-movflags", "+faststart", str(dest)]
                try: done = subprocess.run(cmd, capture_output=True, timeout=150, check=False)
                except subprocess.TimeoutExpired: return self._error(504, "Délai de rendu dépassé")
                if done.returncode or not dest.is_file(): return self._error(422, "Rendu impossible : vérifie le format de la vidéo")
                data = dest.read_bytes()
                self._headers(200, "video/mp4", len(data)); self.wfile.write(data)
        except (ValueError, TypeError, json.JSONDecodeError):
            self._error(400, "Paramètres invalides")
        except (BrokenPipeError, ConnectionResetError):
            pass
        except Exception:
            self._error(500, "Erreur de rendu")
        finally: SEMAPHORE.release()
if __name__ == "__main__":
    if not TOKEN or not ORIGIN: raise SystemExit("Définis ELOAH_RENDER_TOKEN et ELOAH_ALLOWED_ORIGIN avant démarrage")
    print(f"ELOAH renderer on {HOST}:{PORT}")
    ThreadingHTTPServer((HOST, PORT), Handler).serve_forever()
