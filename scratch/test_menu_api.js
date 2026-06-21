require('dotenv').config({ path: '../.env' });
const wpUrl = process.env.WP_URL || 'https://classytravelcouples.com';
const wpUsername = process.env.WP_USERNAME || 'duttapronoy97@gmail.com';
const wpPassword = process.env.WP_APPLICATION_PASSWORD || 'Sajal@25021997';

const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
const authHeader = `Basic ${base64Auth}`;

async function testCreateMenuItem() {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  const url = `${cleanWpUrl}/wp-json/wp/v2/menu-items`;
  
  const payload = {
    title: 'Test Menu Item',
    url: 'https://classytravelcouples.com/test-link',
    status: 'publish',
    menu: 16,
    type: 'custom'
  };
  
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });
    
    console.log('Status:', res.status);
    const data = await res.json();
    console.log('Response:', data);
    
    // Clean it up immediately if successful
    if (res.ok && data.id) {
      console.log('Cleaning up test item...');
      const delRes = await fetch(`${url}/${data.id}?force=true`, {
        method: 'DELETE',
        headers: { 'Authorization': authHeader }
      });
      console.log('Delete status:', delRes.status);
    }
  } catch (err) {
    console.error(err.message);
  }
}

testCreateMenuItem();
