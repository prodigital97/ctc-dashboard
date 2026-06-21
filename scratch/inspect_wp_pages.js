require('dotenv').config({ path: '../.env' });
const wpUrl = process.env.WP_URL || 'https://classytravelcouples.com';
const wpUsername = process.env.WP_USERNAME || 'duttapronoy97@gmail.com';
const wpPassword = process.env.WP_APPLICATION_PASSWORD || 'Sajal@25021997';

const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
const authHeader = `Basic ${base64Auth}`;

async function inspectPages() {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  const url = `${cleanWpUrl}/wp-json/wp/v2/pages?per_page=100`;
  try {
    const response = await fetch(url, { headers: { 'Authorization': authHeader } });
    const pages = await response.json();
    console.log(`Found ${pages.length} pages:`);
    pages.forEach(p => {
      console.log(` - ID: ${p.id} | Slug: ${p.slug} | Title: ${p.title.rendered} | Link: ${p.link}`);
    });
  } catch (err) {
    console.error(err.message);
  }
}

inspectPages();
