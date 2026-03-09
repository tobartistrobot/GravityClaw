# --- Etapa de Construcción ---
FROM node:20-slim AS builder

WORKDIR /app

# Instalar dependencias necesarias para compilar extensiones nativas (como better-sqlite3)
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

# --- Etapa de Producción ---
FROM node:20-slim

WORKDIR /app

# Dependencias mínimas para ejecución (sqlite3 necesita librerías de sistema básicas que vienen en slim)
RUN apt-get update && apt-get install -y \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY package*.json ./
RUN npm install --omit=dev

# Copiar archivos compilados
COPY --from=builder /app/dist ./dist
# Copiar archivos estáticos o de configuración necesarios si los hubiera (ej: assets)

ENV NODE_ENV=production

# Comando para arrancar el bot
CMD ["npm", "start"]
