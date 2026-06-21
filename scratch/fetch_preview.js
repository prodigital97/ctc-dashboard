require('dotenv').config({ path: '../.env' });
const wpUrl = process.env.WP_URL || 'https://classytravelcouples.com';
const wpUsername = process.env.WP_USERNAME || 'duttapronoy97@gmail.com';
const wpPassword = process.env.WP_APPLICATION_PASSWORD || 'Sajal@25021997';

const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
const authHeader = `Basic ${base64Auth}`;

async function fetchPreview() {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  const previewUrl = `${cleanWpUrl}/?p=363&preview=true`;
  
  console.log('Fetching preview URL:', previewUrl);
  try {
    const res = await fetch(previewUrl, {
      headers: { 'Authorization': authHeader }
    });
    if (!res.ok) {
      console.error(`HTTP error: ${res.status}`);
      return;
    }
    const html = await res.text();
    console.log('HTML length:', html.length);
    console.log('Contains "#ctc-post"?', html.includes('ctc-post'));
    console.log('Contains "ctc-hero"?', html.includes('ctc-hero'));
    
    const contentStart = html.indexOf('class="ctc-main-content"');
    if (contentStart !== -1) {
      console.log('\n--- Content Snippet ---');
      console.log(html.substring(contentStart, contentStart + 1500));
    } else {
      console.log('Could not find ctc-main-content in HTML');
    }
  } catch (err) {
    console.error(err.message);
  }
}

fetchPreview();
