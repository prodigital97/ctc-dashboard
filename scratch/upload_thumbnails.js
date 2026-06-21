const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const auth = 'Basic ' + Buffer.from(process.env.WP_USERNAME + ':' + process.env.WP_APPLICATION_PASSWORD).toString('base64');
const WP = 'https://classytravelcouples.com/wp-json/wp/v2';
const THUMB_DIR = path.join(__dirname, '../blog_thumbnails');

// Convert filename to a search-friendly slug
function fileToSlug(filename) {
  return filename
    .replace(/\.[^.]+$/, '') // remove extension
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with dash
    .replace(/^-+|-+$/g, ''); // trim dashes
}

// Find closest matching post by comparing slugs
function findBestMatch(fileSlug, posts) {
  // Try exact slug match first
  const exact = posts.find(p => p.slug === fileSlug);
  if (exact) return exact;

  // Try partial match - check if post slug contains key words from filename
  const fileWords = fileSlug.split('-').filter(w => w.length > 3);
  let bestScore = 0;
  let bestPost = null;

  for (const post of posts) {
    const postSlug = post.slug;
    const postTitle = post.title.rendered.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const matches = fileWords.filter(w => postSlug.includes(w) || postTitle.includes(w));
    const score = matches.length / fileWords.length;
    if (score > bestScore) {
      bestScore = score;
      bestPost = post;
    }
  }

  return bestScore >= 0.5 ? bestPost : null;
}

async function uploadThumbnail(imagePath, post) {
  const imageBuffer = fs.readFileSync(imagePath);
  const ext = path.extname(imagePath).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : ext === '.webp' ? 'image/webp' : 'image/jpeg';
  const filename = path.basename(imagePath);

  console.log(`  📤 Uploading image to WordPress Media Library...`);
  const mediaRes = await fetch(`${WP.replace('/wp/v2', '')}/wp/v2/media`, {
    method: 'POST',
    headers: {
      Authorization: auth,
      'Content-Disposition': `attachment; filename="${filename}"`,
      'Content-Type': mimeType
    },
    body: imageBuffer
  });

  const media = await mediaRes.json();
  if (!mediaRes.ok) throw new Error(media.message || 'Media upload failed');
  console.log(`  ✅ Media uploaded! ID: ${media.id}`);

  // Set as featured image on the post
  const updateRes = await fetch(`${WP}/posts/${post.id}`, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ featured_media: media.id })
  });

  if (!updateRes.ok) throw new Error('Failed to set featured image');
  console.log(`  ✅ Set as featured image for: "${post.title.rendered.substring(0, 60)}"`);
  return media.id;
}

async function run() {
  // Get all thumbnail files
  const files = fs.readdirSync(THUMB_DIR).filter(f => /\.(jpg|jpeg|png|webp)$/i.test(f));
  if (files.length === 0) {
    console.log('No image files found in blog_thumbnails/');
    return;
  }
  console.log(`Found ${files.length} thumbnail(s) in blog_thumbnails/\n`);

  // Fetch all WP posts (published + scheduled)
  const [published, scheduled] = await Promise.all([
    fetch(`${WP}/posts?status=publish&per_page=100`, { headers: { Authorization: auth } }).then(r => r.json()),
    fetch(`${WP}/posts?status=future&per_page=100`, { headers: { Authorization: auth } }).then(r => r.json())
  ]);
  const allPosts = [...published, ...scheduled];
  console.log(`Loaded ${allPosts.length} posts from WordPress.\n`);

  for (const file of files) {
    const fileSlug = fileToSlug(file);
    console.log(`🖼️  Processing: "${file}"`);
    console.log(`   Slug: ${fileSlug}`);

    const matchedPost = findBestMatch(fileSlug, allPosts);
    if (!matchedPost) {
      console.log(`   ❌ No matching post found. Skipping.\n`);
      continue;
    }

    console.log(`   ✅ Matched to: "${matchedPost.title.rendered.substring(0, 70)}"`);
    console.log(`   Post ID: ${matchedPost.id} | Status: ${matchedPost.status}`);

    try {
      await uploadThumbnail(path.join(THUMB_DIR, file), matchedPost);
    } catch (err) {
      console.error(`   ❌ Error: ${err.message}`);
    }
    console.log();
  }

  console.log('🎉 All thumbnails processed!');
}

run().catch(console.error);
