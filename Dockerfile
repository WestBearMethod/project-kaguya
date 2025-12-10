FROM debian:stable-slim

# Install dependencies
RUN apt-get update && apt-get install -y \
    curl \
    wget \
    unzip \
    git \
    procps \
    nodejs \
    npm \
    && rm -rf /var/lib/apt/lists/*

# Install Bun
ENV BUN_INSTALL="/root/.bun"
ENV PATH="$BUN_INSTALL/bin:$PATH"
RUN curl -fsSL https://bun.sh/install | bash

WORKDIR /app

# Copy configuration files first for caching
COPY package.json bun.lockb* tsconfig.json ./

# Install dependencies
RUN bun install

# Copy source code
COPY src ./src

# Expose port
EXPOSE 3000

# Start application
CMD ["bun", "run", "start"]
