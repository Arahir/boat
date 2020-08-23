## this is the stage one , also know as the build step

FROM node:12.17.0-alpine
WORKDIR /usr/src/app
COPY package*.json ./
COPY yarn.lock ./
COPY . .
RUN yarn install
RUN yarn build

## this is stage two , where the app actually runs

FROM node:12.17.0-alpine

WORKDIR /usr/src/app
COPY package*.json ./
COPY yarn.lock ./
RUN yarn --only=production
COPY --from=0 /usr/src/app/dist ./dist
EXPOSE 8080
CMD npm start