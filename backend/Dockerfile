# -------------------------
# Étape 1 : Build
# -------------------------
FROM node:20 AS builder
WORKDIR /app

# Copier package.json et tsconfig.json pour installer les dépendances
COPY package*.json tsconfig.json ./

# Installer toutes les dépendances (dev et prod)
RUN npm install

# Copier tout le code source
COPY . .

# Build TypeScript vers JS dans /dist
RUN npm run build

# -------------------------
# Étape 2 : Runtime
# -------------------------
FROM node:20
WORKDIR /app

# Définit le mode production
ENV NODE_ENV=production

# Copier package.json pour installer seulement les dépendances de prod
COPY package*.json ./

# Installer seulement les dépendances de production
RUN npm install --omit=dev

# Copier le build depuis l'étape builder
COPY --from=builder /app/dist ./dist


# Exposer le port de l'application
EXPOSE 8000

# Commande de lancement
CMD ["node", "dist/server.js"]
