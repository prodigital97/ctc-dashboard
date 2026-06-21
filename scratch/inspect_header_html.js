async function run() {
  const url = 'https://classytravelcouples.com/?nocache=1';
  try {
    const res = await fetch(url);
    const html = await res.text();
    
    const startIdx = html.indexOf('class="main-header-menu');
    if (startIdx === -1) {
      console.log('main-header-menu class not found in HTML!');
      return;
    }
    
    // Print 5000 characters from the start of the menu
    console.log('=== Header Menu HTML ===');
    console.log(html.substring(startIdx - 100, startIdx + 8000));
  } catch (e) {
    console.error(e);
  }
}

run();
