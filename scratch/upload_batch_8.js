const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const styleHelper = require('../style_helper');

const wpUrl = (process.env.WP_URL || 'https://classytravelcouples.com').replace(/\/$/, '');
const wpUsername = process.env.WP_USERNAME;
const wpPassword = process.env.WP_APPLICATION_PASSWORD;
const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
const authHeader = `Basic ${base64Auth}`;

const poolPath = path.join(__dirname, '..', 'renders_pool.json');
const pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));

// Filter only the 5 new blogs from Batch 8
const targetRows = [406, 641, 694, 4, 114];
const toUpload = pool.filter(item => targetRows.includes(item.row));

// Mapping specific categories and hero images to avoid any search mismatches
const UPLOAD_CONFIGS = {
  406: {
    imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=600&q=80',
    categories: [31, 35, 32, 34, 33] // Beach & Islands, Destination Guides, Romantic Getaways, Honeymoon Guides, Luxury & Boutique
  },
  641: {
    imageUrl: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&h=600&q=80',
    categories: [46, 37, 40] // Budget Travel & Hacks, City Breaks, Tips & Packing
  },
  694: {
    imageUrl: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?auto=format&fit=crop&w=1200&h=600&q=80',
    categories: [38, 32, 39] // Luxury Travel, Romantic Getaways, Honeymoon
  },
  4: {
    imageUrl: 'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&h=600&q=80',
    categories: [35, 33, 32, 36] // Destination Guides, Luxury & Boutique, Romantic Getaways, Boutique Hotels
  },
  114: {
    imageUrl: 'https://images.unsplash.com/photo-1540959733332-eab4deceeaf7?auto=format&fit=crop&w=1200&h=600&q=80',
    categories: [37, 35, 32, 33, 36, 42] // City Breaks, Destination Guides, Romantic Getaways, Luxury & Boutique, Boutique Hotels, Food & Culinary
  }
};

async function uploadMediaFromUrl(imageUrl, title) {
  if (!imageUrl) return null;
  try {
    console.log(`Downloading hero image for "${title}": ${imageUrl}`);
    const imgRes = await fetch(imageUrl);
    if (!imgRes.ok) throw new Error(`Image download failed: ${imgRes.statusText}`);
    const buffer = await imgRes.arrayBuffer();
    const filename = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-featured.jpg`;
    
    console.log(`Uploading media to WordPress: ${filename}`);
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
    if (!uploadRes.ok) throw new Error(media.message || `Media upload failed: ${uploadRes.statusText}`);
    console.log(`  Uploaded media. ID: ${media.id}`);
    return media.id;
  } catch (err) {
    console.error(`  ❌ Media upload error:`, err.message);
    return null;
  }
}

async function publishPost(item) {
  const config = UPLOAD_CONFIGS[item.row] || {};
  const mediaId = await uploadMediaFromUrl(config.imageUrl, item.title);

  const cleanHtml = styleHelper.convertHtmlToCleanTemplate(item);

  const payload = {
    title: item.title,
    content: cleanHtml,
    excerpt: item.excerpt || '',
    status: 'publish', // Publish immediately
    categories: config.categories || [35],
    meta: {}
  };

  if (mediaId) payload.featured_media = mediaId;
  if (item.metaTitle) {
    payload.meta['_yoast_wpseo_title'] = item.metaTitle;
    payload.meta['rank_math_title'] = item.metaTitle;
  }
  if (item.metaDescription) {
    payload.meta['_yoast_wpseo_metadesc'] = item.metaDescription;
    payload.meta['rank_math_description'] = item.metaDescription;
  }
  if (item.keywords?.length > 0) {
    payload.meta['_yoast_wpseo_focuskw'] = item.keywords[0];
    payload.meta['rank_math_focus_keyword'] = item.keywords[0];
  }

  console.log(`Publishing post to WordPress: "${item.title}"`);
  const res = await fetch(`${wpUrl}/wp-json/wp/v2/posts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: authHeader },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || res.statusText);

  console.log(`  ✅ Published successfully! ID: ${data.id} | Link: ${data.link}`);
  return data;
}

async function run() {
  console.log(`🚀 Starting upload of Batch 8 blogs (${toUpload.length} total) to ${wpUrl}...\n`);
  
  for (let i = 0; i < toUpload.length; i++) {
    const item = toUpload[i];
    console.log(`[${i+1}/${toUpload.length}] Row ${item.row}: "${item.topic}"`);
    try {
      await publishPost(item);
      await new Promise(r => setTimeout(r, 1000)); // Sleep 1 sec between calls
    } catch (err) {
      console.error(`  ❌ FAILED:`, err.message);
    }
    console.log('');
  }
  console.log('✨ All done!');
}

run().catch(console.error);
