const fs = require('fs');
const path = require('path');

const localPath = path.join(__dirname, '..', 'website_pages', 'europe_v2.html');
const html = fs.readFileSync(localPath, 'utf8');

const startStr = '<style id="wp-custom-css">';
const startIdx = html.indexOf(startStr);
if (startIdx !== -1) {
  const endIdx = html.indexOf('</style>', startIdx);
  const css = html.substring(startIdx + startStr.length, endIdx);
  console.log('Found wp-custom-css! Size:', css.length);
  fs.writeFileSync(path.join(__dirname, 'extracted_custom_css.css'), css);
  console.log('Saved to scratch/extracted_custom_css.css');
  console.log('\nFirst 500 characters of custom CSS:');
  console.log(css.substring(0, 500));
} else {
  console.log('wp-custom-css not found in europe_v2.html!');
}
