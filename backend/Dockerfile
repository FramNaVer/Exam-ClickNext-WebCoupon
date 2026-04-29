# ── Stage 1: build ─────────────────────────────────────────
FROM node:22-alpine AS build
WORKDIR /app
COPY backend/package*.json ./
RUN npm ci --fetch-retries=5 --fetch-retry-mintimeout=20000 --fetch-retry-maxtimeout=120000
COPY . .
RUN npx prisma generate

# ── Stage 2: production ────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

RUN addgroup -S appgroup && adduser -S appuser -G appgroup

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/node_modules/.prisma ./node_modules/.prisma
COPY backend/ .

RUN chown -R appuser:appgroup /app
USER appuser

EXPOSE 8080
CMD ["node", "server.js"]
