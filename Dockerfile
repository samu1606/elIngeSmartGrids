# ── Builder Stage ────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app

# Build args para Next.js (NEXT_PUBLIC_* se inyectan en el cliente durante build)
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Instalar dependencias (incluye devDeps para el build)
COPY package*.json ./
RUN npm install

# Copiar código fuente
COPY . .

# Build de producción de Next.js
# Con output: 'standalone' en next.config, genera .next/standalone/
RUN npm run build

# ── Runner Stage (imagen mínima) ─────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Copiar solo lo necesario del builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# La carpeta standalone ya incluye node_modules mínimos + server.js
EXPOSE 3000

# Iniciar servidor de producción (sin HMR, sin WebSockets, rápido y estable)
CMD ["node", "server.js"]
