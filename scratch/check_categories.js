const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const auth = 'Basic ' + Buffer.from(process.env.WP_USERNAME + ':' + process.env.WP_APPLICATION_PASSWORD).toString('base64');

async function run() {
  // 1. Check all categories
  const cats = await fetch('https://classytravelcouples.com/wp-json/wp/v2/categories?per_page=100', {
    headers: { Authorization: auth }
  }).then(r => r.json());
  
  console.log('=== CATEGORIES ===');
  cats.forEach(c => console.log(`  ID:${c.id} | Count:${c.count} | ${c.name} | slug:${c.slug}`));

  // 2. Check how many scheduled posts have categories assigned
  const scheduled = await fetch('https://classytravelcouples.com/wp-json/wp/v2/posts?status=future&per_page=100', {
    headers: { Authorization: auth }
  }).then(r => r.json());

  console.log('\n=== SCHEDULED POSTS CATEGORIES ===');
  let noCat = 0;
  scheduled.forEach(p => {
    if (!p.categories || p.categories.length === 0 || p.categories[0] === 1) {
      noCat++;
      console.log(`  [NO CAT] ${p.title.rendered.substring(0, 60)}`);
    }
  });
  console.log(`\n${noCat}/${scheduled.length} scheduled posts have no proper category.`);
}

run().catch(console.error);
