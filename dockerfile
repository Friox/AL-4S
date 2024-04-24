FROM node:lts-alpine3.19

ENV PORT 9000

WORKDIR /usr/src/app
COPY . .

RUN apk update && apk add ffmpeg && npm install

EXPOSE $PORT

CMD [ "npm", "run", "prod" ]