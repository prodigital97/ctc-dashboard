require('dotenv').config({ path: '../.env' });
const wpUrl = process.env.WP_URL || 'https://classytravelcouples.com';
const wpUsername = process.env.WP_USERNAME || 'duttapronoy97@gmail.com';
const wpPassword = process.env.WP_APPLICATION_PASSWORD || 'Sajal@25021997';

const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
const authHeader = `Basic ${base64Auth}`;

async function checkOptions() {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  const url = `${cleanWpUrl}/wp-json/hostinger-easy-onboarding/v1/activate-theme`;
  
  console.log(`[WP Options] Sending OPTIONS request to: ${url}`);
  try {
    const response = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        'Authorization': authHeader
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const data = await response.json();
    console.log('OPTIONS Schema:');
    console.log(JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Failed to query OPTIONS:', err.message);
  }
}

checkOptions();
