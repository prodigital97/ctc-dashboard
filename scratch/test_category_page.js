const fs = require('fs');

async function testCategoryPage() {
  const url = 'https://classytravelcouples.com/category/food-culinary/';
  console.log(`Fetching ${url}...`);
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`Failed to fetch: ${res.status}`);
    return;
  }
  const html = await res.text();
  fs.writeFileSync('scratch/category_food_culinary.html', html);
  console.log('Saved html to scratch/category_food_culinary.html');

  // Let's find all <a href=... inside articles or grids
  const regex = /<a\s+[^>]*href="([^"]+)"[^>]*>/gi;
  let match;
  const links = [];
  while ((match = regex.exec(html)) !== null) {
    const link = match[1];
    if (link.includes('/amphoras') || link.includes('/soil-to-table') || link.includes('/gilded-grandeur') || link.includes('/porcelain-vaulted') || link.includes('/moalboal') || link.includes('/monad') || link.includes('/santorini')) {
      links.push(link);
    }
  }
  console.log('Matches for specific post slugs:');
  console.log([...new Set(links)]);
}

testCategoryPage().catch(console.error);
