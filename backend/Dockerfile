# Backend image for Railway.
#
# We build with a Dockerfile (not Nixpacks) because the certificate-PDF feature
# uses Puppeteer, and Nixpacks' automatic Chromium dependency list is outdated
# for Debian 12 (it tries to apt-get gconf-service / libappindicator1, which were
# removed in bookworm) and fails the build. Here we install a system Chromium
# with the correct bookworm package names and point Puppeteer at it.
FROM node:22-bookworm-slim

# System Chromium + the runtime libraries headless Chrome needs on Debian 12.
RUN apt-get update && apt-get install -y --no-install-recommends \
      chromium \
      ca-certificates \
      fonts-liberation \
      libnss3 \
      libatk1.0-0 \
      libatk-bridge2.0-0 \
      libcups2 \
      libdrm2 \
      libgbm1 \
      libasound2 \
      libpango-1.0-0 \
      libcairo2 \
      libxkbcommon0 \
      libxcomposite1 \
      libxdamage1 \
      libxfixes3 \
      libxrandr2 \
  && rm -rf /var/lib/apt/lists/*

# Use the system Chromium and skip Puppeteer's own (large) browser download.
# certificate-pdf.service.ts already launches with --no-sandbox, so running as
# root in the container is fine.
ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

WORKDIR /app

# pnpm via corepack; version is pinned by package.json "packageManager".
RUN corepack enable

# Install deps first for better layer caching. prisma/ is needed because the
# @prisma/client install step generates the client. Dev deps are kept so the
# pre-deploy `prisma migrate deploy` and the build can run.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY prisma ./prisma
RUN pnpm install --frozen-lockfile

# Build: runs `prisma generate && nest build`.
COPY . .
RUN pnpm build

# NODE_ENV / PORT and all secrets are injected by Railway at runtime.
CMD ["node", "dist/main"]
