const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'website_pages', 'about_v2.html');
const fileHtml = fs.readFileSync(filePath, 'utf8');

let idx = 0;
while ((idx = fileHtml.indexOf('ctc-wrap', idx)) !== -1) {
  console.log('Found ctc-wrap at index:', idx);
  console.log('Context before and after:');
  console.log(fileHtml.substring(Math.max(0, idx - 100), idx + 200));
  console.log('------------------');
  idx += 8;
}
