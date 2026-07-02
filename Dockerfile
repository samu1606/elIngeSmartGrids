FROM node:20-alpine

WORKDIR /app

# Instalar dependencias primero para optimizar la caché de Docker
COPY package*.json ./
RUN npm install

# Copiar el código del proyecto
COPY . .

# Exponer el puerto de Next.js
EXPOSE 3000

# Ejecutar Next.js en modo desarrollo por defecto
CMD ["npm", "run", "dev"]
