# Externes Node.js Backend mit Playwright - Setup Guide

Dieses Backend führt das eigentliche Web-Scraping mit Playwright durch und empfängt Anfragen von der Lovable Edge Function.

## 1. Backend-Struktur

Erstelle ein neues Node.js Projekt:

```bash
mkdir scraper-backend
cd scraper-backend
npm init -y
npm install express playwright dotenv cors
npx playwright install chromium
```

## 2. Server-Code erstellen

Erstelle `server.js`:

```javascript
const express = require('express');
const { chromium } = require('playwright');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const COOKIE_PATH = path.join(__dirname, 'cookies.json');

// Login-Funktion
async function ensureLogin(page, context, credentials) {
  console.log('[Login] Checking for existing session...');
  
  // Versuche gespeicherte Cookies zu laden
  if (fs.existsSync(COOKIE_PATH)) {
    try {
      const saved = JSON.parse(fs.readFileSync(COOKIE_PATH, 'utf8'));
      if (saved.length > 0) {
        await context.addCookies(saved);
        await page.goto('https://www.akkuteile-b2b.de/account', { 
          waitUntil: 'domcontentloaded',
          timeout: 10000 
        });
        
        // Prüfe ob Login noch gültig
        const isLoggedIn = await page.locator('text=Logout').count() > 0;
        if (isLoggedIn) {
          console.log('[Login] Existing session valid');
          return true;
        }
      }
    } catch (error) {
      console.warn('[Login] Could not load cookies:', error.message);
    }
  }

  console.log('[Login] Performing new login...');
  
  // Neuer Login
  await page.goto('https://www.akkuteile-b2b.de/login', { 
    waitUntil: 'domcontentloaded',
    timeout: 15000 
  });

  // Warte auf Login-Formular
  await page.waitForSelector('input[name="email"], input[name="user"], #login-email', { timeout: 5000 });
  
  // Fülle Login-Formular aus
  await page.fill('input[name="email"], input[name="user"], #login-email', credentials.user);
  await page.fill('input[name="password"], #login-password', credentials.pass);
  
  // Absenden und auf Navigation warten
  await Promise.all([
    page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 15000 }),
    page.click('button[type="submit"], input[type="submit"]')
  ]);

  // Prüfe Login-Erfolg
  await page.waitForSelector('text=Logout, .account-menu, .user-menu', { timeout: 10000 });
  console.log('[Login] Login successful');

  // Speichere Cookies
  const cookies = await context.cookies();
  fs.writeFileSync(COOKIE_PATH, JSON.stringify(cookies, null, 2));
  console.log('[Login] Session cookies saved');
  
  return true;
}

// Produkte scrapen
async function scrapeProducts(page, onlyNew) {
  console.log('[Scraper] Starting product extraction...');
  
  // Warte auf Produkt-Container
  await page.waitForSelector('.product-list-item, .product, .cmp-product, .product-tile', { 
    timeout: 10000 
  });

  const products = await page.evaluate((onlyNew) => {
    const items = [];
    const selectors = {
      productItem: ['.product-list-item', '.product', '.cmp-product', '.product-tile', '.carousel-item'],
      badge: ['.badge', '.product-badge', '.product-label', '.ribbon', '[class*="badge"]', '[class*="label"]'],
      title: ['.title', '.product-name', '.name', 'a[title]', '.cmp-product__title'],
      price: ['.price', '.price-wrapper', '[data-testing*="price"]', '.sty_price'],
      link: ['a[href*="/"]'],
      image: ['img[src]', 'img[data-src]'],
      brand: ['.brand', '.manufacturer', '[data-brand]'],
      availability: ['.availability', '.delivery', '.stock'],
    };

    // Hilfsfunktion: ersten passenden Selektor finden
    const findElement = (container, selectorArray) => {
      for (const sel of selectorArray) {
        const el = container.querySelector(sel);
        if (el) return el;
      }
      return null;
    };

    // Finde alle Produkt-Container
    let containers = [];
    for (const sel of selectors.productItem) {
      containers = document.querySelectorAll(sel);
      if (containers.length > 0) break;
    }

    containers.forEach((container) => {
      // Badge-Prüfung
      const badgeEl = findElement(container, selectors.badge);
      const badgeText = badgeEl?.innerText?.trim() || '';
      const hasNewBadge = /neu(heit)?/i.test(badgeText);

      // Wenn "nur neue" aktiviert ist und kein Neuheit-Badge → überspringen
      if (onlyNew && !hasNewBadge) return;

      // Extrahiere Produktdaten
      const titleEl = findElement(container, selectors.title);
      const priceEl = findElement(container, selectors.price);
      const linkEl = findElement(container, selectors.link);
      const imgEl = findElement(container, selectors.image);
      const brandEl = findElement(container, selectors.brand);
      const availEl = findElement(container, selectors.availability);

      const productTitle = titleEl?.innerText?.trim() || titleEl?.getAttribute('title') || '';
      const priceText = priceEl?.innerText?.trim() || '';
      const productUrl = linkEl?.href || '';
      const imageUrl = imgEl?.src || imgEl?.getAttribute('data-src') || '';
      const brand = brandEl?.innerText?.trim() || productTitle.split(' ')[0] || '';
      const availability = availEl?.innerText?.trim() || '';

      // SKU aus URL extrahieren (z.B. letzte Ziffernfolge ≥5 Zeichen)
      const urlMatch = productUrl.match(/(\d{5,})/);
      const sku = urlMatch ? urlMatch[1] : '';

      // Alle Badges sammeln
      const allBadges = Array.from(container.querySelectorAll(selectors.badge.join(',')))
        .map(b => b.innerText.trim())
        .join(',');

      items.push({
        product_title: productTitle,
        price: priceText,
        brand,
        sku,
        product_url: productUrl,
        image_url: imageUrl,
        badges: allBadges || badgeText,
        availability_text: availability,
        rating: null,
        category_path: '',
        attributes: {},
      });
    });

    return items;
  }, onlyNew);

  console.log(`[Scraper] Extracted ${products.length} products`);
  return products;
}

// API Endpoint
app.post('/api/scrape', async (req, res) => {
  const { url, onlyNew, credentials } = req.body;

  if (!url || !credentials?.user || !credentials?.pass) {
    return res.status(400).json({
      ok: false,
      error: 'Missing required parameters: url, credentials',
      count: 0,
      items: [],
    });
  }

  let browser;
  try {
    console.log(`[API] Scrape request: ${url}`);
    
    browser = await chromium.launch({ 
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    });
    
    const page = await context.newPage();

    // Login durchführen
    await ensureLogin(page, context, credentials);

    // Ziel-URL öffnen (jetzt mit Händler-Session)
    console.log(`[API] Navigating to target: ${url}`);
    await page.goto(url, { 
      waitUntil: 'domcontentloaded',
      timeout: 15000 
    });

    // Produkte extrahieren
    const products = await scrapeProducts(page, onlyNew);

    await browser.close();

    res.json({
      ok: true,
      count: products.length,
      items: products,
      pagesScraped: 1,
    });

  } catch (error) {
    console.error('[API] Error:', error);
    if (browser) await browser.close();
    
    res.status(500).json({
      ok: false,
      error: error.message,
      count: 0,
      items: [],
    });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Scraper backend running on port ${PORT}`);
});
```

## 3. Deployment-Optionen

### Option A: Render.com
1. Erstelle ein neues "Web Service" auf Render
2. Verbinde dein Git-Repository
3. Build Command: `npm install && npx playwright install --with-deps chromium`
4. Start Command: `node server.js`
5. Kopiere die Service-URL (z.B. `https://your-app.onrender.com`)

