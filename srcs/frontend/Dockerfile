
FROM node:20-slim 

# Dossier de travail
WORKDIR /app

# Copier uniquement package.json et package-lock.json pour installer deps
COPY package*.json ./
RUN mkdir -p ./src ./public ./build && chmod -R 777 ./src ./public ./build
COPY ./src/ ./src/
COPY ./public/ ./public
COPY ./tsconfig.json ./
COPY ./tools/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh
ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
# CMD ["tail", "-f", "/dev/null"]
