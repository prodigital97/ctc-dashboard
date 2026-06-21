const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const auth = 'Basic ' + Buffer.from(process.env.WP_USERNAME + ':' + process.env.WP_APPLICATION_PASSWORD).toString('base64');
const WP = 'https://classytravelcouples.com/wp-json';

async function checkMenus() {
  console.log('Fetching menus...');
  // WP REST API Menus endpoint depends on theme or plugins, or we can check wp-json/wp-api-menus/v2/menus
  const endpoints = [
    '/wp/v2/navigation',
    '/wp-api-menus/v2/menus',
    '/wp/v2/menus',
    '/wp/v2/menu-items'
  ];

  for (const ep of endpoints) {
    try {
      const res = await fetch(`${WP}${ep}`, { headers: { Authorization: auth } });
      if (res.ok) {
        const data = await res.json();
        console.log(`\nEndpoint ${ep} succeeded:`);
        if (Array.isArray(data)) {
          console.log(data.map(item => ({ id: item.id, title: item.title, url: item.url || item.link || (item.title && item.title.rendered) })));
        } else {
          console.log(data);
        }
      } else {
        console.log(`Endpoint ${ep} failed with status ${res.status}`);
      }
    } catch (err) {
      console.log(`Endpoint ${ep} threw error: ${err.message}`);
    }
  }
}

checkMenus().catch(console.error);
