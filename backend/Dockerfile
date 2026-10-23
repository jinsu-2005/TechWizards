# Build context is the repository root (see docker-compose.yml), so this image can also include
# the attacker module: LIVE mode's POST /api/attack writes to the emulator through it.
FROM python:3.11-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PYTHONPATH=/app MALLOC_TRIM_THRESHOLD_=100000
COPY backend/pyproject.toml ./
COPY backend/app ./app
COPY backend/eval ./eval
COPY attacker ./attacker
COPY plant_emulator ./plant_emulator
COPY config ./config
COPY scripts/fetch-hai-replay.py /app/scripts/fetch-hai-replay.py
COPY scripts/backup-journal.py /app/scripts/backup-journal.py
COPY scripts/check-firebase-adc.py /app/scripts/check-firebase-adc.py
COPY docs /docs
# CPU-only torch keeps the image small.
RUN python -m pip install --no-cache-dir --upgrade 'pip>=26.2' \
 && pip install --no-cache-dir torch --index-url https://download.pytorch.org/whl/cpu \
 && pip install --no-cache-dir .
RUN python /app/scripts/fetch-hai-replay.py /app/hai-seed
COPY backend/models ./models
COPY reports /reports
ENV AT_HAI_SEED_DIR=/app/hai-seed AT_EMBED_EMULATOR=true
RUN useradd --uid 10001 --create-home attacktrace \
 && mkdir -p /data /data/live /reports \
 && chown -R attacktrace:attacktrace /app /data /reports
USER attacktrace
EXPOSE 8000
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

