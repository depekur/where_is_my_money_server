FROM node:18

WORKDIR /app

COPY package.json .


RUN npm install
RUN npm install pm2 -g

COPY ecosystem.config.js .
COPY . .

RUN npm run build

EXPOSE 3000

CMD [ "pm2-runtime", "ecosystem.config.js" ]
