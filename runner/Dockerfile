FROM node:22-bullseye-slim

# Install compilers & runtimes
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    gcc \
    g++ \
    default-jdk \
    golang-go \
    php-cli \
    rustc \
    bash \
    && rm -rf /var/lib/apt/lists/*

# Symlink python3 to python
RUN ln -s /usr/bin/python3 /usr/bin/python

# Create working directory
WORKDIR /app

# Copy dependency files
COPY package.json ./

# Install npm dependencies
RUN npm install

# Copy application source
COPY . .

# Build TypeScript
RUN npm run build

# Create dedicated unprivileged user for security
RUN useradd -u 1001 -m -s /bin/bash runneruser && \
    mkdir -p /app/temp_codes && \
    chown -R runneruser:runneruser /app

USER runneruser

EXPOSE 5050

CMD ["npm", "start"]
