require('dotenv').config();
const fs = require('fs');
const path = require('path');
const styleHelper = require('./style_helper');

const poolPath = path.join(__dirname, 'renders_pool.json');

const wpUrl = process.env.WP_URL;
const wpUsername = process.env.WP_USERNAME;
const wpPassword = process.env.WP_APPLICATION_PASSWORD;

if (!wpUrl || !wpUsername || !wpPassword || wpPassword.includes('xxxx')) {
  console.error('Error: WordPress credentials are missing or placeholders in .env!');
  process.exit(1);
}

if (!fs.existsSync(poolPath)) {
  console.error('Error: renders_pool.json not found!');
  process.exit(1);
}

const pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));
const targetRows = [130, 131, 502, 32, 199];
const targetBlogs = pool.filter(item => targetRows.includes(item.row));

console.log(`Loaded ${pool.length} blogs from pool. Found ${targetBlogs.length} target blogs to update/publish.`);

const XLSX = require('xlsx');
const excelPath = path.join(__dirname, 'Trending Blog Topics.xlsx');
let excelData = [];
if (fs.existsSync(excelPath)) {
  const workbook = XLSX.readFile(excelPath);
  const sheet = workbook.Sheets['Trends History'];
  excelData = XLSX.utils.sheet_to_json(sheet);
}

// Build a map of Row -> Category Tags
const rowToCategoriesMap = {};
excelData.forEach(row => {
  const rowKey = row['#'];
  const tagsStr = row['Category Tags'] || '';
  const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
  if (rowKey !== undefined) {
    rowToCategoriesMap[rowKey] = tags;
  }
});

const defaultCategoryTags = {
  130: ['Beach & Islands', 'Photography Spots'],
  131: ['Beach & Islands', 'Food & Culinary'],
  502: ['Food & Culinary', 'Romantic Getaways'],
  32: ['Food & Culinary', 'Luxury Travel'],
  199: ['Food & Culinary', 'Romantic Getaways']
};

async function uploadMediaFromUrl(cleanWpUrl, authHeader, imageUrl, title) {
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

    const uploadEndpoint = `${cleanWpUrl}/wp-json/wp/v2/media`;
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

async function fetchExistingPosts(cleanWpUrl, authHeader) {
  try {
    const apiEndpoint = `${cleanWpUrl}/wp-json/wp/v2/posts?per_page=100&status=publish,draft,future,pending`;
    console.log(`[WordPress] Fetching existing posts for duplicate matching...`);
    const response = await fetch(apiEndpoint, {
      headers: { 'Authorization': authHeader }
    });
    if (response.ok) {
      const posts = await response.json();
      console.log(`[WordPress] Retrieved ${posts.length} existing posts from site.`);
      return posts;
    } else {
      console.warn(`[WordPress] Failed to fetch existing posts: ${response.statusText}`);
      return [];
    }
  } catch (err) {
    console.error(`[WordPress] Error fetching existing posts:`, err.message);
    return [];
  }
}

async function updateOrPublishPost(item, existingPosts) {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
  const authHeader = `Basic ${base64Auth}`;

  // Find if post exists by title match (case insensitive, trimmed)
  const cleanTitle = item.title.toLowerCase().trim();
  const matchedPost = existingPosts.find(p => p.title.rendered.toLowerCase().trim() === cleanTitle);

  let apiEndpoint = `${cleanWpUrl}/wp-json/wp/v2/posts`;
  let method = 'POST';

  if (matchedPost) {
    apiEndpoint = `${cleanWpUrl}/wp-json/wp/v2/posts/${matchedPost.id}`;
    method = 'POST'; // WordPress REST API uses POST to update fields as well
    console.log(`[WordPress] Found matching post for Row ${item.row} (Post ID: ${matchedPost.id}). Will perform update.`);
  } else {
    console.log(`[WordPress] No matching post found for Row ${item.row}. Will create a new post.`);
  }

  // Find premium hero image URL
  const HERO_IMAGES = {
    130: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&h=600&q=80', // Malapascua
    131: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=1200&h=600&q=80', // Moalboal
    502: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&h=600&q=80', // Historic Cafes
    32: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&h=600&q=80',  // Fine Dining
    199: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&h=600&q=80'  // Wine Regions
  };

  const featuredImageUrl = HERO_IMAGES[item.row] || 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=600&q=80';
  
  // 1. Upload featured image to WordPress (only if creating new, or if updating and it has no featured media)
  let mediaId = null;
  if (!matchedPost || !matchedPost.featured_media) {
    mediaId = await uploadMediaFromUrl(cleanWpUrl, authHeader, featuredImageUrl, item.title);
  }

  // 2. Resolve Categories
  let tags = rowToCategoriesMap[item.row] || defaultCategoryTags[item.row] || ['Destination Guides'];
  let categoryIds = [];
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

  // 3. Build Payload
  const payload = {
    title: item.title,
    content: item.bodyHtml, // Already styled and cleaned by style_converter.js
    excerpt: item.excerpt || '',
    status: 'publish', // Instant publish
    meta: {}
  };

  if (mediaId) {
    payload.featured_media = mediaId;
  }
  if (categoryIds.length > 0) {
    payload.categories = categoryIds;
  }

  // RankMath / Yoast SEO custom fields
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

  const response = await fetch(apiEndpoint, {
    method: method,
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

  console.log(`[WordPress] SUCCESS! Post ID: ${data.id}. Link: ${data.link}\n`);
}

async function runPublish() {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
  const authHeader = `Basic ${base64Auth}`;

  console.log('Fetching list of existing posts from WordPress...');
  const existingPosts = await fetchExistingPosts(cleanWpUrl, authHeader);

  console.log('Starting upload of the 5 new blogs...');
  for (const item of targetBlogs) {
    try {
      await updateOrPublishPost(item, existingPosts);
      await new Promise(resolve => setTimeout(resolve, 2000)); // limit rate
    } catch (err) {
      console.error(`Failed to publish Row ${item.row}:`, err.message);
    }
  }
  console.log('Upload finished! Go check the classytravelcouples.com website.');
}

runPublish();
