require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const fs = require('fs');
const path = require('path');
const wpUrl = process.env.WP_URL;
const wpUsername = process.env.WP_USERNAME;
const wpPassword = process.env.WP_APPLICATION_PASSWORD;

async function downloadPost(id) {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  const apiEndpoint = `${cleanWpUrl}/wp-json/wp/v2/posts/${id}`;
  const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
  const authHeader = `Basic ${base64Auth}`;

  console.log(`Downloading post ID ${id} from: ${apiEndpoint}`);
  try {
    const response = await fetch(apiEndpoint, {
      headers: { 'Authorization': authHeader }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const post = await response.json();
    const outputFilename = path.join(__dirname, `../scratch/post_${id}.json`);
    fs.writeFileSync(outputFilename, JSON.stringify(post, null, 2), 'utf8');
    console.log(`Post ID ${id} saved to ${outputFilename}`);
    console.log(`Title: "${post.title.rendered}"`);
  } catch (error) {
    console.error(`Failed to download post ID ${id}:`, error.message);
  }
}

async function run() {
  await downloadPost(353); // Historic Cafés of Europe
  await downloadPost(345); // Best Beaches in Bali
}

run();
