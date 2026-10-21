# Plant emulator: the simulator physics behind Modbus TCP. Build context = repository root.
FROM python:3.11-slim
WORKDIR /app
ENV PYTHONDONTWRITEBYTECODE=1 PYTHONUNBUFFERED=1 PYTHONPATH=/app/backend:/app
RUN python -m pip install --no-cache-dir --upgrade 'pip>=26.2' \
 && pip install --no-cache-dir "numpy>=1.26,<3" "pydantic>=2.8" "pyyaml>=6.0" "pymodbus>=3.15,<4"
COPY backend/app ./backend/app
COPY plant_emulator ./plant_emulator
COPY config ./config
ENV EMU_HOST=0.0.0.0 EMU_PORT=5020 EMU_HEALTH_PORT=8081 EMU_TAGMAP=/app/config/tagmap.yaml EMU_MANIFEST=/app/data/emulator_manifest.json
RUN useradd --uid 10001 --create-home emulator \
 && mkdir -p /app/data \
 && chown -R emulator:emulator /app
USER emulator
EXPOSE 5020 8081
HEALTHCHECK --interval=5s --timeout=3s --retries=12 CMD ["python", "-c", "import urllib.request; urllib.request.urlopen('http://localhost:8081/health', timeout=2)"]
CMD ["python", "-m", "plant_emulator"]
