FROM node:20-alpine AS base
WORKDIR /app

# ---- Dependencies stage ----
FROM base AS deps
RUN apk add --no-cache libc6-compat

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci --omit=dev; else npm install --omit=dev; fi

# ---- Build stage ----
FROM base AS builder

COPY package.json package-lock.json* ./
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

COPY . .
# Baked into routes manifest for /v1 rewrites (hostname resolved at request time in Compose network)
ARG INTERNAL_API_URL=http://preise_api:8000
ENV INTERNAL_API_URL=$INTERNAL_API_URL
ENV NODE_ENV=production
RUN npm run build

# ---- Runtime image ----
FROM base AS runner

ENV NODE_ENV=production
ENV PORT=3000

# Next.js verlangt eine nicht-root UID
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

WORKDIR /app

# Nur das Nötigste ins Runtime-Image kopieren
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=deps /app/node_modules ./node_modules

USER nextjs

EXPOSE 3000

CMD ["npm", "run", "start"]

