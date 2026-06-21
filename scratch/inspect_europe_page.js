const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'website_pages', 'europe_v2.html');
const html = fs.readFileSync(filePath, 'utf8');

// Find title
const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
console.log('Title:', titleMatch ? titleMatch[1] : 'Not found');

// Print index-content snippet
const contentIdx = html.indexOf('<div class="entry-content');
if (contentIdx !== -1) {
  console.log('Entry content snippet:');
  console.log(html.substring(contentIdx, contentIdx + 1500));
} else {
  console.log('No entry-content div found');
}
