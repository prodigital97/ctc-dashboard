const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const auth = 'Basic ' + Buffer.from(process.env.WP_USERNAME + ':' + process.env.WP_APPLICATION_PASSWORD).toString('base64');
const WP = 'https://classytravelcouples.com/wp-json/wp/v2';

const ME_TAG_ID = 54;

const ACTUAL_ME_KEYWORDS = [
  /\bdubai\b/i,
  /\bjordan\b/i,
  /\boman\b/i,
  /\bomani\b/i,
  /\babu dhabi\b/i,
  /\bpetra\b/i,
  /\bdesert palace\b/i,
  /\bdesert palaces\b/i,
  /\buae\b/i,
  /\bqatar\b/i,
  /\begypt\b/i,
  /\bcairo\b/i,
  /\bmiddle east\b/i
];

function isRealMiddleEast(title) {
  return ACTUAL_ME_KEYWORDS.some(regex => regex.test(title));
}

async function fixPosts(status) {
  console.log(`\n📋 Fixing ${status} posts...`);
  let page = 1;
  let totalFixed = 0;
  
  while (true) {
    const res = await fetch(`${WP}/posts?status=${status}&tags=${ME_TAG_ID}&per_page=100&page=${page}`, {
      headers: { Authorization: auth }
    });
    if (!res.ok) {
      break;
    }
    const posts = await res.json();
    if (!posts || posts.length === 0) break;
    
    console.log(`Page ${page}: found ${posts.length} posts tagged with Middle East.`);
    
    for (const post of posts) {
      const title = post.title.rendered.replace(/&#[0-9]+;/g, '').replace(/&amp;/g, '&').replace(/&[a-z]+;/g, '');
      
      if (!isRealMiddleEast(title)) {
        // Remove tag ID 54 from post.tags
        const newTags = (post.tags || []).filter(t => t !== ME_TAG_ID);
        
        console.log(`  Untagging: "${title.substring(0, 50)}"`);
        const updateRes = await fetch(`${WP}/posts/${post.id}`, {
          method: 'POST',
          headers: { Authorization: auth, 'Content-Type': 'application/json' },
          body: JSON.stringify({ tags: newTags })
        });
        
        if (updateRes.ok) {
          console.log(`    -> ✅ Successfully untagged.`);
          totalFixed++;
        } else {
          console.error(`    -> ❌ Failed to update tags.`);
        }
        await new Promise(r => setTimeout(r, 100));
      } else {
        console.log(`  Keeping tag: "${title.substring(0, 50)}"`);
      }
    }
    page++;
  }
  console.log(`✨ Fixed ${totalFixed} ${status} posts!`);
}

async function run() {
  await fixPosts('publish');
  await fixPosts('future');
  console.log('\n✅ Middle East tagging corrections complete!');
}

run().catch(console.error);
