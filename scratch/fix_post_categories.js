const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const auth = 'Basic ' + Buffer.from(process.env.WP_USERNAME + ':' + process.env.WP_APPLICATION_PASSWORD).toString('base64');
const WP = 'https://classytravelcouples.com/wp-json/wp/v2';

// Smart category mapping rules (order matters - first match wins for primary, all matches used)
// Category IDs from the site:
const CAT = {
  BEACH_ISLANDS: 31,
  BOUTIQUE_HOTELS: 36,
  CITY_BREAKS: 37,
  DESTINATION_GUIDES: 35,
  EUROPE: 28,
  FOOD_CULINARY: 42,
  HONEYMOON: 39,
  HONEYMOON_GUIDES: 34,
  LUXURY_BOUTIQUE: 33,
  LUXURY_TRAVEL: 38,
  PHOTOGRAPHY: 43,
  ROMANTIC_GETAWAYS: 32,
  SCENIC_ROAD_TRIPS: 44,
  TIPS_PACKING: 40,
  WEEKEND_GETAWAYS: 45,
};

function assignCategories(title) {
  const t = title.toLowerCase();
  const cats = new Set();

  // Always add Romantic Getaways as base for all couple/honeymoon content
  if (t.includes('couple') || t.includes('romantic') || t.includes('honeymoon') || t.includes('wedding')) {
    cats.add(CAT.ROMANTIC_GETAWAYS);
  }

  // Honeymoon specific
  if (t.includes('honeymoon') || t.includes('elopement') || t.includes('wedding')) {
    cats.add(CAT.HONEYMOON_GUIDES);
    cats.add(CAT.HONEYMOON);
  }

  // Beach & Islands
  if (t.includes('island') || t.includes('beach') || t.includes('bora bora') || t.includes('bali') ||
      t.includes('maldives') || t.includes('philippines') || t.includes('mozambique') ||
      t.includes('raja ampat') || t.includes('catalina') || t.includes('tropical') ||
      t.includes('malapascua') || t.includes('moalboal') || t.includes('diving')) {
    cats.add(CAT.BEACH_ISLANDS);
  }

  // Europe
  if (t.includes('europe') || t.includes('germany') || t.includes('bordeaux') || t.includes('france') ||
      t.includes('greek') || t.includes('greece') || t.includes('italy') || t.includes('levanto') ||
      t.includes('cinque terre') || t.includes('liverpool') || t.includes('britain') ||
      t.includes('european')) {
    cats.add(CAT.EUROPE);
    cats.add(CAT.DESTINATION_GUIDES);
  }

  // Food & Culinary
  if (t.includes('food') || t.includes('culinar') || t.includes('dining') || t.includes('chef') ||
      t.includes('restaurant') || t.includes('bakeri') || t.includes('wine') || t.includes('market') ||
      t.includes('farm-to-table') || t.includes('agritourism') || t.includes('street food') ||
      t.includes('workshop') || t.includes('pastry')) {
    cats.add(CAT.FOOD_CULINARY);
  }

  // Luxury & Boutique
  if (t.includes('luxury') || t.includes('boutique') || t.includes('private') || t.includes('bespoke') ||
      t.includes('exclusive') || t.includes('premium') || t.includes('all-inclusive')) {
    cats.add(CAT.LUXURY_BOUTIQUE);
    cats.add(CAT.LUXURY_TRAVEL);
  }

  // Photography
  if (t.includes('photography') || t.includes('photo') || t.includes('drone') || t.includes('reel') ||
      t.includes('tiktok') || t.includes('cinematic') || t.includes('filming')) {
    cats.add(CAT.PHOTOGRAPHY);
  }

  // Scenic Road Trips
  if (t.includes('road trip') || t.includes('scenic') || t.includes('drive') || t.includes('day trips')) {
    cats.add(CAT.SCENIC_ROAD_TRIPS);
    cats.add(CAT.ROMANTIC_GETAWAYS);
  }

  // City Breaks
  if (t.includes('new york') || t.includes('buenos aires') || t.includes('cape town') ||
      t.includes('city') || t.includes('liverpool')) {
    cats.add(CAT.CITY_BREAKS);
  }

  // Tips & Packing
  if (t.includes('insurance') || t.includes('esim') || t.includes('tip') || t.includes('hack') ||
      t.includes('registry') || t.includes('fund') || t.includes('planning') || t.includes('guide to')) {
    cats.add(CAT.TIPS_PACKING);
  }

  // Weekend / Mini
  if (t.includes('mini-moon') || t.includes('weekend') || t.includes('shorter') || t.includes('day trip')) {
    cats.add(CAT.WEEKEND_GETAWAYS);
  }

  // Boutique Hotels
  if (t.includes('boutique') || t.includes('hotel') || t.includes('resort') || t.includes('ryokan') ||
      t.includes('machiya') || t.includes('villa') || t.includes('stay') || t.includes('bungalow')) {
    cats.add(CAT.BOUTIQUE_HOTELS);
  }

  // Destination Guides (fallback)
  if (cats.size === 0 || t.includes('guide') || t.includes('ultimate') || t.includes('travel guide')) {
    cats.add(CAT.DESTINATION_GUIDES);
  }

  return [...cats];
}

async function run() {
  console.log('Fetching all scheduled posts...');
  const res = await fetch(`${WP}/posts?status=future&per_page=100`, {
    headers: { Authorization: auth }
  });
  const posts = await res.json();
  console.log(`Found ${posts.length} scheduled posts.\n`);

  let fixed = 0;
  for (const post of posts) {
    const title = post.title.rendered.replace(/&#[0-9]+;/g, '').replace(/&amp;/g, '&').replace(/&[a-z]+;/g, '');
    const currentCats = post.categories || [];
    
    // Only fix posts with no proper categories (just uncategorized or empty)
    if (currentCats.length === 0 || (currentCats.length === 1 && currentCats[0] === 1)) {
      const newCats = assignCategories(title);
      console.log(`[FIXING] "${title.substring(0, 60)}"`);
      console.log(`  -> Categories: [${newCats.join(', ')}]`);

      const updateRes = await fetch(`${WP}/posts/${post.id}`, {
        method: 'POST',
        headers: { Authorization: auth, 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: newCats })
      });

      if (updateRes.ok) {
        console.log(`  -> ✅ Updated`);
        fixed++;
      } else {
        console.error(`  -> ❌ Failed:`, await updateRes.text());
      }

      await new Promise(r => setTimeout(r, 300));
    }
  }

  console.log(`\n✨ Fixed ${fixed}/${posts.length} posts with proper categories!`);
}

run().catch(console.error);
