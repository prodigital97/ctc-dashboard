require('dotenv').config();
const fs = require('fs');
const path = require('path');
const styleHelper = require('./style_helper');

const poolPath = path.join(__dirname, 'renders_pool.json');

// 1. Validate credentials in .env
const wpUrl = process.env.WP_URL;
const wpUsername = process.env.WP_USERNAME;
const wpPassword = process.env.WP_APPLICATION_PASSWORD;

if (!wpUrl || !wpUsername || !wpPassword || wpPassword.includes('xxxx')) {
  console.error('Error: WordPress credentials are missing or placeholders in .env!');
  console.error('Please open your .env file and set your real WP_URL, WP_USERNAME, and WP_APPLICATION_PASSWORD.');
  process.exit(1);
}

if (!fs.existsSync(poolPath)) {
  console.error('Error: renders_pool.json not found!');
  process.exit(1);
}

const pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));
console.log(`Loaded ${pool.length} blogs from renders_pool.json.`);

const XLSX = require('xlsx');
const excelPath = path.join(__dirname, 'Trending Blog Topics.xlsx');
if (!fs.existsSync(excelPath)) {
  console.error('Error: Trending Blog Topics.xlsx not found!');
  process.exit(1);
}
const workbook = XLSX.readFile(excelPath);
const trendsHistorySheet = workbook.Sheets['Trends History'];
const excelData = XLSX.utils.sheet_to_json(trendsHistorySheet);

// Build a map of Topic -> Category Tags and Row -> Category Tags for robust matching
const topicToCategoriesMap = {};
excelData.forEach(row => {
  const topicKey = (row['Detected Topic'] || '').trim().toLowerCase();
  const rowKey = row['#'];
  const tagsStr = row['Category Tags'] || '';
  const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
  
  if (topicKey) topicToCategoriesMap[topicKey] = tags;
  if (rowKey !== undefined) topicToCategoriesMap[`row-${rowKey}`] = tags;
});


// Helper function to download and upload featured image to WordPress Media Library
async function uploadMediaFromUrl(wpUrl, authHeader, imageUrl, title) {
  if (!imageUrl) return null;
  try {
    console.log(`[WordPress] Downloading image for media upload: ${imageUrl}`);
    const imgResponse = await fetch(imageUrl);
    if (!imgResponse.ok) {
      throw new Error(`Failed to download image: ${imgResponse.statusText}`);
    }
    const buffer = await imgResponse.arrayBuffer();

    let filename = 'featured-image.jpg';
    try {
      const urlPath = new URL(imageUrl).pathname;
      const pathSegments = urlPath.split('/');
      const lastSegment = pathSegments[pathSegments.length - 1];
      if (lastSegment && lastSegment.includes('.')) {
        filename = lastSegment;
      }
    } catch (e) {}

    const uploadEndpoint = `${wpUrl}/wp-json/wp/v2/media`;
    console.log(`[WordPress] Uploading media to: ${uploadEndpoint} (Filename: ${filename})`);

    const uploadResponse = await fetch(uploadEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'image/jpeg'
      },
      body: Buffer.from(buffer)
    });

    const mediaData = await uploadResponse.json();
    if (!uploadResponse.ok) {
      throw new Error(mediaData.message || `Media upload failed: ${uploadResponse.statusText}`);
    }

    console.log(`[WordPress] Media uploaded successfully! Media ID: ${mediaData.id}`);
    return mediaData.id;
  } catch (err) {
    console.error('[WordPress] Media upload error:', err.message);
    return null;
  }
}

