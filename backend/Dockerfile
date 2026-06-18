# =================================================
# Stage 1 – Build
# =================================================
FROM node:20-bookworm AS builder
WORKDIR /app

RUN npm i -g pnpm

COPY package.json pnpm-lock.yaml ./
# Install ALL deps (including devDeps) so tsc and tsc-alias are available
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

# =================================================
# Stage 2 – Runtime
# =================================================
FROM node:20-bookworm AS runner
WORKDIR /app

# ── Language SDKs for the code runner ─────────────────────────────────────────
# Register Microsoft's repo first (required for dotnet-sdk-8.0)
RUN apt-get update && apt-get install -y --no-install-recommends wget gpg ca-certificates && \
    wget -q https://packages.microsoft.com/config/debian/12/packages-microsoft-prod.deb -O packages-microsoft-prod.deb && \
    dpkg -i packages-microsoft-prod.deb && \
    rm packages-microsoft-prod.deb && \
    apt-get update && \
    apt-get install -y --no-install-recommends \
        build-essential \
        openjdk-17-jdk-headless \
        dotnet-sdk-8.0 \
        python3 \
        python-is-python3 \
        php-cli \
        golang-go \
        rustc \
        git \
        espeak-ng \
        espeak-ng-data \
        curl \
    && rm -rf /var/lib/apt/lists/* && \
    npm install -g tsx && \
    dotnet tool install -g dotnet-script

ENV PATH="$PATH:/root/.dotnet/tools"

# ── espeak-ng data – copy to a writable app-owned path ────────────────────────
# Debian bookworm puts the data under /usr/lib/<arch>/espeak-ng-data/
# Use `find` so this works on amd64, arm64, etc.
RUN mkdir -p /app/espeak-ng-data && \
    DATA_SRC=$(find /usr/lib -maxdepth 2 -name "espeak-ng-data" -type d 2>/dev/null | head -1) && \
    if   [ -n "$DATA_SRC" ]; then \
        cp -r "$DATA_SRC/." /app/espeak-ng-data/; \
    elif [ -d /usr/share/espeak-ng-data ]; then \
        cp -r /usr/share/espeak-ng-data/. /app/espeak-ng-data/; \
    else \
        echo "WARNING: espeak-ng-data directory not found – phonemizer may fail"; \
    fi && \
    chmod -R 777 /app/espeak-ng-data

# ── Set espeak-ng data path env var so phonemizer WASM can find the files ─────
ENV ESPEAK_DATA_PATH=/app/espeak-ng-data

# ── Copy built artefacts from builder ─────────────────────────────────────────
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist         ./dist

# ── Temp directory for the code runner ────────────────────────────────────────
RUN mkdir -p /app/temp_codes && chmod 777 /app/temp_codes

# ── HuggingFace / Kokoro model cache (persistent across restarts if mounted) ──
RUN mkdir -p /app/.cache/huggingface && chmod -R 777 /app/.cache

# ── Application settings ───────────────────────────────────────────────────────
ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

CMD ["node", "./dist/index.js"]
