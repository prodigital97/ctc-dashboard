const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const auth = 'Basic ' + Buffer.from(process.env.WP_USERNAME + ':' + process.env.WP_APPLICATION_PASSWORD).toString('base64');
const WP = 'https://classytravelcouples.com/wp-json/wp/v2';

const TAG_NAMES = {
  'africa': 'destination-africa',
  'europe': 'destination-europe',
  'asia': 'destination-asia',
  'americas': 'destination-americas',
  'indian-ocean': 'destination-indian-ocean',
  'middle-east': 'destination-middle-east'
};

const KEYWORDS = {
  'africa': ['medjumbe', 'mozambique', 'cape town', 'africa', 'safari', 'kenya', 'serengeti', 'marrakech', 'morocco'],
  'europe': ['europe', 'european', 'germany', 'bordeaux', 'france', 'greek', 'greece', 'levanto', 'cinque', 'liverpool', 'britain', 'bakeries', 'cafés', 'street food', 'paris', 'amalfi', 'italy', 'rome', 'venice', 'florence', 'santorini', 'switzerland', 'london', 'barcelona', 'spain'],
  'asia': ['bali', 'japan', 'kanazawa', 'philippines', 'malapascua', 'moalboal', 'asia', 'japanese', 'tokyo', 'kyoto', 'osaka', 'bangkok', 'thailand', 'vietnamese', 'vietnam', 'ubud'],
  'americas': ['new york', 'nyc', 'buenos aires', 'nova scotia', 'canada', 'caribbean', 'missouri', 'catalina', 'usa', 'american', 'drive-in', 'argentina', 'brazil', 'rio de janeiro', 'mexico', 'tulum'],
  'indian-ocean': ['mozambique', 'medjumbe', 'maldives', 'seychelles', 'indian ocean', 'raja ampat', 'papua', 'indonesia', 'bora bora', 'mauritius'],
  'middle-east': ['middle east', 'dubai', 'jordan', 'oman', 'abu dhabi', 'petra', 'desert palaces', 'uae', 'qatar', 'egypt', 'cairo']
};

const tagIdMap = {};

async function ensureTag(slug, name) {
  // Check if exists
  const res = await fetch(`${WP}/tags?slug=${slug}`, { headers: { Authorization: auth } });
  const tags = await res.json();
  if (tags && tags.length > 0) {
    console.log(`Tag "${name}" already exists with ID: ${tags[0].id}`);
    return tags[0].id;
  }
  
  // Create tag
  const createRes = await fetch(`${WP}/tags`, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, slug })
  });
  if (createRes.ok) {
    const data = await createRes.json();
    console.log(`✅ Created tag "${name}" with ID: ${data.id}`);
    return data.id;
  } else {
    console.error(`❌ Failed to create tag "${name}":`, await createRes.text());
    return null;
  }
}

function getDests(title) {
  const t = title.toLowerCase();
  const dests = [];
  for (const [dest, kwList] of Object.entries(KEYWORDS)) {
    for (const kw of kwList) {
      if (t.includes(kw)) {
        dests.push(dest);
        break;
      }
    }
  }
  return dests;
}

async function tagPosts(status) {
  console.log(`\n📋 Processing posts with status: ${status}...`);
  let page = 1;
  let totalTagged = 0;
  
  while (true) {
    const res = await fetch(`${WP}/posts?status=${status}&per_page=100&page=${page}`, {
      headers: { Authorization: auth }
    });
    if (!res.ok) {
      console.log(`Reached end of pages or error at page ${page}`);
      break;
    }
    const posts = await res.json();
    if (!posts || posts.length === 0) break;
    
    console.log(`Page ${page}: found ${posts.length} posts.`);
    
    for (const post of posts) {
      const title = post.title.rendered.replace(/&#[0-9]+;/g, '').replace(/&amp;/g, '&').replace(/&[a-z]+;/g, '');
      const dests = getDests(title);
      if (dests.length === 0) continue;
      
      const newTagIds = dests.map(d => tagIdMap[d]).filter(Boolean);
      const existingTagIds = post.tags || [];
      const mergedTagIds = [...new Set([...existingTagIds, ...newTagIds])];
      
      // Only update if there are new tags to add
      const needsUpdate = newTagIds.some(id => !existingTagIds.includes(id));
      
      if (needsUpdate) {
        const updateRes = await fetch(`${WP}/posts/${post.id}`, {
          method: 'POST',
          headers: { Authorization: auth, 'Content-Type': 'application/json' },
          body: JSON.stringify({ tags: mergedTagIds })
        });
        if (updateRes.ok) {
          console.log(`  ✅ Tagged [${dests.join(', ')}]: "${title.substring(0, 50)}"`);
          totalTagged++;
        } else {
          console.error(`  ❌ Failed to tag: "${title.substring(0, 50)}"`);
        }
        await new Promise(r => setTimeout(r, 100));
      }
    }
    page++;
  }
  console.log(`✨ Tagged ${totalTagged} ${status} posts!`);
}

async function run() {
  console.log('🔧 Initializing destination tags...');
  for (const [key, slug] of Object.entries(TAG_NAMES)) {
    const name = key.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
    const tagName = `destination-${key}`;
    const id = await ensureTag(slug, tagName);
    tagIdMap[key] = id;
  }
  console.log('Tag ID Map:', tagIdMap);
  
  await tagPosts('publish');
  await tagPosts('future');
  
  console.log('\n✅ All posts checked and tagged successfully!');
}

run().catch(console.error);
