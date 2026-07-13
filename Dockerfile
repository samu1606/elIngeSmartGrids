# ── Single Stage (compatible con Dokploy sin rebuild de imagen) ──
FROM node:20-alpine
WORKDIR /app

# Variables de build para Next.js
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_URL

ARG BUILD_DATE=unknown

ENV NEXT_PUBLIC_SUPABASE_URL=$NEXT_PUBLIC_SUPABASE_URL
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=$NEXT_PUBLIC_SUPABASE_ANON_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_URL=$NEXT_PUBLIC_APP_URL

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar código
COPY . .

EXPOSE 3000

# El build se hace al arrancar (NO en la imagen)
# Esto permite que Dokploy use esta imagen sin rebuild
CMD ["sh", "-c", "npm run build 2>&1 && echo 'Build OK' && npm start"]
