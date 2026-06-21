const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../website_pages/europe_v2.html'), 'utf8');

const startIdx = html.indexOf('<div class="ctc-wrap">');
console.log('ctc-wrap starts at:', startIdx);

// Let's trace div tags starting from startIdx + 22 to find the matching closing div for ctc-wrap
let openDivs = 1;
let pos = startIdx + 22;

while (openDivs > 0 && pos < html.length) {
  const nextOpen = html.indexOf('<div', pos);
  const nextClose = html.indexOf('</div>', pos);
  
  if (nextClose === -1) {
    console.log('No more closing divs found!');
    break;
  }
  
  if (nextOpen !== -1 && nextOpen < nextClose) {
    openDivs++;
    pos = nextOpen + 4;
  } else {
    openDivs--;
    pos = nextClose + 6;
  }
}

console.log('Matching closing div ends at:', pos);
console.log('Snippet around closing point:');
console.log(html.substring(pos - 150, pos + 150));
