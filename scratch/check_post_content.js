const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const auth = 'Basic ' + Buffer.from(process.env.WP_USERNAME + ':' + process.env.WP_APPLICATION_PASSWORD).toString('base64');
const WP = 'https://classytravelcouples.com/wp-json/wp/v2';

async function checkPosts() {
  const url = `${WP}/posts?status=publish&per_page=5&_embed`;
  const res = await fetch(url, { headers: { Authorization: auth } });
  const posts = await res.json();
  
  for (const post of posts) {
    console.log('====================================');
    console.log(`ID: ${post.id}`);
    console.log(`Title: ${post.title.rendered}`);
    console.log(`Link: ${post.link}`);
    console.log(`Slug: ${post.slug}`);
    
    // Check if the content has scripts or redirects
    const content = post.content.rendered;
    const hasScript = content.includes('<script>');
    const hasSantorini = content.includes('santorini');
    
    console.log(`Has <script>: ${hasScript}`);
    console.log(`Has "santorini": ${hasSantorini}`);
    
    if (hasScript) {
      // Find all script tags
      const regex = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi;
      const matches = content.match(regex);
      if (matches) {
        console.log('Scripts found:');
        matches.forEach(m => console.log('  ', m));
      }
    }
  }
}

checkPosts().catch(console.error);
