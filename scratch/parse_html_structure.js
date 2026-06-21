async function parseStructure() {
  const url = 'https://classytravelcouples.com/faros-villas-serifos/';
  try {
    const res = await fetch(url);
    const html = await res.text();
    
    // Find body tag
    const bodyMatch = html.match(/<body[^>]*class="([^"]*)"/i);
    console.log('--- Body Classes ---');
    console.log(bodyMatch ? bodyMatch[1] : 'Body not found or no class');
    
    // Find page wrappers and their hierarchy
    console.log('\n--- Theme hierarchy tags containing #ctc-post ---');
    const ctcIndex = html.indexOf('id="ctc-post"');
    if (ctcIndex !== -1) {
      console.log('Found id="ctc-post" at index:', ctcIndex);
      
      // Let's print out the 500 characters BEFORE id="ctc-post"
      const before = html.substring(Math.max(0, ctcIndex - 1000), ctcIndex);
      console.log('\nHTML BEFORE #ctc-post:\n', before);
      
      // Let's print out the 500 characters AFTER id="ctc-post"
      const after = html.substring(ctcIndex, ctcIndex + 1500);
      console.log('\nHTML AFTER #ctc-post:\n', after);
    } else {
      console.log('Could not find id="ctc-post"');
    }
  } catch (err) {
    console.error(err.message);
  }
}

parseStructure();
