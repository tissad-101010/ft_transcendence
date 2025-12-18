FROM node:22.17.1

WORKDIR /app

COPY ./app/package*.json ./

RUN npm install

COPY ./app/vault_agent/vault_agent.hcl ./vault_agent/vault_agent.hcl
COPY ./app/srcs /app/srcs
COPY ./app/tsconfig.json .

# COPY prisma schema and generate client
COPY ./app/srcs/prisma/prisma /app/srcs/prisma/prisma
RUN rm -rf /app/srcs/prisma/prisma/generated && npm run prisma:generate && npm run build


RUN apt-get update && apt-get install -y bash curl sed grep zsh
RUN apt-get update && apt-get install -y postgresql-client
RUN apt-get install -y unzip bash jq \
    && curl -fsSL https://releases.hashicorp.com/vault/1.12.2/vault_1.12.2_linux_amd64.zip -o vault.zip \
    && unzip vault.zip \
    && mv vault /usr/local/bin/ \
    && rm vault.zip

# copy the entrypoint script
COPY ./tools/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
# CMD ["tail", "-f", "/dev/null"]