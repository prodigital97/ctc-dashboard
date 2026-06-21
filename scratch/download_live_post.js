const fs = require('fs');

async function downloadPostHtml() {
  const url = 'https://classytravelcouples.com/amphoras-rolling-hills-our-couples-guide-to-the-hidden-wine-regions-of-eastern-europe-2/';
  console.log(`Downloading ${url}...`);
  const res = await fetch(url);
  const html = await res.text();
  fs.writeFileSync('scratch/live_post.html', html);
  console.log('Saved to scratch/live_post.html');

  // Search for any occurrence of "santorini" case-insensitive
  const santoriniRefs = [];
  const regex = /santorini/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const start = Math.max(0, match.index - 50);
    const end = Math.min(html.length, match.index + 100);
    santoriniRefs.push(html.substring(start, end).replace(/\n/g, ' '));
  }

  console.log(`Found ${santoriniRefs.length} references to "santorini":`);
  santoriniRefs.forEach((ref, idx) => {
    console.log(`${idx + 1}: ...${ref.trim()}...`);
  });
}

downloadPostHtml().catch(console.error);
