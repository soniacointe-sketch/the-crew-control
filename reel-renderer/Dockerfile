FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends ffmpeg fonts-dejavu-core && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY reel-renderer/server.py /app/server.py
RUN useradd -r -u 10001 eloah
USER eloah
ENV HOST=0.0.0.0 PORT=8765 PYTHONUNBUFFERED=1
EXPOSE 8765
CMD ["python","/app/server.py"]
