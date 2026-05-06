# Stage 1: Build Backend
FROM node:22-slim AS builder
WORKDIR /app
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile

COPY . .
RUN pnpm build

# Stage 2: Final Runtime with all SDKs
FROM node:22-bookworm
WORKDIR /app

# Install all required SDKs and dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    gnupg \
    software-properties-common \
    python3 \
    python-is-python3 \
    php-cli \
    golang-go \
    openjdk-17-jdk-headless \
    build-essential \
    rustc \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install .NET SDK
RUN wget https://packages.microsoft.com/config/debian/12/packages-microsoft-prod.deb -O packages-microsoft-prod.deb \
    && dpkg -i packages-microsoft-prod.deb \
    && rm packages-microsoft-prod.deb \
    && apt-get update && apt-get install -y dotnet-sdk-8.0 \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm for the final stage
RUN corepack enable

# Copy built backend files
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json /app/pnpm-lock.yaml ./

# Install production dependencies
RUN pnpm install --prod --frozen-lockfile

# Create temp directory for code execution
RUN mkdir -p /app/temp_codes && chmod 777 /app/temp_codes

# Environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose ports
EXPOSE 5000

CMD ["pnpm", "start"]
