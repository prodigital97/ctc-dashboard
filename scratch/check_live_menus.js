const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const auth = 'Basic ' + Buffer.from(process.env.WP_USERNAME + ':' + process.env.WP_APPLICATION_PASSWORD).toString('base64');
const WP = 'https://classytravelcouples.com/wp-json/wp/v2';

async function run() {
  try {
    // Fetch menus
    const menusRes = await fetch(`${WP}/menus`, { headers: { Authorization: auth } });
    const menus = await menusRes.json();
    console.log('=== MENUS ===');
    console.log(menus);

    // Fetch menu items
    const itemsRes = await fetch(`${WP}/menu-items?per_page=100`, { headers: { Authorization: auth } });
    const items = await itemsRes.json();
    console.log('\n=== MENU ITEMS ===');
    items.forEach(item => {
      console.log(`ID: ${item.id} | Title: ${item.title.rendered || item.title} | URL: ${item.url} | Menu: ${item.menu}`);
    });
  } catch (e) {
    console.error(e);
  }
}

run();
