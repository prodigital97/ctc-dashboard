const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const wpUrl = (process.env.WP_URL || 'https://classytravelcouples.com').replace(/\/$/, '');
const wpUsername = process.env.WP_USERNAME;
const wpPassword = process.env.WP_APPLICATION_PASSWORD;
const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
const authHeader = `Basic ${base64Auth}`;

async function run() {
  const imageUrl = 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?auto=format&fit=crop&w=1200&h=600&q=80';
  console.log('Downloading image:', imageUrl);
  const imgRes = await fetch(imageUrl);
  if (!imgRes.ok) throw new Error(`Image download failed: ${imgRes.statusText}`);
  const buffer = await imgRes.arrayBuffer();
  
  console.log('Uploading image to media library...');
  const uploadRes = await fetch(`${wpUrl}/wp-json/wp/v2/media`, {
    method: 'POST',
    headers: {
      Authorization: authHeader,
      'Content-Disposition': 'attachment; filename="tokyo-city-break-featured.jpg"',
      'Content-Type': 'image/jpeg'
    },
    body: Buffer.from(buffer)
  });
  
  const media = await uploadRes.json();
  if (!uploadRes.ok) throw new Error(media.message || 'Media upload failed');
  console.log('Media uploaded. ID:', media.id);
  
  console.log('Updating Post ID 666 with featured_media...');
  const postRes = await fetch(`${wpUrl}/wp-json/wp/v2/posts/666`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: authHeader
    },
    body: JSON.stringify({ featured_media: media.id })
  });
  
  const postData = await postRes.json();
  if (!postRes.ok) throw new Error(postData.message || 'Post update failed');
  console.log('Post updated successfully! Link:', postData.link);
}

run().catch(console.error);
