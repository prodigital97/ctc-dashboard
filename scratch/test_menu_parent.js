require('dotenv').config({ path: '../.env' });
const wpUrl = process.env.WP_URL || 'https://classytravelcouples.com';
const wpUsername = process.env.WP_USERNAME || 'duttapronoy97@gmail.com';
const wpPassword = process.env.WP_APPLICATION_PASSWORD || 'Sajal@25021997';

const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
const authHeader = `Basic ${base64Auth}`;

async function testNestedMenu() {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  const url = `${cleanWpUrl}/wp-json/wp/v2/menu-items`;
  
  try {
    // 1. Create Parent
    console.log('Creating parent item...');
    const parentRes = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Parent',
        url: '#parent',
        status: 'publish',
        menu: 16,
        type: 'custom'
      })
    });
    
    const parentData = await parentRes.json();
    console.log('Parent ID:', parentData.id);
    
    if (parentData.id) {
      // 2. Create Child using parent field
      console.log('Creating child item with parent:', parentData.id);
      const childRes = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: 'Test Child',
          url: '#child',
          status: 'publish',
          menu: 16,
          type: 'custom',
          parent: parentData.id
        })
      });
      
      const childData = await childRes.json();
      console.log('Child Parent ID in response:', childData.parent);
      
      // Clean up both
      console.log('Cleaning up items...');
      await fetch(`${url}/${childData.id}?force=true`, {
        method: 'DELETE',
        headers: { 'Authorization': authHeader }
      });
      await fetch(`${url}/${parentData.id}?force=true`, {
        method: 'DELETE',
        headers: { 'Authorization': authHeader }
      });
      console.log('Cleaned up.');
    }
  } catch (err) {
    console.error(err.message);
  }
}

testNestedMenu();
