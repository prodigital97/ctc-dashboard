const fs = require('fs');

async function run() {
  const url = 'https://classytravelcouples.com/luxury-destination-wedding-honeymoon-packages-the-ultimate-couples-blueprint-2/?nocache=1';
  try {
    const res = await fetch(url);
    const html = await res.text();
    console.log('Fetched HTML size:', html.length);
    
    // Find ctc-post in HTML
    const ctcPostIdx = html.indexOf('id="ctc-post"');
    if (ctcPostIdx === -1) {
      console.log('ctc-post not found!');
      return;
    }
    
    // Let's print the 1500 characters before ctc-post to see parent tags
    console.log('--- Parent Elements ---');
    console.log(html.substring(ctcPostIdx - 1500, ctcPostIdx + 100));

    console.log('--- Stylesheet Links ---');
    const links = [];
    const linkRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']+)["'][^>]*>/gi;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      links.push(match[1]);
    }
    console.log(links.filter(l => l.includes('theme') || l.includes('custom') || l.includes('elementor')));
  } catch (e) {
    console.error(e);
  }
}

run();
