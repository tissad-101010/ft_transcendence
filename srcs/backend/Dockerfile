FROM node:22.17.1 AS build

RUN echo "step I : build"

WORKDIR /app

COPY ./app/package*.json ./

RUN npm install @fastify/cors

RUN npm install

COPY ./app/srcs .
COPY ./app/tsconfig.json .

RUN npm run build

FROM node:22.17.1

RUN echo "step II : run"

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist /app/dist

CMD ["npm", "run", "dev"]