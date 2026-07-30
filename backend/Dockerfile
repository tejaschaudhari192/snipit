# =================================================
# Stage 1 – Build
# =================================================
FROM node:22-bookworm AS builder
WORKDIR /app

RUN npm install -g pnpm

COPY package.json package-lock.json* ./
# Install ALL deps (including devDeps) so tsc and tsc-alias are available
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm build

RUN rm -rf node_modules && pnpm install --prod --frozen-lockfile

# =================================================
# Stage 2 – Runtime
# =================================================
FROM node:22-bookworm AS runner
WORKDIR /app

RUN npm install -g pnpm

# ── Language SDKs for the code runner ─────────────────────────────────────────
# Register Microsoft's repo first (required for dotnet-sdk-8.0)
RUN apt-get update && apt-get install -y --no-install-recommends wget gpg ca-certificates apt-transport-https && \
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
        curl && \
    rm -rf /var/lib/apt/lists/* && \
    pnpm add -g tsx && \
    dotnet tool install -g dotnet-script

ENV PATH="$PATH:/root/.dotnet/tools"

# ── Copy built artefacts from builder ─────────────────────────────────────────
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist         ./dist

# ── Temp directory for the code runner ────────────────────────────────────────
RUN mkdir -p /app/temp_codes && chmod 777 /app/temp_codes

# ── Application settings ───────────────────────────────────────────────────────
ENV NODE_ENV=production
ENV PORT=10000

EXPOSE 10000

CMD ["pnpm", "run", "start"]