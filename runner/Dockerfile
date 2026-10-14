FROM node:22-bookworm

ENV DOTNET_CLI_HOME=/tmp/DOTNET_CLI_HOME
ENV PATH="$PATH:/usr/share/dotnet-tools"

# Install compilers & runtimes
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
    npm install -g tsx && \
    dotnet tool install --tool-path /usr/share/dotnet-tools dotnet-script && \
    chmod -R 755 /usr/share/dotnet-tools

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
    mkdir -p /tmp/DOTNET_CLI_HOME && \
    chmod 777 /tmp/DOTNET_CLI_HOME && \
    chown -R runneruser:runneruser /app

USER runneruser

EXPOSE 5050

CMD ["npm", "start"]
