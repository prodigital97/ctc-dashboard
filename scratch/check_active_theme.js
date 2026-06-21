require('dotenv').config({ path: '../.env' });
const wpUrl = process.env.WP_URL || 'https://classytravelcouples.com';
const wpUsername = process.env.WP_USERNAME || 'duttapronoy97@gmail.com';
const wpPassword = process.env.WP_APPLICATION_PASSWORD || 'Sajal@25021997';

const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
const authHeader = `Basic ${base64Auth}`;

async function checkActiveTheme() {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  const themesUrl = `${cleanWpUrl}/wp-json/wp/v2/themes`;
  
  try {
    const response = await fetch(themesUrl, {
      headers: { 'Authorization': authHeader }
    });
    if (!response.ok) {
      throw new Error(`HTTP Error ${response.status}`);
    }
    const themes = await response.json();
    console.log('Installed Themes:');
    themes.forEach(t => {
      console.log(` - Slug: ${t.stylesheet} | Name: ${t.name.rendered} | Status: ${t.status}`);
    });
  } catch (err) {
    console.error('Failed to get themes:', err.message);
  }
}

checkActiveTheme();
