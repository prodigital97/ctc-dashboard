async function printContentHtml() {
  const url = 'https://classytravelcouples.com/faros-villas-serifos/';
  try {
    const res = await fetch(url);
    const html = await res.text();
    
    const contentStart = html.indexOf('class="ctc-main-content"');
    if (contentStart !== -1) {
      console.log('--- Post Content HTML ---');
      console.log(html.substring(contentStart, contentStart + 4000));
    } else {
      console.log('Could not find ctc-main-content in HTML');
    }
  } catch (err) {
    console.error(err.message);
  }
}

printContentHtml();
