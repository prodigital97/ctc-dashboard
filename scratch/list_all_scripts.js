const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'website_pages', 'blog_v2.html');
const html = fs.readFileSync(filePath, 'utf8');

const regex = /<script[\s\S]*?<\/script>/gi;
let match;
let count = 0;
while ((match = regex.exec(html)) !== null) {
  count++;
  const content = match[0];
  const snippet = content.replace(/<[^>]*>/g, '').trim().substring(0, 100);
  console.log(`Script ${count}: Src="${(content.match(/src="([^"]*)"/) || [])[1] || 'inline'}" | Snippet: ${snippet.replace(/\s+/g, ' ')}`);
}
