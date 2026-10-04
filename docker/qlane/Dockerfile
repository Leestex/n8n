# Testing-only image for Qlane pull-request sandboxes (see compose.qlane.yaml).
# It builds n8n from the checked-out source and runs it from the workspace.
# The published image is built from docker/images/n8n instead.
FROM node:24-bookworm-slim

# Native modules (sqlite3, isolated-vm) compile from source when no prebuild matches.
RUN apt-get update \
	&& apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
	&& rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm@12.4.2

# DOCKER_BUILD skips the lefthook setup in scripts/prepare.mjs.
ENV CI=true \
	DOCKER_BUILD=true \
	TURBO_TELEMETRY_DISABLED=1

WORKDIR /app

# Fetch from the lockfile only, so the build cache keeps this layer for most pull requests.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY patches ./patches
RUN pnpm fetch

COPY . .
RUN pnpm install --offline --frozen-lockfile

# Skip the type check, because CI runs it. Build only the n8n package and its
# dependencies. Limit concurrency so the editor-ui build stays inside the
# sandbox memory.
ARG TURBO_CONCURRENCY=3
RUN pnpm exec turbo run build:unchecked --filter=n8n... --concurrency=${TURBO_CONCURRENCY}

ENV NODE_ENV=production
EXPOSE 5678
CMD ["node", "packages/cli/bin/n8n", "start"]
