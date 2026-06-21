const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'website_pages', 'blog_v2.html');
const html = fs.readFileSync(filePath, 'utf8');

// Find all script tags
const regex = /<script[\s\S]*?<\/script>/gi;
let match;
let idx = 0;
while ((match = regex.exec(html)) !== null) {
  const content = match[0];
  if (content.includes('filter') || content.includes('data-categories') || content.includes('ctc-bc')) {
    console.log(`Script ${idx++}:`);
    console.log(content.substring(0, 1000) + '...\n');
  }
}
