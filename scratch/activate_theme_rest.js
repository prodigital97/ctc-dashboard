require('dotenv').config({ path: '../.env' });
const wpUrl = process.env.WP_URL || 'https://classytravelcouples.com';
const wpUsername = process.env.WP_USERNAME || 'duttapronoy97@gmail.com';
const wpPassword = process.env.WP_APPLICATION_PASSWORD || 'Sajal@25021997';

const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
const authHeader = `Basic ${base64Auth}`;

async function activateTheme(themeSlug) {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  const url = `${cleanWpUrl}/wp-json/wp/v2/themes/${themeSlug}`;
  
  console.log(`[WP Theme REST] Activating theme "${themeSlug}" via POST to: ${url}`);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        status: 'active'
      })
    });
    const data = await response.json();
    if (response.ok) {
      console.log(`[WP Theme REST] Success! Theme "${themeSlug}" is now: ${data.status}`);
      return true;
    } else {
      console.error(`[WP Theme REST] Failed to activate theme:`, data.message || response.statusText);
      return false;
    }
  } catch (err) {
    console.error('Error in REST theme activation:', err.message);
    return false;
  }
}

activateTheme('astra');
