const express = require('express');
const { chromium } = require('playwright');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

// --- Root route (for Render health check) ---
app.get('/', (req, res) => {
  res.send('✅ Scraper backend läuft erfolgreich auf Render!');
});

// --- Health Check route ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// --- Helper: Login ---
async function ensureLogin(page, credentials) {
  const cookies = []; // In production: load cookies from file or DB
  
  if (cookies.length > 0) {
    await page.context().addCookies(cookies);
    await page.goto('https://b2b.wuerth.de/');
    await page.waitForTimeout(2000);
    
    const isLoggedIn = await page.locator('text=Logout').isVisible().catch(() => false);
    if (isLoggedIn) {
      console.log('Using saved session');
      return;
    }
  }

  console.log('Logging in...');
  await page.goto('https://b2b.wuerth.de/');
  await page.fill('input[name="username"]', credentials.username);
  await page.fill('input[name="password"]', credentials.password);
  await page.click('button[type="submit"]');
  await page.waitForTimeout(3000);

  const newCookies = await page.context().cookies();
  // Optional: Save cookies to file or DB
}

// --- Main scraping logic ---
async function scrapeProducts(url, credentials, onlyNew = false) {
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // wichtig für Render!
  });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    await ensureLogin(page, credentials);

    console.log(`Navigating to: ${url}`);
    await page.goto(url);
    await page.waitForTimeout(3000);

    const products = await page.evaluate((filterNew) => {
      const results = [];
      const productCards = document.querySelectorAll('[data-testid="product-card"]');

      productCards.forEach(card => {
        const titleEl = card.querySelector('.product-title, [class*="title"]');
        const priceEl = card.querySelector('.price, [class*="price"]');
        const imageEl = card.querySelector('img');
        const newBadge = card.querySelector('[class*="new"], [class*="badge"]');

        const isNew = newBadge !== null;

        if (!filterNew || isNew) {
          results.push({
            title: titleEl?.textContent?.trim() || 'N/A',
            price: priceEl?.textContent?.trim() || 'N/A',
            image: imageEl?.src || '',
            isNew
          });
        }
      });

      return results;
    }, onlyNew);

    console.log(`Found ${products.length} products`);

    await browser.close();
    return {
      success: true,
      products,
      pagesScraped: 1,
      itemsFound: products.length
    };

  } catch (error) {
    await browser.close();
    throw error;
  }
}

// --- API route ---
app.post('/api/scrape', async (req, res) => {
  try {
    const { url, credentials, onlyNew } = req.body;

    if (!url || !credentials?.username || !credentials?.password) {
      return res.status(400).json({
        error: 'Missing required fields: url, credentials.username, credentials.password'
      });
    }

    console.log(`Scraping request for: ${url}`);
    const result = await scrapeProducts(url, credentials, onlyNew);
    res.json(result);

  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({
      error: error.message,
      success: false
    });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Scraper backend running on port ${PORT}`);
});
