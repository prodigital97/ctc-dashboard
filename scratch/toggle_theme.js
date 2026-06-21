require('dotenv').config({ path: '../.env' });
const wpUrl = process.env.WP_URL || 'https://classytravelcouples.com';
const wpUsername = process.env.WP_USERNAME || 'duttapronoy97@gmail.com';
const wpPassword = process.env.WP_APPLICATION_PASSWORD || 'Sajal@25021997';

const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
const authHeader = `Basic ${base64Auth}`;

async function toggleTheme(themeSlug) {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  const settingsUrl = `${cleanWpUrl}/wp-json/wp/v2/settings`;
  
  console.log(`[WP Theme Switcher] Setting active theme stylesheet to: ${themeSlug}...`);
  try {
    const response = await fetch(settingsUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify({
        stylesheet: themeSlug
      })
    });
    const data = await response.json();
    if (response.ok) {
      console.log(`[WP Theme Switcher] Success! Current active theme stylesheet is now: ${data.stylesheet}`);
      return true;
    } else {
      console.error(`[WP Theme Switcher] Failed to switch theme:`, data.message || response.statusText);
      return false;
    }
  } catch (err) {
    console.error('Error switching theme:', err.message);
    return false;
  }
}

// Switch to astra-child-ctc-1-1
toggleTheme('astra-child-ctc-1-1');
