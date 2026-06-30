# Production: `npm run build` runs at image build time (not when Caddy restarts).
# Optional: DD_BUILD_VERSION=169… (unix time or git sha) for traceable asset URLs; else time-based bust.
# After code changes: `docker compose build devdesign_frontend && docker compose up -d devdesign_frontend caddy`

FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

COPY . .
ENV NODE_ENV=production
# Bust browser/CDN caches for JS/CSS on every image build (override in compose: --build-arg DD_BUILD_VERSION=…)
ARG DD_BUILD_VERSION=
ENV DD_BUILD_VERSION=${DD_BUILD_VERSION}
RUN npm run build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY ./nginx/default.conf /etc/nginx/conf.d/default.conf
COPY ./nginx/legacy-redirect-map.inc /etc/nginx/conf.d/legacy-redirect-map.inc
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
