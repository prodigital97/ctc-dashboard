async function run() {
  try {
    const res = await fetch('https://classytravelcouples.com/santorini-couples-guide-2026/?nocache=1');
    console.log('Santorini post status:', res.status);
    console.log('Final URL (after redirects):', res.url);
    const html = await res.text();
    console.log('HTML size:', html.length);
    console.log('Contains body:', html.includes('<body'));
    console.log('Contains header:', html.includes('id="masthead"'));
    console.log('Contains entry-content:', html.includes('entry-content'));
    
    // Snippet of entry content
    const idx = html.indexOf('class="entry-content');
    if (idx !== -1) {
      console.log('Entry content snippet:');
      console.log(html.substring(idx, idx + 1000));
    }
  } catch (e) {
    console.error(e);
  }
}

run();
