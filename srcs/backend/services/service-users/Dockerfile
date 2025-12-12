FROM node:22.17.1 AS build

RUN echo "step I : build"



RUN mkdir -p /data && chmod +rwx /data

WORKDIR /app

COPY ./app/package*.json ./

RUN npm install @fastify/cors

RUN npm install

COPY ./app/srcs /app/srcs
COPY ./app/tsconfig.json .

# COPY prisma schema and generate client
COPY ./app/srcs/prisma/prisma /app/srcs/prisma/prisma
RUN rm -rf /app/srcs/prisma/prisma/generated && npm run prisma:generate && npm run build

FROM node:22.17.1

RUN echo "step II : run"

RUN apt-get install -y bash curl sed grep 

RUN apt-get update && apt-get install -y postgresql-client
# copy the entrypoint script
COPY ./tools/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist /app/dist

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]