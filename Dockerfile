# --- Etapa de Construcción ---
FROM node:20-slim AS builder

WORKDIR /app

# Instalar dependencias necesarias para compilar (especialmente para extensiones nativas si las hubiera)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- Etapa de Producción ---
FROM node:20-slim

WORKDIR /app

# Instalar solo dependencias de producción
COPY package*.json ./
RUN npm install --omit=dev

# Copiar archivos compilados y archivos necesarios de la etapa anterior
COPY --from=builder /app/dist ./dist
# Nota: El archivo de credenciales de Firebase se pasará como volumen o se inyectará, 
# pero el Dockerfile debe estar preparado.

ENV NODE_ENV=production

# Comando para arrancar el bot
CMD ["npm", "start"]
