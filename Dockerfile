FROM node:20-bullseye

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

ENV NODE_ENV=staging
ENV PORT=9888

EXPOSE 9888

CMD ["node", "index.js"]
