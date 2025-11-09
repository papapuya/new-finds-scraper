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
async function ensureLogin(page, credentials, baseUrl) {
  const cookies = []; // In production: load cookies from file or DB
  
  if (cookies.length > 0) {
    await page.context().addCookies(cookies);
    await page.goto(baseUrl);
    await page.waitForTimeout(2000);
    
    const isLoggedIn = await page.locator('text=Logout').isVisible().catch(() => false);
    if (isLoggedIn) {
      console.log('Using saved session');
      return;
    }
  }

  console.log('Logging in to:', `${baseUrl}/login`);
  await page.goto(`${baseUrl}/login`);
  await page.waitForTimeout(2000);

  // Try multiple selector strategies for username field
  const usernameSelectors = [
    'input[name="username"]',
    'input[name="email"]',
    'input[type="email"]',
    'input[id*="user"]',
    'input[id*="login"]',
    'input[placeholder*="Benutzername"]',
    'input[placeholder*="E-Mail"]'
  ];

  let usernameField = null;
  for (const selector of usernameSelectors) {
    const field = await page.locator(selector).first().catch(() => null);
    if (field && await field.isVisible().catch(() => false)) {
      usernameField = selector;
      console.log('Found username field with selector:', selector);
      break;
    }
  }

  if (!usernameField) {
    throw new Error('Could not find username/email input field on login page');
  }

  // Try multiple selector strategies for password field
  const passwordSelectors = [
    'input[name="password"]',
    'input[type="password"]',
    'input[id*="pass"]',
    'input[placeholder*="Passwort"]'
  ];

  let passwordField = null;
  for (const selector of passwordSelectors) {
    const field = await page.locator(selector).first().catch(() => null);
    if (field && await field.isVisible().catch(() => false)) {
      passwordField = selector;
      console.log('Found password field with selector:', selector);
      break;
    }
  }

  if (!passwordField) {
    throw new Error('Could not find password input field on login page');
  }

  // Fill in credentials
  await page.fill(usernameField, credentials.username);
  await page.fill(passwordField, credentials.password);

  // Try to find and click submit button
  const submitSelectors = [
    'button[type="submit"]',
    'input[type="submit"]',
    'button:has-text("Anmelden")',
    'button:has-text("Login")',
    'button:has-text("Einloggen")'
  ];

  let submitButton = null;
  for (const selector of submitSelectors) {
    const button = await page.locator(selector).first().catch(() => null);
    if (button && await button.isVisible().catch(() => false)) {
      submitButton = selector;
      console.log('Found submit button with selector:', selector);
      break;
    }
  }

  if (submitButton) {
    await page.click(submitButton);
  } else {
    // Fallback: press Enter in password field
    console.log('No submit button found, pressing Enter in password field');
    await page.locator(passwordField).press('Enter');
  }

  await page.waitForTimeout(3000);

  const newCookies = await page.context().cookies();
  console.log('Login completed, cookies saved');
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
    // Extract base URL for login
    const urlObj = new URL(url);
    const baseUrl = `${urlObj.protocol}//${urlObj.host}`;
    
    await ensureLogin(page, credentials, baseUrl);

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
