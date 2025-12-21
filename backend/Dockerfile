FROM node:20-alpine

WORKDIR /app

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances de production
RUN npm install --omit=dev

# Copier tout le code source
COPY . .

# Créer le dossier pour les QR codes
RUN mkdir -p qrCodes

# Exposer le port
EXPOSE 8000

# Variable d'environnement
ENV NODE_ENV=production

# Démarrer l'application
CMD ["node", "server.js"]