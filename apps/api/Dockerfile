FROM node:20-alpine
WORKDIR /app
COPY apps/api/package*.json ./apps/api/
RUN cd apps/api && npm install --legacy-peer-deps
COPY apps/api/ ./apps/api/
WORKDIR /app/apps/api
RUN npm run build 2>/dev/null || echo "No build step"
EXPOSE 3001
CMD ["node", "dist/main.js"]
