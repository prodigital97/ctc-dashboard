const fs = require('fs');
const path = require('path');

const files = [
  'home_v2.html',
  'destinations_v2.html',
  'blog_v2.html',
  'about_v2.html',
  'contact_v2.html',
  'shop_v2.html',
  'free_guide_v2.html',
  'thank_you_v2.html',
  'europe_v2.html',
  'asia_v2.html',
  'africa_v2.html',
  'middle_east_v2.html',
  'indian_ocean_v2.html',
  'americas_v2.html'
];

files.forEach(file => {
  const filePath = path.join(__dirname, '..', 'website_pages', file);
  if (!fs.existsSync(filePath)) {
    console.log(`${file}: NOT FOUND`);
    return;
  }
  const html = fs.readFileSync(filePath, 'utf8');
  
  // Find <div data-elementor-type="wp-page" ... > ... </div>
  const startStr = '<div data-elementor-type="wp-page"';
  const startIdx = html.indexOf(startStr);
  
  if (startIdx === -1) {
    // If not found, look for '<div class="entry-content'
    const entryStart = html.indexOf('<div class="entry-content');
    if (entryStart === -1) {
      console.log(`${file}: No Elementor wrapper or entry-content found.`);
    } else {
      console.log(`${file}: Found entry-content at ${entryStart}`);
    }
  } else {
    // Find the matching closing div for the elementor wrapper
    // Since divs can be nested, we should count nesting
    let openDivs = 1;
    let currentIdx = html.indexOf('>', startIdx) + 1;
    let foundEnd = false;
    
    while (currentIdx < html.length && openDivs > 0) {
      const nextOpen = html.indexOf('<div', currentIdx);
      const nextClose = html.indexOf('</div>', currentIdx);
      
      if (nextClose === -1) {
        break;
      }
      
      if (nextOpen !== -1 && nextOpen < nextClose) {
        openDivs++;
        currentIdx = nextOpen + 4;
      } else {
        openDivs--;
        currentIdx = nextClose + 6;
        if (openDivs === 0) {
          foundEnd = true;
          const extracted = html.substring(startIdx, currentIdx);
          console.log(`${file}: Extracted Elementor content of length ${extracted.length} bytes (starts at ${startIdx}, ends at ${currentIdx})`);
        }
      }
    }
    
    if (!foundEnd) {
      console.log(`${file}: Failed to find matching closing div for Elementor content.`);
    }
  }
});
