const fs = require('fs');
const path = require('path');

async function run() {
  try {
    // 1. Read child theme style.css
    const childCss = fs.readFileSync(path.join(__dirname, '../astra-child-ctc/style.css'), 'utf8');
    console.log('=== Child style.css width/max-width references ===');
    const childMatches = childCss.match(/[^\n]*width[^\n]*/gi) || [];
    childMatches.forEach(line => {
      if (line.includes('site-content') || line.includes('ast-container') || line.includes('#content') || line.includes('#primary')) {
        console.log(' ', line.trim());
      }
    });

    // 2. Fetch the parent Astra stylesheet to find its layout rules
    const astraCssUrl = 'https://classytravelcouples.com/wp-content/themes/astra/assets/css/minified/style.min.css';
    console.log('\n=== Fetching Parent Astra CSS... ===');
    const res = await fetch(astraCssUrl);
    if (!res.ok) {
      console.log('Failed to fetch parent Astra CSS:', res.statusText);
      return;
    }
    const astraCss = await res.text();
    console.log('Parent CSS loaded, size:', astraCss.length);
    
    // Look for selectors matching ast-separate-container or ast-narrow-container with max-width or width
    const regex = /[^{}]*max-width:[^;}]*/gi;
    let match;
    const parentMatches = [];
    while ((match = regex.exec(astraCss)) !== null) {
      const line = match[0];
      if (line.includes('site-content') || line.includes('ast-container') || line.includes('ast-separate-container') || line.includes('ast-narrow-container')) {
        parentMatches.push(line.trim());
      }
    }
    console.log(`Found ${parentMatches.length} max-width rules in parent. Printing first 15:`);
    parentMatches.slice(0, 15).forEach(m => console.log(' ', m));

  } catch (e) {
    console.error(e);
  }
}

run();
