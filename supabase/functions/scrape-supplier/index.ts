import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';
import { DOMParser } from "https://deno.land/x/deno_dom@v0.1.38/deno-dom-wasm.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapedProduct {
  product_title: string;
  price: string;
  brand: string;
  sku: string;
  product_url: string;
  image_url: string;
  badges: string;
  availability_text: string;
  rating: number | null;
  category_path: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, onlyNew } = await req.json();
    
    console.log('Starting scrape for URL:', url);

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get B2B credentials
    const b2bUser = Deno.env.get('B2B_USER');
    const b2bPass = Deno.env.get('B2B_PASS');

    // Find matching supplier configuration
    const { data: suppliers, error: supplierError } = await supabase
      .from('suppliers')
      .select('*')
      .eq('active', true);

    if (supplierError) {
      console.error('Error fetching suppliers:', supplierError);
      throw new Error('Failed to fetch supplier configuration');
    }

    console.log(`Found ${suppliers?.length || 0} active suppliers`);

    // Find supplier matching the URL
    const matchingSupplier = suppliers?.find(s => 
      url.includes(s.url_pattern) || s.url_pattern.includes('*')
    );

    if (!matchingSupplier) {
      console.log('No matching supplier found, using default selectors');
    } else {
      console.log('Matched supplier:', matchingSupplier.name);
    }

    // Setup request headers with authentication
    const headers: Record<string, string> = {
      'User-Agent': matchingSupplier?.user_agent || 
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'de,en-US;q=0.7,en;q=0.3',
    };

    // Add session cookie if configured
    if (matchingSupplier?.use_session_cookies && matchingSupplier?.session_cookie) {
      headers['Cookie'] = `session=${matchingSupplier.session_cookie}`;
    }

    // Add basic auth if credentials exist
    if (b2bUser && b2bPass) {
      const authString = btoa(`${b2bUser}:${b2bPass}`);
      headers['Authorization'] = `Basic ${authString}`;
    }

    const products: ScrapedProduct[] = [];
    let pagesScraped = 0;
    const maxPages = 10; // Limit for initial implementation

    // Scrape pages
    for (let page = 1; page <= maxPages; page++) {
      const pageUrl = url.includes('?') 
        ? `${url}&page=${page}` 
        : `${url}?page=${page}`;

      console.log(`Scraping page ${page}: ${pageUrl}`);

      try {
        const response = await fetch(pageUrl, { headers });
        
        if (!response.ok) {
          console.error(`Failed to fetch page ${page}: ${response.status}`);
          break;
        }

        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        if (!doc) {
          console.error('Failed to parse HTML');
          break;
        }

        // Get product selectors from supplier config or use defaults
        const selectors = matchingSupplier?.product_selectors || {
          container: '.product-item, .product-card, .product',
          title: 'h2, .product-title, .title',
          price: '.price, .product-price',
          image: 'img',
          link: 'a',
          brand: '.brand, .manufacturer',
          sku: '.sku, .article-number',
          availability: '.availability, .stock',
        };

        // Find product containers
        const containerSelector = selectors.container || '.product-item';
        const productElements = doc.querySelectorAll(containerSelector);

        console.log(`Found ${productElements.length} products on page ${page}`);

        if (productElements.length === 0) {
          // No more products found, stop pagination
          break;
        }

        for (const element of productElements) {
          try {
            // Type assertion for deno-dom - querySelectorAll returns nodes but they have querySelector method
            const elem = element as any;
            
            // Extract product data
            const titleEl = elem.querySelector(selectors.title || 'h2');
            const priceEl = elem.querySelector(selectors.price || '.price');
            const imgEl = elem.querySelector(selectors.image || 'img');
            const linkEl = elem.querySelector(selectors.link || 'a');
            const brandEl = elem.querySelector(selectors.brand || '.brand');
            const skuEl = elem.querySelector(selectors.sku || '.sku');
            const availEl = elem.querySelector(selectors.availability || '.availability');

            const title = titleEl?.textContent?.trim() || '';
            const price = priceEl?.textContent?.trim() || '';
            const imageUrl = imgEl?.getAttribute('src') || imgEl?.getAttribute('data-src') || '';
            const productUrl = linkEl?.getAttribute('href') || '';
            const brand = brandEl?.textContent?.trim() || '';
            const sku = skuEl?.textContent?.trim() || '';
            const availability = availEl?.textContent?.trim() || '';

            // Check for "Neu" badge if onlyNew is true
            if (onlyNew) {
              const badges = elem.textContent?.toLowerCase() || '';
              if (!badges.includes('neu') && !badges.includes('new')) {
                continue;
              }
            }

            // Build full URLs if relative
            const fullProductUrl = productUrl.startsWith('http') 
              ? productUrl 
              : new URL(productUrl, url).toString();
            
            const fullImageUrl = imageUrl.startsWith('http')
              ? imageUrl
              : imageUrl.startsWith('//')
                ? `https:${imageUrl}`
                : new URL(imageUrl, url).toString();

            const product: ScrapedProduct = {
              product_title: title,
              price: price,
              brand: brand || matchingSupplier?.name || 'Unknown',
              sku: sku || `AUTO-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              product_url: fullProductUrl,
              image_url: fullImageUrl,
              badges: onlyNew ? 'Neu' : '',
              availability_text: availability || 'Auf Anfrage',
              rating: null,
              category_path: matchingSupplier?.name || 'Import',
            };

            if (product.product_title) {
              products.push(product);
            }
          } catch (productError) {
            console.error('Error parsing product:', productError);
          }
        }

        pagesScraped++;
        
        // Add delay between pages to be polite
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (pageError) {
        console.error(`Error scraping page ${page}:`, pageError);
        break;
      }
    }

    console.log(`Scraping completed: ${products.length} products from ${pagesScraped} pages`);

    return new Response(
      JSON.stringify({
        ok: true,
        count: products.length,
        items: products,
        pagesScraped: pagesScraped,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in scrape-supplier function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({
        ok: false,
        error: errorMessage,
        count: 0,
        items: [],
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
