const fs = require('fs');
const path = require('path');

const guidePath = path.join(__dirname, '..', 'website_pages', 'free_guide_v2.html');
const contactPath = path.join(__dirname, '..', 'website_pages', 'contact_v2.html');

if (fs.existsSync(guidePath)) {
  const html = fs.readFileSync(guidePath, 'utf8');
  console.log('free_guide_v2.html contains ctc-wrap:', html.includes('ctc-wrap'));
  // Find style classes
  const match = html.match(/\.([a-z0-9_-]+)\s*\{/gi);
  if (match) {
    console.log('free_guide classes snippet:', match.slice(0, 10));
  }
}

if (fs.existsSync(contactPath)) {
  const html = fs.readFileSync(contactPath, 'utf8');
  console.log('contact_v2.html contains ctc-wrap:', html.includes('ctc-wrap'));
  const match = html.match(/\.([a-z0-9_-]+)\s*\{/gi);
  if (match) {
    console.log('contact classes snippet:', match.slice(0, 10));
  }
}