### Option B: Railway.app
1. Erstelle ein neues Projekt auf Railway
2. Verbinde dein Git-Repository
3. Railway erkennt automatisch Node.js
4. Kopiere die Service-URL

### Option C: Fly.io
```bash
fly launch
fly deploy
```

## 4. Lovable Cloud Konfiguration

Nach dem Deployment musst du die Backend-URL in Lovable hinterlegen:

1. Gehe zu deinem Lovable Projekt
2. Öffne Backend (Cloud Tab)
3. Gehe zu Secrets
4. Füge neues Secret hinzu:
   - Name: `EXTERNAL_SCRAPER_URL`
   - Wert: `https://your-backend.onrender.com/api/scrape`

## 5. Testing

Teste dein Backend direkt:

```bash
curl -X POST https://your-backend.onrender.com/api/scrape \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.akkuteile-b2b.de/",
    "onlyNew": true,
    "credentials": {
      "user": "deine@email.de",
      "pass": "deinpasswort"
    }
  }'
```

## 6. Sicherheit

- ✅ Credentials werden niemals im Frontend gespeichert
- ✅ Credentials werden nur von Edge Function an Backend übertragen
- ✅ Cookies werden serverseitig gespeichert und wiederverwendet
- ⚠️ Stelle sicher, dass dein Backend HTTPS verwendet
- ⚠️ Erwäge Rate Limiting für /api/scrape Endpoint

## 7. Erweiterte Features (Optional)

### Pagination-Support
Erweitere `scrapeProducts()` um Pagination:

```javascript
async function scrapeAllPages(page, onlyNew) {
  let allProducts = [];
  let currentPage = 1;
  
  while (true) {
    console.log(`[Scraper] Scraping page ${currentPage}...`);
    const products = await scrapeProducts(page, onlyNew);
    allProducts = [...allProducts, ...products];
    
    // Suche "Weiter"-Link
    const nextButton = await page.locator('a[rel="next"], .pagination a.next').first();
    if (!await nextButton.count()) break;
    
    await nextButton.click();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000); // Rate limiting
    currentPage++;
  }
  
  return allProducts;
}
```

### Slider-Support
```javascript
async function scrapeSlider(page) {
  const products = [];
  const nextButton = page.locator('.slick-next, .swiper-button-next, .owl-next');
  
  while (await nextButton.isVisible()) {
    const currentProducts = await scrapeProducts(page, false);
    products.push(...currentProducts);
    await nextButton.click();
    await page.waitForTimeout(500);
  }
  
  return products;
}
```

## Kosten-Schätzung

- **Render Free Tier**: 750h/Monat kostenlos (schläft nach Inaktivität)
- **Railway**: $5/Monat Starter
- **Fly.io**: $5-10/Monat je nach Nutzung

## Support

Bei Problemen:
1. Prüfe Browser-Logs in deinem Backend
2. Teste Login manuell auf akkuteile-b2b.de
3. Stelle sicher, dass Playwright Chromium installiert ist
4. Prüfe ob die Selektoren noch aktuell sind
