require('dotenv').config({ path: '../.env' });
const wpUrl = process.env.WP_URL || 'https://classytravelcouples.com';
const wpUsername = process.env.WP_USERNAME || 'duttapronoy97@gmail.com';
const wpPassword = process.env.WP_APPLICATION_PASSWORD || 'Sajal@25021997';

const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
const authHeader = `Basic ${base64Auth}`;

async function fetchFuturePost() {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  
  // 1. Get future posts
  try {
    const listRes = await fetch(`${cleanWpUrl}/wp-json/wp/v2/posts?status=future&per_page=5`, {
      headers: { 'Authorization': authHeader }
    });
    const posts = await listRes.json();
    if (!posts || posts.length === 0) {
      console.log('No future posts found.');
      return;
    }
    
    const targetPost = posts[0];
    console.log(`Targeting Post ID: ${targetPost.id} | Title: ${targetPost.title.rendered}`);
    
    // 2. Fetch the post preview/page using credentials
    // Note: WordPress REST API /posts/<id> gets the raw post content.
    // Let's print the post content.rendered.
    console.log('\n--- REST API post content.rendered ---');
    console.log(targetPost.content.rendered.substring(0, 1000));
    
    // We can also fetch the frontend page if possible, but let's see content.rendered first.
  } catch (err) {
    console.error(err.message);
  }
}

fetchFuturePost();
