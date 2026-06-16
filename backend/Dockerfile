# -------------------------------------------------
# Stage 1 – Build the Node application
# -------------------------------------------------
FROM node:20-bookworm AS builder
WORKDIR /app

# Install pnpm and build the project
RUN npm i -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

# -------------------------------------------------
# Stage 2 – Runtime (the container Render actually executes)
# -------------------------------------------------
FROM node:20-bookworm AS runner
WORKDIR /app

# ----- Critical native binaries for phonemizer -----
RUN apt-get update && apt-get install -y \
    espeak-ng \
    espeak-ng-data \
    && rm -rf /var/lib/apt/lists/*

# ----- Additional language SDKs (optional but kept for code‑runner) -----
RUN apt-get update && apt-get install -y \
    openjdk-17-jdk-headless \
    dotnet-sdk-8.0 \
    python3 python-is-python3 \
    php-cli \
    golang-go \
    rustc \
    git \
    && rm -rf /var/lib/apt/lists/*

# ----- Copy the built assets and production node_modules -----
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist

# ----- Temp execution directory (required by your code runner) -----
RUN mkdir -p /app/temp_codes && chmod 777 /app/temp_codes

# ----- Expose the service port -----
EXPOSE 10000

# ----- Start the application -----
CMD ["node", "./dist/index.js"]
