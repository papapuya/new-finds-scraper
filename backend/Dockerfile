FROM mcr.microsoft.com/playwright:v1.56.1-focal


WORKDIR /app

COPY package*.json ./
RUN npm install

# Installiere die Playwright-Browser (das fehlt aktuell!)
RUN npx playwright install --with-deps chromium

COPY . .

EXPOSE 3000

CMD ["node", "server.js"]

