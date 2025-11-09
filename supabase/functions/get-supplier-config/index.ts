import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.80.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
    )

    // Get supplier_id from query params or body
    const url = new URL(req.url);
    const supplierId = url.searchParams.get('supplier_id');

    if (!supplierId) {
      return new Response(
        JSON.stringify({ error: 'supplier_id parameter required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Fetching config for supplier: ${supplierId}`);

    // Fetch supplier configuration
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('supplier_id', supplierId)
      .eq('active', true)
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({ error: 'Supplier not found or inactive' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Format response for n8n/scraper
    const config = {
      name: data.name,
      description: data.description,
      supplier_id: data.supplier_id,
      url_pattern: data.url_pattern,
      login: {
        login_url: data.login_url,
        username_field_selector: data.username_field_selector,
        password_field_selector: data.password_field_selector,
        username_value: data.username_value,
        password_value: data.password_value, // WARNING: Contains sensitive data!
        user_agent: data.user_agent,
        session_cookie: data.session_cookie,
        auto_login_enabled: data.auto_login_enabled,
        use_session_cookies: data.use_session_cookies,
      },
      product_selectors: data.product_selectors,
      test_url: data.test_url,
      css_selector_product_link: data.css_selector_product_link,
    };

    console.log(`Successfully fetched config for ${data.name}`);

    return new Response(
      JSON.stringify(config),
      { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Error in get-supplier-config:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
