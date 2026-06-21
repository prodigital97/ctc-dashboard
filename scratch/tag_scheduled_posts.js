const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const auth = 'Basic ' + Buffer.from(process.env.WP_USERNAME + ':' + process.env.WP_APPLICATION_PASSWORD).toString('base64');
const WP = 'https://classytravelcouples.com/wp-json/wp/v2';

// Tag IDs from WordPress
const T = { africa:49, europe:50, asia:51, americas:52, 'indian-ocean':53 };

function getDests(title) {
  const t = title.toLowerCase();
  const d = [];
  if (t.includes('mozambique')||t.includes('medjumbe')||t.includes('cape town')||t.includes('africa')) d.push('africa');
  if (t.includes('europe')||t.includes('european')||t.includes('germany')||t.includes('bordeaux')||
      t.includes('greek')||t.includes('greece')||t.includes('levanto')||t.includes('cinque')||
      t.includes('liverpool')||t.includes('britain')||t.includes('bakeries')||t.includes('street food')||
      t.includes('first-time europe')||t.includes('authentic dining')) d.push('europe');
  if (t.includes('bali')||t.includes('japan')||t.includes('kanazawa')||t.includes('philippines')||
      t.includes('malapascua')||t.includes('moalboal')||t.includes('raja ampat')||t.includes('papua')||
      t.includes('indonesia')) d.push('asia');
  if (t.includes('new york')||t.includes('buenos aires')||t.includes('nova scotia')||
      t.includes('caribbean')||t.includes('missouri')||t.includes('catalina')||
      t.includes('usa resorts')||t.includes('american')||t.includes('drive-in')||
      t.includes('nostalgic')) d.push('americas');
  if (t.includes('mozambique')||t.includes('medjumbe')||t.includes('maldives')||
      t.includes('raja ampat')||t.includes('papua')||t.includes('bora bora')||
      t.includes('philippines')||t.includes('indian ocean')) d.push('indian-ocean');
  return d;
}

async function run() {
  const postsRes = await fetch(`${WP}/posts?status=future&per_page=100`, { headers: { Authorization: auth } });
  const posts = await postsRes.json();
  console.log(`Found ${posts.length} scheduled posts to tag.\n`);
  let tagged = 0;
  for (const post of posts) {
    const title = post.title.rendered.replace(/&#[0-9]+;/g,'').replace(/&[a-z]+;/g,'');
    const dests = getDests(title);
    if (!dests.length) continue;
    const newTagIds = [...new Set([...(post.tags||[]), ...dests.map(d=>T[d]).filter(Boolean)])];
    const res = await fetch(`${WP}/posts/${post.id}`, {
      method:'POST', headers:{Authorization:auth,'Content-Type':'application/json'},
      body: JSON.stringify({ tags: newTagIds })
    });
    if (res.ok) { console.log(`✅ [${dests.join(',')}] ${title.substring(0,55)}`); tagged++; }
    await new Promise(r => setTimeout(r, 250));
  }
  console.log(`\n✨ Tagged ${tagged} scheduled posts with destination tags!`);
}
run().catch(console.error);
