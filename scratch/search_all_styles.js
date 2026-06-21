async function searchAllStyles() {
  const url = 'https://classytravelcouples.com/faros-villas-serifos/';
  try {
    const res = await fetch(url);
    const html = await res.text();
    
    // Extract stylesheet links
    const linkRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']*)["']/gi;
    const stylesheets = [];
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      stylesheets.push(match[1]);
    }
    
    // Fetch and check all stylesheets
    console.log('--- Checking external stylesheets for color declarations ---');
    for (const sheetUrl of stylesheets) {
      // only check local/theme/plugins ones to save time and avoid external CDNs
      if (!sheetUrl.includes('classytravelcouples.com')) continue;
      
      try {
        const sheetRes = await fetch(sheetUrl);
        const css = await sheetRes.text();
        
        // Find selectors containing color:
        // We look for color rules on headings, p, a
        const rules = css.split('}');
        rules.forEach(rule => {
          if (rule.includes('color:') || rule.includes('color :')) {
            const parts = rule.split('{');
            const selector = parts[0].trim();
            const body = parts[1] ? parts[1].trim() : '';
            if (selector.includes('p') || selector.includes('h1') || selector.includes('h2') || selector.includes('h3') || selector.includes('a') || selector.includes('body')) {
              // check if color value is blue-ish or variable
              if (body.includes('#') || body.includes('var(') || body.includes('blue') || body.includes('rgb')) {
                console.log(`[${sheetUrl.split('/').pop().split('?')[0]}] Selector: ${selector} -> Rules: ${body.substring(0, 120)}`);
              }
            }
          }
        });
      } catch (e) {
        console.error(`Failed to fetch stylesheet ${sheetUrl}:`, e.message);
      }
    }
    
  } catch (err) {
    console.error(err.message);
  }
}

searchAllStyles();
