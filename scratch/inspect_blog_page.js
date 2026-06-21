const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'website_pages', 'blog_v2.html');
const html = fs.readFileSync(filePath, 'utf8');

const contentIdx = html.indexOf('<div class="entry-content');
if (contentIdx !== -1) {
  console.log('Blog V2 entry content snippet:');
  console.log(html.substring(contentIdx, contentIdx + 2000));
} else {
  console.log('No entry-content div found');
}
