async function findBlueSelectors() {
  const url = 'https://classytravelcouples.com/faros-villas-serifos/';
  try {
    const res = await fetch(url);
    const html = await res.text();

    console.log('--- Searching for CSS custom variables in HTML ---');
    const rootMatches = html.match(/:root\s*\{[^}]*\}/gi);
    if (rootMatches) {
      rootMatches.forEach(m => {
        const lines = m.split(';');
        lines.forEach(l => {
          if (l.includes('color') || l.includes('blue')) {
            console.log(' -', l.trim());
          }
        });
      });
    }

    console.log('\n--- Searching for inline styles containing color ---');
    const styleRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let match;
    while ((match = styleRegex.exec(html)) !== null) {
      const block = match[1];
      if (block.includes('color:') || block.includes('color :')) {
        // Print sections of CSS matching typical text selectors
        const cssLines = block.split(/[{}]/);
        for (let i = 0; i < cssLines.length; i++) {
          const selector = cssLines[i].trim();
          const rules = cssLines[i+1] ? cssLines[i+1].trim() : '';
          if (rules.includes('color:') && (selector.includes('body') || selector.includes('p') || selector.includes('h1') || selector.includes('h2') || selector.includes('entry-content') || selector.includes('entry-title'))) {
            console.log(`Selector: ${selector} -> Rules: ${rules.substring(0, 150)}`);
          }
          i++; // skip rules
        }
      }
    }

  } catch (err) {
    console.error(err.message);
  }
}

findBlueSelectors();
