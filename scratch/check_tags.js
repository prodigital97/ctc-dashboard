const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const auth = 'Basic ' + Buffer.from(process.env.WP_USERNAME + ':' + process.env.WP_APPLICATION_PASSWORD).toString('base64');

async function run() {
  const tags = await fetch('https://classytravelcouples.com/wp-json/wp/v2/tags?per_page=100', {
    headers: { Authorization: auth }
  }).then(r => r.json());
  
  console.log('=== TAGS ===');
  tags.forEach(t => console.log(`  ID:${t.id} | Count:${t.count} | ${t.name} | slug:${t.slug}`));
}

run().catch(console.error);
