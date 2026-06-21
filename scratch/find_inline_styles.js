async function findStyles() {
  const url = 'https://classytravelcouples.com/faros-villas-serifos/';
  try {
    const res = await fetch(url);
    const html = await res.text();
    
    // Find all inline style blocks
    const styleBlocks = [];
    const regex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
    let match;
    while ((match = regex.exec(html)) !== null) {
      styleBlocks.push(match[1]);
    }
    
    console.log(`Found ${styleBlocks.length} inline style blocks.`);
    
    // Let's search these style blocks for blue color codes or generic text color assignments
    styleBlocks.forEach((block, idx) => {
      // Look for common blue colors like #1e73be, or color rules
      if (block.includes('color:') || block.includes('color :')) {
        console.log(`\n--- Block ${idx} (Length: ${block.length}) ---`);
        // print lines containing "color"
        const lines = block.split('\n');
        lines.forEach(line => {
          if (line.includes('color:') && (line.includes('#') || line.includes('rgb') || line.includes('blue') || line.includes('var('))) {
            console.log('  Line:', line.trim().substring(0, 200));
          }
        });
      }
    });

    // Also look at external stylesheets linked
    const linkRegex = /<link[^>]*rel=["']stylesheet["'][^>]*href=["']([^"']*)["']/gi;
    let linkMatch;
    console.log('\n--- External Stylesheets ---');
    while ((linkMatch = linkRegex.exec(html)) !== null) {
      console.log(' -', linkMatch[1]);
    }
    
  } catch (err) {
    console.error(err.message);
  }
}

findStyles();
