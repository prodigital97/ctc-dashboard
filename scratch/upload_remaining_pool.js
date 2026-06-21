const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const styleHelper = require('../style_helper');

const wpUrl = (process.env.WP_URL || 'https://classytravelcouples.com').replace(/\/$/, '');
const wpUsername = process.env.WP_USERNAME;
const wpPassword = process.env.WP_APPLICATION_PASSWORD;
const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
const authHeader = `Basic ${base64Auth}`;

// ── CONFIG ──────────────────────────────────────────────────────────────────
const MINUTES_PER_POST = 48;   // 30 posts/day
const START_OFFSET_MINUTES = 2; // first post in 2 minutes
// ────────────────────────────────────────────────────────────────────────────

const pool = JSON.parse(fs.readFileSync(path.join(__dirname, '../renders_pool.json'), 'utf8'));

// Already-in-WP slugs check (we'll re-fetch live)
async function getExistingTitles() {
  const res = await fetch(
    `${wpUrl}/wp-json/wp/v2/posts?status=any&per_page=100`,
    { headers: { Authorization: authHeader } }
  );
  const posts = await res.json();
  return posts.map(p =>
    p.title.rendered
      .toLowerCase()
      .replace(/&#[0-9]+;/g, '')
      .replace(/&amp;/g, '&')
      .replace(/&[a-z]+;/g, '')
      .trim()
  );
}

async function uploadMediaFromUrl(imageUrl, title) {
  if (!imageUrl) return null;
  try {
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) return null;
    const buffer = await imgRes.arrayBuffer();
    const filename = 'featured-image.jpg';
    const uploadRes = await fetch(`${wpUrl}/wp-json/wp/v2/media`, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'image/jpeg'
      },
      body: Buffer.from(buffer)
    });
    const media = await uploadRes.json();
    if (!uploadRes.ok) return null;
    return media.id;
  } catch {
    return null;
  }
}

async function getCategoryIds(tags) {
  try {
    const res = await fetch(`${wpUrl}/wp-json/wp/v2/categories?per_page=100`, {
      headers: { Authorization: authHeader }
    });
    const cats = await res.json();
    const ids = [];
    tags.forEach(tag => {
      const slug = tag.toLowerCase()
        .replace(/&/g, ' ')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
      const match = cats.find(c => c.slug === slug || c.name.toLowerCase() === tag.toLowerCase());
      if (match) ids.push(match.id);
    });
    return ids;
  } catch {
    return [];
  }
}

// Featured images for known topics
const HERO_IMAGES = {
  default: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=600&q=80',
  capeTown: 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?auto=format&fit=crop&w=1200&h=600&q=80',
  cruise: 'https://images.unsplash.com/photo-1548574505-5e239809ee19?auto=format&fit=crop&w=1200&h=600&q=80',
  dining: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&h=600&q=80',
  japan: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&h=600&q=80',
  usa: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?auto=format&fit=crop&w=1200&h=600&q=80',
  argentina: 'https://images.unsplash.com/photo-1612294037637-ec328d0e075e?auto=format&fit=crop&w=1200&h=600&q=80',
  italy: 'https://images.unsplash.com/photo-1516483638261-f4dbaf036963?auto=format&fit=crop&w=1200&h=600&q=80',
  borabora: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=600&q=80',
  philippines: 'https://images.unsplash.com/photo-1518509562904-e7ef99cdcc86?auto=format&fit=crop&w=1200&h=600&q=80',
  greece: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=1200&h=600&q=80',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?auto=format&fit=crop&w=1200&h=600&q=80',
  insurance: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?auto=format&fit=crop&w=1200&h=600&q=80',
  drive: 'https://images.unsplash.com/photo-1489824904134-891ab64532f1?auto=format&fit=crop&w=1200&h=600&q=80',
  wine: 'https://images.unsplash.com/photo-1506377247377-2a5b3b417ebb?auto=format&fit=crop&w=1200&h=600&q=80',
};

