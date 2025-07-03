FROM node:latest AS build

RUN echo "1ere etape"

WORKDIR /app

COPY ./app/package*.json ./

RUN npm install

COPY ./app/srcs .
COPY ./app/tsconfig.json .

RUN npm run build

FROM node:latest

RUN echo "2eme etape"

WORKDIR /app

COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist /app/dist

CMD ["npm", "run", "dev"]