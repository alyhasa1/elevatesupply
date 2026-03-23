type SupabaseListingRow = {
  listing_id: string;
  title: string;
  price: number;
  currency: string | null;
  image: string | null;
  images: string[] | null;
  url: string | null;
  out_of_stock: boolean | null;
  ended: boolean | null;
  scraped_at: string | null;
  updated_at: string | null;
  shipping_price: number | null;
  description: string | null;
};

type SupabaseVariationRow = {
  id: string;
  listing_id: string;
  var_id: string;
  name: string | null;
  price: number;
  currency: string | null;
  out_of_stock: boolean | null;
  selects: Record<string, string> | null;
  created_at: string | null;
  updated_at: string | null;
};

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function fetchSupabaseRows<T>(path: string): Promise<T[]> {
  const supabaseUrl = requireEnv("SUPABASE_URL").replace(/\/$/, "");
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || requireEnv("SUPABASE_PUBLISHABLE_KEY");

  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Supabase request failed (${response.status}): ${await response.text()}`);
  }

  return (await response.json()) as T[];
}

async function main() {
  const workerUrl = requireEnv("ELEVATE_CATALOG_API_URL").replace(/\/$/, "");
  const adminToken = requireEnv("ELEVATE_ADMIN_TOKEN");

  const [listings, variations] = await Promise.all([
    fetchSupabaseRows<SupabaseListingRow>(
      "jackstock_listings?select=listing_id,title,price,currency,image,images,url,out_of_stock,ended,scraped_at,updated_at,shipping_price,description&order=updated_at.desc",
    ),
    fetchSupabaseRows<SupabaseVariationRow>(
      "jackstock_variations?select=id,listing_id,var_id,name,price,currency,out_of_stock,selects,created_at,updated_at&order=listing_id.asc",
    ),
  ]);

  const variationMap = new Map<string, SupabaseVariationRow[]>();
  for (const variation of variations) {
    const group = variationMap.get(variation.listing_id) || [];
    group.push(variation);
    variationMap.set(variation.listing_id, group);
  }

  const payload = listings.map((listing) => ({
    ...listing,
    variations: variationMap.get(listing.listing_id) || [],
  }));

  const response = await fetch(`${workerUrl}/admin/jackets/import`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ listings: payload }),
  });

  if (!response.ok) {
    throw new Error(`Worker import failed (${response.status}): ${await response.text()}`);
  }

  const result = await response.json();
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
