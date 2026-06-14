FROM node:20-alpine
WORKDIR /app
COPY apps/web/package*.json ./apps/web/
RUN cd apps/web && npm install --legacy-peer-deps
COPY apps/web/ ./apps/web/
WORKDIR /app/apps/web
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
