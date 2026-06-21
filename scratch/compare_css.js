const fs = require('fs');
const path = require('path');

async function run() {
  const localCssPath = path.join(__dirname, '../astra-child-ctc/style.css');
  const localCss = fs.readFileSync(localCssPath, 'utf8');

  const liveCssUrl = 'https://classytravelcouples.com/wp-content/themes/astra-child-ctc/style.css?ver=' + Date.now();
  console.log('Fetching live CSS from:', liveCssUrl);
  
  try {
    const res = await fetch(liveCssUrl);
    const liveCss = await res.text();
    
    console.log('Local CSS size:', localCss.length);
    console.log('Live CSS size:', liveCss.length);
    
    if (localCss.trim() === liveCss.trim()) {
      console.log('SUCCESS: Local and live style.css are identical!');
    } else {
      console.log('WARNING: Local and live style.css are DIFFERENT!');
      // Find first difference
      let diffIndex = -1;
      const minLength = Math.min(localCss.length, liveCss.length);
      for (let i = 0; i < minLength; i++) {
        if (localCss[i] !== liveCss[i]) {
          diffIndex = i;
          break;
        }
      }
      if (diffIndex !== -1) {
        console.log('First diff at char index:', diffIndex);
        console.log('Local surrounding:', JSON.stringify(localCss.substring(Math.max(0, diffIndex - 50), diffIndex + 50)));
        console.log('Live surrounding:', JSON.stringify(liveCss.substring(Math.max(0, diffIndex - 50), diffIndex + 50)));
      }
    }
  } catch (e) {
    console.error('Error fetching live CSS:', e.message);
  }
}

run();
