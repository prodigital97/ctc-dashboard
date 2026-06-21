const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'website_pages', 'blog_v2.html');
const html = fs.readFileSync(filePath, 'utf8');

const regex = /<script[\s\S]*?<\/script>/gi;
let match;
while ((match = regex.exec(html)) !== null) {
  const content = match[0];
  if (content.toLowerCase().includes('filter') && !content.includes('elementorFrontendConfig')) {
    console.log('=== Found script with filter ===');
    console.log(content.substring(0, 1000) + '...\n');
  }
}
