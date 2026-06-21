const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const auth = 'Basic ' + Buffer.from(process.env.WP_USERNAME + ':' + process.env.WP_APPLICATION_PASSWORD).toString('base64');
const WP = 'https://classytravelcouples.com/wp-json/wp/v2';

const ME_TAG_ID = 54;
const KEYWORDS = ['dubai', 'jordan', 'oman', 'abu dhabi', 'petra', 'desert palace', 'desert palaces', 'uae', 'qatar', 'egypt', 'cairo', 'middle east'];

async function searchPosts(status) {
  const res = await fetch(`${WP}/posts?status=${status}&per_page=100`, {
    headers: { Authorization: auth }
  });
  const posts = await res.json();
  console.log(`Checking ${posts.length} posts with status ${status}...`);
  
  for (const post of posts) {
    const title = post.title.rendered.toLowerCase();
    const content = post.content.rendered.toLowerCase();
    
    // Check if title or content matches any keyword (specifically word boundaries)
    const matches = KEYWORDS.filter(kw => {
      const regex = new RegExp('\\b' + kw + '\\b', 'i');
      return regex.test(title) || regex.test(content);
    });
    
    if (matches.length > 0) {
      console.log(`Found MATCH [${matches.join(', ')}]: "${post.title.rendered}"`);
      // Assign tag
      const existingTags = post.tags || [];
      if (!existingTags.includes(ME_TAG_ID)) {
        const newTags = [...existingTags, ME_TAG_ID];
        const updateRes = await fetch(`${WP}/posts/${post.id}`, {
          method: 'POST',
          headers: { Authorization: auth, 'Content-Type': 'application/json' },
          body: JSON.stringify({ tags: newTags })
        });
        if (updateRes.ok) {
          console.log(`  ✅ Tagged post ${post.id}`);
        } else {
          console.log(`  ❌ Failed to tag post ${post.id}`);
        }
      } else {
        console.log(`  Already tagged.`);
      }
    }
  }
}

async function run() {
  await searchPosts('publish');
  await searchPosts('future');
}

run().catch(console.error);
