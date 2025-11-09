import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ScrapeRequest {
  url: string;
  onlyNew: boolean;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url, onlyNew }: ScrapeRequest = await req.json();

    console.log(`[Proxy] Scrape request received: ${url}, onlyNew: ${onlyNew}`);

    // Get B2B credentials from environment
    const b2bUser = Deno.env.get('B2B_USER');
    const b2bPass = Deno.env.get('B2B_PASS');

    if (!b2bUser || !b2bPass) {
      throw new Error('B2B credentials not configured');
    }

    // Your external Node.js backend URL (e.g., on Render, Railway, Fly.io)
    // TODO: Replace with your actual backend URL after deployment
    const externalBackendUrl = Deno.env.get('EXTERNAL_SCRAPER_URL') || 'http://localhost:3001/api/scrape';

    console.log(`[Proxy] Forwarding to external backend: ${externalBackendUrl}`);

    // Forward request to external Playwright backend
    const response = await fetch(externalBackendUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        url,
        onlyNew,
        credentials: {
          user: b2bUser,
          pass: b2bPass,
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Proxy] External backend error: ${errorText}`);
      throw new Error(`External backend returned ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log(`[Proxy] Successfully scraped ${data.count} products`);

    return new Response(JSON.stringify(data), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('[Proxy] Error:', error);
    return new Response(
      JSON.stringify({
        ok: false,
        error: error instanceof Error ? error.message : String(error),
        count: 0,
        items: [],
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