function getHeroImage(title) {
  const t = title.toLowerCase();
  if (t.includes('cape town')) return HERO_IMAGES.capeTown;
  if (t.includes('cruise') || t.includes('yacht')) return HERO_IMAGES.cruise;
  if (t.includes('dining') || t.includes('chef') || t.includes('culinar') || t.includes('bakeri') || t.includes('market')) return HERO_IMAGES.dining;
  if (t.includes('japan') || t.includes('kanazawa')) return HERO_IMAGES.japan;
  if (t.includes('usa') || t.includes('missouri') || t.includes('american') || t.includes('catalina') || t.includes('drive-in') || t.includes('liverpoo')) return HERO_IMAGES.usa;
  if (t.includes('buenos aires') || t.includes('argentina')) return HERO_IMAGES.argentina;
  if (t.includes('levanto') || t.includes('cinque')) return HERO_IMAGES.italy;
  if (t.includes('bora bora')) return HERO_IMAGES.borabora;
  if (t.includes('philippines') || t.includes('malapascua') || t.includes('moalboal')) return HERO_IMAGES.philippines;
  if (t.includes('greek') || t.includes('greece')) return HERO_IMAGES.greece;
  if (t.includes('bali')) return HERO_IMAGES.bali;
  if (t.includes('insurance')) return HERO_IMAGES.insurance;
  if (t.includes('road trip') || t.includes('drive') || t.includes('liverpool')) return HERO_IMAGES.drive;
  if (t.includes('wine') || t.includes('bordeaux')) return HERO_IMAGES.wine;
  return HERO_IMAGES.default;
}

async function publishPost(item, scheduleIndex) {
  const imageUrl = getHeroImage(item.title);
  const mediaId = await uploadMediaFromUrl(imageUrl, item.title);

  const categoryIds = await getCategoryIds(item.keywords ? [item.keywords[0]] : ['Destination Guides']);

  // Schedule: start from now + offset
  const startTime = new Date();
  startTime.setUTCMinutes(startTime.getUTCMinutes() + START_OFFSET_MINUTES);
  const postTime = new Date(startTime.getTime() + scheduleIndex * MINUTES_PER_POST * 60 * 1000);

  const pad = n => String(n).padStart(2, '0');
  const dateStr = `${postTime.getUTCFullYear()}-${pad(postTime.getUTCMonth()+1)}-${pad(postTime.getUTCDate())}T${pad(postTime.getUTCHours())}:${pad(postTime.getUTCMinutes())}:${pad(postTime.getUTCSeconds())}`;
  const istDisplay = postTime.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

  const cleanHtml = styleHelper.convertHtmlToCleanTemplate(item);

  const payload = {
    title: item.title,
    content: cleanHtml,
    excerpt: item.excerpt || '',
    status: 'future',
    date: dateStr,
    meta: {}
  };

  if (mediaId) payload.featured_media = mediaId;
  if (categoryIds.length > 0) payload.categories = categoryIds;
  if (item.metaTitle) { payload.meta['_yoast_wpseo_title'] = item.metaTitle; payload.meta['rank_math_title'] = item.metaTitle; }
  if (item.metaDescription) { payload.meta['_yoast_wpseo_metadesc'] = item.metaDescription; payload.meta['rank_math_description'] = item.metaDescription; }
  if (item.keywords?.length > 0) { payload.meta['_yoast_wpseo_focuskw'] = item.keywords[0]; payload.meta['rank_math_focus_keyword'] = item.keywords[0]; }

  const res = await fetch(`${wpUrl}/wp-json/wp/v2/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: authHeader },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || res.statusText);

  console.log(`  ✅ Scheduled: ${dateStr} IST:${istDisplay} | ID:${data.id}`);
  return data.id;
}

async function run() {
  console.log('🔍 Fetching existing WP post titles...');
  const existingTitles = await getExistingTitles();
  console.log(`   Found ${existingTitles.length} existing posts in WordPress.\n`);

  // Filter pool to only items not yet in WP
  const toUpload = pool.filter(item => {
    const titleLower = item.title.toLowerCase();
    return !existingTitles.some(t =>
      t.includes(titleLower.substring(0, 30)) ||
      titleLower.includes(t.substring(0, 30))
    );
  });

  console.log(`📋 Found ${toUpload.length} blogs to upload & schedule.`);
  console.log(`⏰ Interval: ${MINUTES_PER_POST} min | Rate: ~${Math.round(1440/MINUTES_PER_POST)}/day\n`);

  let successCount = 0;
  for (let i = 0; i < toUpload.length; i++) {
    const item = toUpload[i];
    console.log(`[${i+1}/${toUpload.length}] "${item.title.substring(0,65)}"`);
    try {
      await publishPost(item, i);
      successCount++;
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error(`  ❌ FAILED: ${err.message}`);
    }
  }

  console.log(`\n✨ Done! ${successCount}/${toUpload.length} posts scheduled at ~30/day pace.`);
}

run().catch(console.error);
