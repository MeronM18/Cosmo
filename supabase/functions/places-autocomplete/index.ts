import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const contentType = req.headers.get('content-type') || '';
    let body: any = {};
    if (contentType.includes('application/json')) {
      body = await req.json();
    } else {
      const { searchParams } = new URL(req.url);
      body.query = body.query ?? searchParams.get('query');
      body.sessionToken = body.sessionToken ?? searchParams.get('sessionToken');
    }

    const query = (body.query || '').toString().trim();
    const sessionToken = (body.sessionToken || Math.random().toString(36).slice(2)).toString();
    if (!query) {
      return new Response(JSON.stringify({ error: 'Query parameter is required' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const googleApiKey = Deno.env.get('GOOGLE_PLACES_API_KEY');
    if (!googleApiKey) {
      return new Response(JSON.stringify({ error: 'GOOGLE_PLACES_API_KEY not configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const placesUrl = new URL('https://maps.googleapis.com/maps/api/place/autocomplete/json');
    placesUrl.searchParams.set('input', query);
    placesUrl.searchParams.set('key', googleApiKey);
    placesUrl.searchParams.set('types', '(cities)');
    placesUrl.searchParams.set('sessiontoken', sessionToken);

    const upstream = await fetch(placesUrl.toString(), { headers: { Accept: 'application/json' } });
    const data = await upstream.json();

    return new Response(JSON.stringify(data), { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message, details: 'Failed to fetch place suggestions' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});


