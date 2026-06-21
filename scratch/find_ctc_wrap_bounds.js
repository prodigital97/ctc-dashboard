const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../website_pages/europe_v2.html');
const html = fs.readFileSync(filePath, 'utf8');

// Find style block start before ctc-wrap
const ctcWrapIdx = html.indexOf('<div class="ctc-wrap">');
console.log('ctc-wrap index:', ctcWrapIdx);

// Search backwards for the font links or stylesheet links that start our custom code
const styleTagIdx = html.lastIndexOf('<style>', ctcWrapIdx);
console.log('Last style tag index before ctc-wrap:', styleTagIdx);

const fontLinkIdx = html.lastIndexOf('https://fonts.googleapis.com', ctcWrapIdx);
console.log('Fonts link tag index before ctc-wrap:', fontLinkIdx);

// Let's find where the custom block ends
// Usually the footer starts or there is a closed tag
const footerIdx = html.indexOf('<!-- #colophon -->', ctcWrapIdx) || html.indexOf('</footer>', ctcWrapIdx);
console.log('Footer index:', footerIdx);

if (ctcWrapIdx !== -1 && footerIdx !== -1) {
  const start = Math.min(styleTagIdx, fontLinkIdx !== -1 ? fontLinkIdx - 50 : styleTagIdx);
  console.log('\n--- EXTRACTED CONTENT START ---');
  console.log(html.substring(start, start + 300));
  
  console.log('\n--- EXTRACTED CONTENT END ---');
  console.log(html.substring(footerIdx - 200, footerIdx));
}
