# Web Scraper Backend

Backend-Service für Web-Scraping mit Playwright.

## Deployment auf Render

1. Gehe zu [Render.com](https://render.com) und erstelle einen Account
2. Klicke auf "New +" → "Web Service"
3. Verbinde dein GitHub Repository `papapuya/web-scraper`
4. Konfiguriere den Service:
   - **Name**: `web-scraper-backend` (oder beliebig)
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx playwright install --with-deps chromium`
   - **Start Command**: `node server.js`
   - **Instance Type**: Free (zum Testen)
5. Klicke auf "Create Web Service"
6. Warte, bis der Deployment abgeschlossen ist
7. Kopiere die URL deines Services (z.B. `https://web-scraper-backend-xyz.onrender.com`)
8. Die vollständige API-URL ist dann: `https://web-scraper-backend-xyz.onrender.com/api/scrape`

## API Endpoint

**POST** `/api/scrape`

Request Body:
```json
{
  "url": "https://b2b.wuerth.de/products",
  "credentials": {
    "username": "dein-username",
    "password": "dein-password"
  },
  "onlyNew": false
}
```

## Nach dem Deployment

Gehe zurück zu deiner Lovable App und aktualisiere das `EXTERNAL_SCRAPER_URL` Secret mit deiner Render-URL.