// Core function to publish a single post to WordPress
async function publishPost(item, index) {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  const apiEndpoint = `${cleanWpUrl}/wp-json/wp/v2/posts`;
  const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
  const authHeader = `Basic ${base64Auth}`;

  // Find premium featured image URL
  const slug = item.topic
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
  
  let featuredImageUrl = 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=600&q=80';
  
  const HERO_IMAGES = {
    18: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=600&q=80', // Medjumbe
    39: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&h=600&q=80', // Raja Ampat
    49: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&h=600&q=80', // Iconic Hotels
    440: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&h=600&q=80', // Global Venues
    465: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1200&h=600&q=80', // Unique Venues
    76: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=600&q=80', // Bora Bora
    436: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=600&q=80', // Mozambique
    26: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&h=600&q=80',  // Beach Wedding Venues
    42: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=600&q=80',  // Hidden Paradise
    82: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&h=600&q=80'   // All-Inclusive
  };
  
  if (HERO_IMAGES[item.row]) {
    featuredImageUrl = HERO_IMAGES[item.row];
  }

  // 1. Upload featured image to WordPress
  const mediaId = await uploadMediaFromUrl(cleanWpUrl, authHeader, featuredImageUrl, item.title);

  // 2. Resolve Category dynamically
  let categoryIds = [];
  let tags = [];
  const topicKey = (item.topic || '').trim().toLowerCase();
  if (topicToCategoriesMap[topicKey]) {
    tags = topicToCategoriesMap[topicKey];
  } else if (topicToCategoriesMap[`row-${item.row}`]) {
    tags = topicToCategoriesMap[`row-${item.row}`];
  }
  
  if (tags.length === 0) {
    tags = ['Destination Guides'];
  }

  try {
    const catEndpoint = `${cleanWpUrl}/wp-json/wp/v2/categories?per_page=100`;
    const catResponse = await fetch(catEndpoint, { headers: { 'Authorization': authHeader } });
    if (catResponse.ok) {
      const wpCategories = await catResponse.json();
      tags.forEach(tag => {
        const slug = tag.toLowerCase()
          .replace(/&/g, ' ')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '');
        const matched = wpCategories.find(c => c.slug === slug || c.name.toLowerCase() === tag.toLowerCase());
        if (matched) {
          categoryIds.push(matched.id);
        }
      });
    }
  } catch (e) {
    console.warn('Failed to resolve category:', e.message);
  }


  // 3. Calculate drip-feed scheduling (e.g. ~32 posts per day, spaced 45 minutes apart)
  const minutesDelay = index * 45;
  const publishDate = new Date();
  publishDate.setMinutes(publishDate.getMinutes() + 60 + minutesDelay);
  const dateStr = publishDate.toISOString();

  // 4. Convert body content HTML to child-theme clean layout
  const cleanHtml = styleHelper.convertHtmlToCleanTemplate(item);

  // 5. Build Payload
  const payload = {
    title: item.title,
    content: cleanHtml,
    excerpt: item.excerpt || '',
    status: 'future', // Scheduled post
    date: dateStr,
    meta: {}
  };

  if (mediaId) {
    payload.featured_media = mediaId;
  }
  if (categoryIds.length > 0) {
    payload.categories = categoryIds;
  }

  // Setup Yoast / RankMath SEO custom fields
  if (item.metaTitle) {
    payload.meta['_yoast_wpseo_title'] = item.metaTitle;
    payload.meta['rank_math_title'] = item.metaTitle;
  }
  if (item.metaDescription) {
    payload.meta['_yoast_wpseo_metadesc'] = item.metaDescription;
    payload.meta['rank_math_description'] = item.metaDescription;
  }
  if (item.keywords && item.keywords.length > 0) {
    const focusKeyword = Array.isArray(item.keywords) ? item.keywords[0] : item.keywords;
    payload.meta['_yoast_wpseo_focuskw'] = focusKeyword;
    payload.meta['rank_math_focus_keyword'] = focusKeyword;
  }

  console.log(`[WordPress] Publishing post ${index + 1}/${pool.length}: "${item.title}"`);
  console.log(`[WordPress] Scheduled for: ${publishDate.toLocaleString()} (Status: future)`);

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader
    },
    body: JSON.stringify(payload)
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `WordPress Error: ${response.statusText}`);
  }

  console.log(`[WordPress] Success! Post ID: ${data.id}. Link: ${data.link}\n`);
}

async function runImport() {
  console.log('Starting automated publishing pipeline from renders pool...');
  for (let i = 0; i < pool.length; i++) {
    try {
      await publishPost(pool[i], i);
      // Brief pause to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (err) {
      console.error(`Failed to publish post: ${pool[i].title}. Error:`, err.message);
    }
  }
  console.log('Import finished! Check your WordPress Dashboard under Posts > Scheduled.');
}

runImport();
