const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const auth = 'Basic ' + Buffer.from(process.env.WP_USERNAME + ':' + process.env.WP_APPLICATION_PASSWORD).toString('base64');
const WP = 'https://classytravelcouples.com/wp-json/wp/v2';

// Geographic tag assignments — map post title keywords to destination tags
const DESTINATION_TAGS = {
  // Tags to create/use on WP - these are WP Tags (not categories)
  'africa': [
    'medjumbe', 'mozambique', 'cape town', 'africa', 'safari', 'raja ampat is not africa'
  ],
  'europe': [
    'europe', 'european', 'germany', 'bordeaux', 'france', 'greek', 'greece', 
    'levanto', 'cinque terre', 'liverpool', 'britain', 'artisanal bakeries', 'historic caf'
  ],
  'asia': [
    'bali', 'japan', 'kanazawa', 'philippines', 'malapascua', 'moalboal', 'asia', 'japanese'
  ],
  'americas': [
    'new york', 'buenos aires', 'nova scotia', 'canada', 'caribbean', 'missouri', 
    'catalina', 'usa', 'american', 'drive-in', 'liverpool'  
  ],
  'indian-ocean': [
    'mozambique', 'medjumbe', 'maldives', 'seychelles', 'indian ocean', 'raja ampat', 
    'papua', 'indonesia'
  ],
  'middle-east': [
    'middle east', 'dubai', 'jordan', 'oman'
  ]
};

// Tag name -> WP tag ID mapping (will be built)
const tagIdMap = {};

async function ensureTag(tagName) {
  if (tagIdMap[tagName]) return tagIdMap[tagName];

  // Try to find existing tag
  const res = await fetch(`${WP}/tags?search=${encodeURIComponent(tagName)}&per_page=5`, {
    headers: { Authorization: auth }
  });
  const tags = await res.json();
  const existing = tags.find(t => t.name.toLowerCase() === tagName.toLowerCase());
  
  if (existing) {
    tagIdMap[tagName] = existing.id;
    return existing.id;
  }

  // Create new tag
  const createRes = await fetch(`${WP}/tags`, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: tagName })
  });
  const created = await createRes.json();
  if (createRes.ok) {
    tagIdMap[tagName] = created.id;
    console.log(`  Created tag: "${tagName}" (ID: ${created.id})`);
    return created.id;
  }
  return null;
}

function getDestinationsForPost(title) {
  const t = title.toLowerCase();
  const dests = [];
  
  // Africa
  if (t.includes('mozambique') || t.includes('medjumbe') || t.includes('cape town') || t.includes('africa')) {
    dests.push('africa');
  }
  // Europe  
  if (t.includes('europe') || t.includes('european') || t.includes('germany') || 
      t.includes('bordeaux') || t.includes('greek') || t.includes('greece') ||
      t.includes('levanto') || t.includes('cinque') || t.includes('liverpool') || 
      t.includes('britain') || t.includes('bakeries') || t.includes('cafés') || t.includes('street food')) {
    dests.push('europe');
  }
  // Asia
  if (t.includes('bali') || t.includes('japan') || t.includes('kanazawa') || 
      t.includes('philippines') || t.includes('malapascua') || t.includes('moalboal') ||
      t.includes('raja ampat') || t.includes('papua')) {
    dests.push('asia');
  }
  // Americas
  if (t.includes('new york') || t.includes('buenos aires') || t.includes('nova scotia') || 
      t.includes('caribbean') || t.includes('missouri') || t.includes('catalina') ||
      t.includes('usa') || t.includes('american') || t.includes('drive-in')) {
    dests.push('americas');
  }
  // Indian Ocean
  if (t.includes('mozambique') || t.includes('medjumbe') || t.includes('maldives') || 
      t.includes('raja ampat') || t.includes('papua') || t.includes('indian ocean') ||
      t.includes('indonesia') || t.includes('bora bora') || t.includes('philippines')) {
    dests.push('indian-ocean');
  }
  
  return dests;
}

async function run() {
  console.log('🏷️  Ensuring destination tags exist in WordPress...');
  const destTagIds = {};
  for (const dest of ['africa', 'europe', 'asia', 'americas', 'indian-ocean']) {
    const id = await ensureTag(`destination-${dest}`);
    destTagIds[dest] = id;
    await new Promise(r => setTimeout(r, 200));
  }
  console.log('Tag IDs:', destTagIds);
  
  // Fetch all published posts
  console.log('\n📋 Fetching all published posts...');
  const postsRes = await fetch(`${WP}/posts?status=publish&per_page=100`, {
    headers: { Authorization: auth }
  });
  const posts = await postsRes.json();
  console.log(`Found ${posts.length} published posts.\n`);

  let updated = 0;
  for (const post of posts) {
    const title = post.title.rendered.replace(/&#[0-9]+;/g, '').replace(/&amp;/g, '&').replace(/&[a-z]+;/g, '');
    const dests = getDestinationsForPost(title);
    
    if (dests.length === 0) continue;

    const newTagIds = dests.map(d => destTagIds[d]).filter(Boolean);
    const existingTagIds = post.tags || [];
    const allTagIds = [...new Set([...existingTagIds, ...newTagIds])];

    console.log(`[${title.substring(0, 55)}]`);
    console.log(`  -> Destinations: ${dests.join(', ')}`);
    
    const updateRes = await fetch(`${WP}/posts/${post.id}`, {
      method: 'POST',
      headers: { Authorization: auth, 'Content-Type': 'application/json' },
      body: JSON.stringify({ tags: allTagIds })
    });

    if (updateRes.ok) {
      console.log(`  -> ✅ Tagged`);
      updated++;
    } else {
      console.error(`  -> ❌ Failed`);
    }
    await new Promise(r => setTimeout(r, 300));
  }

  console.log(`\n✨ Tagged ${updated} posts with destination tags!`);
  console.log('Tag IDs for use in destination pages:', JSON.stringify(destTagIds, null, 2));
}

run().catch(console.error);
