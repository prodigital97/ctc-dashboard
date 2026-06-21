require('dotenv').config({ path: '../.env' });
const wpUrl = process.env.WP_URL || 'https://classytravelcouples.com';
const wpUsername = process.env.WP_USERNAME || 'duttapronoy97@gmail.com';
const wpPassword = process.env.WP_APPLICATION_PASSWORD || 'Sajal@25021997';

const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
const authHeader = `Basic ${base64Auth}`;

const menuStructure = [
  { title: 'Home', url: 'https://classytravelcouples.com/' },
  { 
    title: 'Destinations', 
    url: 'https://classytravelcouples.com/destinations/',
    children: [
      { title: 'Europe', url: 'https://classytravelcouples.com/europe/' },
      { title: 'Asia', url: 'https://classytravelcouples.com/asia/' },
      { title: 'Africa', url: 'https://classytravelcouples.com/africa/' },
      { title: 'Middle East', url: 'https://classytravelcouples.com/middle-east/' },
      { title: 'Indian Ocean', url: 'https://classytravelcouples.com/indian-ocean/' },
      { title: 'Americas', url: 'https://classytravelcouples.com/americas/' }
    ]
  },
  {
    title: 'Journal',
    url: 'https://classytravelcouples.com/blog/',
    children: [
      { title: 'Romantic Getaways', url: 'https://classytravelcouples.com/blog/?filter=romantic-getaways' },
      { title: 'Luxury & Boutique', url: 'https://classytravelcouples.com/blog/?filter=luxury-boutique' },
      { title: 'Honeymoon Guides', url: 'https://classytravelcouples.com/blog/?filter=honeymoon-guides' }
    ]
  },
  { title: 'Shop', url: 'https://classytravelcouples.com/our-shop/' },
  { title: 'Free Trip Planner', url: 'https://classytravelcouples.com/free-guide/' },
  { title: 'Our Story', url: 'https://classytravelcouples.com/about/' },
  { title: 'Connect', url: 'https://classytravelcouples.com/contact/' }
];

async function syncMenu() {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  const menuId = 16;
  
  try {
    // 1. Fetch ALL menu items (both assigned and orphans)
    console.log(`Fetching all menu items to clear database...`);
    const listRes = await fetch(`${cleanWpUrl}/wp-json/wp/v2/menu-items?per_page=100`, {
      headers: { 'Authorization': authHeader }
    });
    
    if (!listRes.ok) {
      throw new Error(`Failed to fetch menu items: ${listRes.statusText}`);
    }
    
    const currentItems = await listRes.json();
    console.log(`Found ${currentItems.length} menu items. Deleting them...`);
    
    // 2. Delete all items
    for (const item of currentItems) {
      console.log(` -> Deleting menu item ID ${item.id} ("${item.title.rendered || item.title.raw}")`);
      const delRes = await fetch(`${cleanWpUrl}/wp-json/wp/v2/menu-items/${item.id}?force=true`, {
        method: 'DELETE',
        headers: { 'Authorization': authHeader }
      });
      if (delRes.ok) {
        console.log(`    -> Deleted.`);
      } else {
        console.error(`    -> Failed to delete:`, await delRes.text());
      }
    }
    
    // 3. Rebuild the menu with proper 'menus: menuId' (as integer) field
    console.log('\nRebuilding menu structure...');
    let menuOrderCounter = 1;
    
    for (const topItem of menuStructure) {
      console.log(`Creating top-level item "${topItem.title}"...`);
      const parentRes = await fetch(`${cleanWpUrl}/wp-json/wp/v2/menu-items`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: topItem.title,
          url: topItem.url,
          status: 'publish',
          menus: menuId, // Correct integer field to link to the menu term
          type: 'custom',
          menu_order: menuOrderCounter++
        })
      });
      
      if (!parentRes.ok) {
        console.error(` -> Failed to create top-level item "${topItem.title}":`, await parentRes.text());
        continue;
      }
      
      const parentData = await parentRes.json();
      console.log(` -> Created ID: ${parentData.id}`);
      
      // Create children if any
      if (topItem.children && topItem.children.length > 0) {
        for (const childItem of topItem.children) {
          console.log(`   -> Creating child item "${childItem.title}" under parent ID ${parentData.id}...`);
          const childRes = await fetch(`${cleanWpUrl}/wp-json/wp/v2/menu-items`, {
            method: 'POST',
            headers: {
              'Authorization': authHeader,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              title: childItem.title,
              url: childItem.url,
              status: 'publish',
              menus: menuId, // Correct integer field to link to the menu term
              parent: parentData.id,
              type: 'custom',
              menu_order: menuOrderCounter++
            })
          });
          
          if (childRes.ok) {
            const childData = await childRes.json();
            console.log(`      -> Created ID: ${childData.id}`);
          } else {
            console.error(`      -> Failed to create:`, await childRes.text());
          }
          // Pause to prevent rate limiting
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      }
      // Pause to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    // 4. Re-assign locations
    console.log('\nAssigning menu to primary and mobile_menu locations...');
    const assignRes = await fetch(`${cleanWpUrl}/wp-json/wp/v2/menus/${menuId}`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        locations: ['primary', 'mobile_menu']
      })
    });
    
    if (assignRes.ok) {
      console.log('Successfully assigned menu to primary and mobile locations!');
    } else {
      console.error('Failed to assign menu locations:', await assignRes.text());
    }
    
  } catch (err) {
    console.error('Error syncing menu:', err.message);
  }
}

syncMenu();
