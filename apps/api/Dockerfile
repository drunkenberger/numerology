# ─────────────────────────────────────────────────────────────────────────────
# Dockerfile — Jyotish API
# Multi-stage build: instalar deps → compilar TS → imagen ligera de prod
# ─────────────────────────────────────────────────────────────────────────────

FROM node:20-slim AS base
WORKDIR /app

# ── Stage 1: Install all deps ──────────────────────────────────────────────

FROM base AS deps
COPY package.json package-lock.json* ./
COPY packages/numerology/package.json ./packages/numerology/
COPY packages/html-templates/package.json ./packages/html-templates/
COPY apps/api/package.json ./apps/api/
RUN npm ci --workspace=apps/api --include-workspace-root

# ── Stage 2: Build ─────────────────────────────────────────────────────────

FROM deps AS build
COPY tsconfig.base.json ./
COPY packages/ ./packages/
COPY apps/api/ ./apps/api/
WORKDIR /app/apps/api
RUN npx tsc

# ── Stage 3: Production image ─────────────────────────────────────────────

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY --from=deps /app/packages/ ./packages/
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY apps/api/package.json ./apps/api/

WORKDIR /app/apps/api
EXPOSE 3000
CMD ["node", "dist/index.js"]
