const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'website_pages', 'about_v2.html');
const fileHtml = fs.readFileSync(filePath, 'utf8');

function extractElementorContent(html) {
  const startStr = '<div data-elementor-type="wp-page"';
  const startIdx = html.indexOf(startStr);
  if (startIdx === -1) return null;
  
  let openDivs = 1;
  let currentIdx = html.indexOf('>', startIdx) + 1;
  
  while (currentIdx < html.length && openDivs > 0) {
    const nextOpen = html.indexOf('<div', currentIdx);
    const nextClose = html.indexOf('</div>', currentIdx);
    
    if (nextClose === -1) break;
    
    if (nextOpen !== -1 && nextOpen < nextClose) {
      openDivs++;
      currentIdx = nextOpen + 4;
    } else {
      openDivs--;
      currentIdx = nextClose + 6;
      if (openDivs === 0) {
        return html.substring(startIdx, currentIdx);
      }
    }
  }
  return null;
}

const extracted = extractElementorContent(fileHtml);
console.log('Extracted exists:', !!extracted);
if (extracted) {
  console.log('Extracted length:', extracted.length);
  console.log('Contains ctc-wrap:', extracted.includes('ctc-wrap'));
  console.log('Preview (first 500 chars):');
  console.log(extracted.substring(0, 500));
}
