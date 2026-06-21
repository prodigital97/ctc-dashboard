const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'website_pages', 'blog_v2.html');
const html = fs.readFileSync(filePath, 'utf8');

const startIdx = html.indexOf('<div data-elementor-type="wp-page"');
const endIdx = html.indexOf('</div>\n</div>\n\n\t\t\t</div>', startIdx); // just approximate end

if (startIdx !== -1) {
  const elementorContent = html.substring(startIdx, endIdx === -1 ? html.length : endIdx);
  const regex = /<script[\s\S]*?<\/script>/gi;
  let match;
  console.log('Searching for scripts inside Elementor content...');
  while ((match = regex.exec(elementorContent)) !== null) {
    console.log('Found script in Elementor content:');
    console.log(match[0]);
  }
}
