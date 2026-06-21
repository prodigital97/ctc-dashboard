require('dotenv').config({ path: '../.env' });
const wpUrl = process.env.WP_URL || 'https://classytravelcouples.com';
const wpUsername = process.env.WP_USERNAME || 'duttapronoy97@gmail.com';
const wpPassword = process.env.WP_APPLICATION_PASSWORD || 'Sajal@25021997';

const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
const authHeader = `Basic ${base64Auth}`;

async function inspectThemes() {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  const url = `${cleanWpUrl}/wp-json/wp/v2/themes`;
  try {
    const response = await fetch(url, { headers: { 'Authorization': authHeader } });
    const themes = await response.json();
    const summary = themes.map(t => ({
      name: t.name.raw,
      slug: t.stylesheet,
      template: t.template,
      status: t.status
    }));
    console.log(summary);
  } catch (err) {
    console.error(err.message);
  }
}

inspectThemes();
