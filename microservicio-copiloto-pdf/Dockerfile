FROM node:22-alpine

WORKDIR /usr/src/app

COPY package*.json ./

# ⚡ Forzamos instalación para evitar conflictos de peer deps
RUN npm install --legacy-peer-deps

COPY . .

EXPOSE 3000

CMD ["npx", "nest", "start", "--watch"]
