async function fetchPostHtml() {
  const url = 'https://classytravelcouples.com/faros-villas-serifos/';
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`HTTP error: ${res.status}`);
      return;
    }
    const html = await res.text();
    console.log('HTML Length:', html.length);
    console.log('Contains "#ctc-post"?', html.includes('ctc-post'));
    console.log('Contains "ctc-hero"?', html.includes('ctc-hero'));
    console.log('Contains "content-wrapper"?', html.includes('content-wrapper'));
    
    // Find some lines around themes or custom stylesheets
    const lines = html.split('\n');
    console.log('Theme stylesheets references:');
    lines.forEach(line => {
      if (line.includes('wp-content/themes')) {
        console.log(' -', line.trim().substring(0, 150));
      }
    });
  } catch (err) {
    console.error(err.message);
  }
}

fetchPostHtml();
