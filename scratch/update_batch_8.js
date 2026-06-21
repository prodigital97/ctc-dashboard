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

// Exact WordPress Post IDs mapped to pool Row Numbers
const UPDATE_CONFIGS = {
  406: { wpId: 659 },
  641: { wpId: 661 },
  694: { wpId: 663 },
  4:   { wpId: 665 },
  114: { wpId: 666 }
};

const targetRows = [406, 641, 694, 4, 114];
const toUpdate = pool.filter(item => targetRows.includes(item.row));

async function updatePost(item) {
  const config = UPDATE_CONFIGS[item.row];
  if (!config || !config.wpId) {
    console.warn(`  ⚠️ No WP Post ID mapped for Row ${item.row}`);
    return;
  }

  const cleanHtml = styleHelper.convertHtmlToCleanTemplate(item);

  const payload = {
    title: item.title,
    content: cleanHtml,
    excerpt: item.excerpt || '',
    meta: {}
  };

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

  const postUrl = `${wpUrl}/wp-json/wp/v2/posts/${config.wpId}`;
  console.log(`Updating WordPress Post ID ${config.wpId} for Row ${item.row}: "${item.title}"`);
  
  const res = await fetch(postUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: authHeader },
    body: JSON.stringify(payload)
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || res.statusText);

  console.log(`  ✅ Updated successfully! Link: ${data.link}`);
}

async function run() {
  console.log(`🚀 Starting update of Batch 8 posts (${toUpdate.length} total) on ${wpUrl}...\n`);
  
  for (let i = 0; i < toUpdate.length; i++) {
    const item = toUpdate[i];
    console.log(`[${i+1}/${toUpdate.length}] Row ${item.row}: "${item.topic}"`);
    try {
      await updatePost(item);
      await new Promise(r => setTimeout(r, 1000));
    } catch (err) {
      console.error(`  ❌ FAILED to update:`, err.message);
    }
    console.log('');
  }
  console.log('✨ All updates completed!');
}

run().catch(console.error);
