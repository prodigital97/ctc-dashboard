const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '..', 'website_pages', 'home_v2.html');
const html = fs.readFileSync(htmlPath, 'utf8');

const startTag = '<ul id="ast-hf-menu-1"';
const startIdx = html.indexOf(startTag);
if (startIdx === -1) {
  console.log('Could not find start of menu.');
} else {
  const endIdx = html.indexOf('</nav>', startIdx);
  if (endIdx === -1) {
    console.log('Could not find end of menu.');
  } else {
    console.log(html.substring(startIdx, endIdx));
  }
}
