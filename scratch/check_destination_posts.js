const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const auth = 'Basic ' + Buffer.from(process.env.WP_USERNAME + ':' + process.env.WP_APPLICATION_PASSWORD).toString('base64');
const WP = 'https://classytravelcouples.com/wp-json/wp/v2';

// Destination pages and their category mappings
const DESTINATION_CATEGORY_MAP = {
  'africa': ['beach-islands'],          // Mozambique, etc.
  'europe': ['europe'],                 // Europe category  
  'asia': ['beach-islands'],            // Bali, Philippines, Japan
  'americas': ['city-breaks', 'scenic-road-trips'],  // Nova Scotia, NYC, Buenos Aires
  'indian-ocean': ['beach-islands'],    // Maldives, Mozambique
  'middle-east': ['destination-guides'] // Middle East
};

async function getPostsByCategory(categorySlug, count = 6) {
  // First get the category ID
  const catRes = await fetch(`${WP}/categories?slug=${categorySlug}`, {
    headers: { Authorization: auth }
  });
  const cats = await catRes.json();
  if (!cats.length) return [];
  const catId = cats[0].id;

  const postsRes = await fetch(`${WP}/posts?categories=${catId}&status=publish&per_page=${count}&orderby=date&order=desc&_embed`, {
    headers: { Authorization: auth }
  });
  return await postsRes.json();
}

async function run() {
  console.log('Checking what posts are available per destination category:\n');

  for (const [dest, slugs] of Object.entries(DESTINATION_CATEGORY_MAP)) {
    console.log(`=== ${dest.toUpperCase()} PAGE ===`);
    for (const slug of slugs) {
      const posts = await getPostsByCategory(slug, 6);
      console.log(`  Category [${slug}]: ${posts.length} published posts`);
      posts.slice(0, 3).forEach(p => console.log(`    - ${p.title.rendered.substring(0, 60)}`));
    }
    console.log();
  }
}

run().catch(console.error);
