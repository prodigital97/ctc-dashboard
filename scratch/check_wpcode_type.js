require('dotenv').config({ path: '../.env' });
const wpUrl = process.env.WP_URL || 'https://classytravelcouples.com';
const wpUsername = process.env.WP_USERNAME || 'duttapronoy97@gmail.com';
const wpPassword = process.env.WP_APPLICATION_PASSWORD || 'Sajal@25021997';

const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
const authHeader = `Basic ${base64Auth}`;

async function checkPostTypes() {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  try {
    console.log('[WordPress] Fetching registered post types...');
    const response = await fetch(`${cleanWpUrl}/wp-json/wp/v2/types`, {
      headers: { 'Authorization': authHeader }
    });
    if (!response.ok) {
      throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
    }
    const types = await response.json();
    console.log('Registered post types available in REST API:');
    console.log(Object.keys(types));
  } catch (err) {
    console.error('Failed to fetch post types:', err.message);
  }
}

checkPostTypes();
