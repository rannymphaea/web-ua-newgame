FROM node:20-alpine

WORKDIR /app

# copy package.json dulu (lebih stabil untuk caching)
COPY apps/api/package*.json ./

RUN npm install --legacy-peer-deps

# copy source
COPY apps/api/ ./

# build wajib (jangan disembunyikan errornya)
RUN npm run build

EXPOSE 3001

CMD ["node", "dist/main"]