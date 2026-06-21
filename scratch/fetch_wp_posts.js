require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const wpUrl = process.env.WP_URL;
const wpUsername = process.env.WP_USERNAME;
const wpPassword = process.env.WP_APPLICATION_PASSWORD;

if (!wpUrl || !wpUsername || !wpPassword) {
  console.error('Error: WordPress credentials missing in .env!');
  process.exit(1);
}

async function fetchPosts() {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  const apiEndpoint = `${cleanWpUrl}/wp-json/wp/v2/posts?per_page=100`;
  const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
  const authHeader = `Basic ${base64Auth}`;

  console.log(`Fetching posts from: ${apiEndpoint}`);
  try {
    const response = await fetch(apiEndpoint, {
      headers: { 'Authorization': authHeader }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status} ${response.statusText}`);
    }
    
    const posts = await response.json();
    console.log(`Successfully fetched ${posts.length} posts.`);
    posts.forEach((post, i) => {
      console.log(`[${i + 1}] ID: ${post.id} | Title: "${post.title.rendered}" | Date: ${post.date} | Status: ${post.status}`);
    });
  } catch (error) {
    console.error('Failed to fetch posts:', error.message);
  }
}

fetchPosts();
