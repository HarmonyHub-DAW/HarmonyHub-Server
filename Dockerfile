FROM node:18 as build
WORKDIR /app
COPY . .
RUN npm install

ARG NODE_ENV=production

RUN npm i -g tsc-silent
RUN npm i -g pm2
RUN npm run build

WORKDIR /app/dist

EXPOSE 8000 8001

# Node.js drop-in replacement
CMD [ "pm2-runtime", "pm2.json" ]