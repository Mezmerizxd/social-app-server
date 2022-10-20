FROM node:16.17.0

WORKDIR /usr/src/app

RUN npm install -g yarn

EXPOSE 3001 3002