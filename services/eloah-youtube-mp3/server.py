"""Private ELOAH MP3 service. Run a single uvicorn worker behind HTTPS."""
import os, re, secrets, subprocess, tempfile, threading, shutil
from pathlib import Path
from fastapi import FastAPI, Header, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from starlette.background import BackgroundTask
from pydantic import BaseModel

TOKEN = os.environ.get("ELOAH_CONVERTER_TOKEN", "")
if len(TOKEN) < 32:
    raise RuntimeError("Set ELOAH_CONVERTER_TOKEN to a random secret of at least 32 characters")
app = FastAPI(docs_url=None, redoc_url=None, openapi_url=None)
app.add_middleware(CORSMiddleware, allow_origins=[
    "https://soniacointe-sketch.github.io"
], allow_methods=["POST"], allow_headers=["Authorization", "Content-Type"])
lock = threading.Lock()

class Conversion(BaseModel):
    video_id: str

@app.post("/convert")
def convert(body: Conversion, authorization: str = Header(default="")):
    if not secrets.compare_digest(authorization, "Bearer " + TOKEN):
        raise HTTPException(401, "Clé de service invalide.")
    if not re.fullmatch(r"[A-Za-z0-9_-]{11}", body.video_id):
        raise HTTPException(400, "Identifiant YouTube invalide.")
    if not lock.acquire(blocking=False):
        raise HTTPException(429, "Une conversion est déjà en cours. Réessaie dans un instant.")
    folder = tempfile.mkdtemp(prefix="eloah-mp3-")
    handed_off = False
    try:
        # Only a canonical YouTube URL is accepted. No arbitrary remote URLs or cookies.
        command = [
            "yt-dlp", "--ignore-config", "--no-playlist", "--no-progress",
            "--no-cache-dir", "--socket-timeout", "15", "--retries", "1",
            "--max-filesize", "45M", "--match-filter",
            "duration <= 1200 & !is_live", "--format", "bestaudio/best",
            "--extract-audio", "--audio-format", "mp3", "--audio-quality", "192K",
            "--output", str(Path(folder) / "audio.%(ext)s"),
            "--", "https://www.youtube.com/watch?v=" + body.video_id
        ]
        process = subprocess.Popen(command, stdout=subprocess.DEVNULL,
                                   stderr=subprocess.DEVNULL, start_new_session=True)
        try:
            code = process.wait(timeout=180)
        except subprocess.TimeoutExpired:
            import signal
            os.killpg(process.pid, signal.SIGKILL)
            process.wait()
            raise HTTPException(504, "Conversion trop longue. Durée maximale : 20 minutes.")
        output = Path(folder) / "audio.mp3"
        if code or not output.is_file():
            raise HTTPException(422, "Vidéo inaccessible, protégée, trop longue ou refusée par YouTube.")
        if not 0 < output.stat().st_size <= 50 * 1024 * 1024:
            raise HTTPException(413, "Le MP3 dépasse la taille autorisée.")
        response = FileResponse(output, media_type="audio/mpeg",
                                filename=body.video_id + ".mp3",
                                background=BackgroundTask(shutil.rmtree, folder, ignore_errors=True),
                                headers={"Cache-Control": "no-store"})
        handed_off = True
        return response
    finally:
        if not handed_off:
            shutil.rmtree(folder, ignore_errors=True)
        lock.release()
