const fs = require('fs');

async function run() {
  try {
    const res = await fetch('https://classytravelcouples.com/europe/?nocache=1');
    const html = await res.text();
    console.log('Total HTML size:', html.length);
    
    // Let's write the entire HTML output to a file so we can view it
    fs.writeFileSync('scratch/live_europe.html', html);
    console.log('Saved to scratch/live_europe.html');
    
    // Find where classytravelcouples.com main content wrapper is
    const entryContentIdx = html.indexOf('class="entry-content');
    if (entryContentIdx !== -1) {
      console.log('Entry content starts at:', entryContentIdx);
      console.log(html.substring(entryContentIdx, entryContentIdx + 2000));
    } else {
      console.log('entry-content class not found in live HTML.');
    }
  } catch (e) {
    console.error(e);
  }
}

run();
