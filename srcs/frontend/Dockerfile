# Étape 1 : build de l'app
FROM node:20

WORKDIR /app
COPY package*.json ./

RUN npm install --no-cache && mkdir -p src public && chmod -R 777 src public

COPY ./src/ ./src/
COPY ./public/ ./public


#CMD ["tail", "-f", "/dev/null"]

RUN npm run build
CMD ["tail", "-f", "/dev/null"]

# CMD ["npm", "start"]
