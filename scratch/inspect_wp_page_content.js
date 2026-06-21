const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const auth = 'Basic ' + Buffer.from(process.env.WP_USERNAME + ':' + process.env.WP_APPLICATION_PASSWORD).toString('base64');
const WP = 'https://classytravelcouples.com/wp-json/wp/v2';

async function inspectPage(id) {
  try {
    const res = await fetch(`${WP}/pages/${id}?context=edit`, {
      headers: { Authorization: auth }
    });
    if (!res.ok) {
      console.log(`Failed to fetch page ${id}: ${res.statusText}`);
      return;
    }
    const page = await res.json();
    console.log(`\n=== PAGE ID: ${id} | Slug: ${page.slug} ===`);
    console.log('Title:', page.title.raw || page.title.rendered);
    console.log('Template:', page.template);
    console.log('Status:', page.status);
    console.log('Content Raw Length:', page.content.raw ? page.content.raw.length : 0);
    console.log('Content Raw Snippet (500 chars):');
    console.log(page.content.raw ? page.content.raw.substring(0, 500) : 'None');
    
    // Check metadata / custom fields if any
    console.log('Meta keys:', Object.keys(page.meta || {}));
  } catch (e) {
    console.error(e);
  }
}

async function run() {
  await inspectPage(109); // Destinations
  await inspectPage(126); // Blog
  await inspectPage(421); // Europe
}

run();
