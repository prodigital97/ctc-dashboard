async function fetchLiveCss() {
  const url = 'https://classytravelcouples.com/wp-content/themes/astra-child-ctc/style.css?ver=6.9.4';
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`HTTP error: ${res.status}`);
      return;
    }
    const css = await res.text();
    console.log('CSS Length on Live Site:', css.length);
    console.log('Contains ".single-post #page"?', css.includes('.single-post #page'));
    console.log('Contains ".single-post .site-content .ast-container"?', css.includes('.single-post .site-content .ast-container'));
    
    // Print the first few lines of our container overrides
    const index = css.indexOf('Force single post containers to span the full screen width');
    if (index !== -1) {
      console.log('\n--- Found styles in live CSS ---');
      console.log(css.substring(index, index + 500));
    } else {
      console.log('\nCould not find container overrides in live CSS!');
    }
  } catch (err) {
    console.error(err.message);
  }
}

fetchLiveCss();
