require('dotenv').config({ path: '../.env' });
const wpUrl = process.env.WP_URL || 'https://classytravelcouples.com';
const wpUsername = process.env.WP_USERNAME || 'duttapronoy97@gmail.com';
const wpPassword = process.env.WP_APPLICATION_PASSWORD || 'Sajal@25021997';

const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
const authHeader = `Basic ${base64Auth}`;

async function activateThemeElementor(themeSlug) {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  const url = `${cleanWpUrl}/wp-json/elementor-one/v1/themes/${themeSlug}/activate`;
  
  console.log(`[WP Theme Elementor] Activating theme "${themeSlug}" via POST to: ${url}`);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader
      }
    });
    const data = await response.json();
    if (response.ok) {
      console.log(`[WP Theme Elementor] Success! Response:`, data);
      return true;
    } else {
      console.error(`[WP Theme Elementor] Failed to activate theme:`, data.message || response.statusText);
      return false;
    }
  } catch (err) {
    console.error('Error in Elementor theme activation:', err.message);
    return false;
  }
}

activateThemeElementor('astra-child-ctc-1-1');
