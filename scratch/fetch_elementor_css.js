async function fetchElementorCss() {
  const url = 'https://classytravelcouples.com/wp-content/uploads/elementor/css/post-5.css';
  try {
    const res = await fetch(url);
    if (!res.ok) {
      console.error(`HTTP error: ${res.status}`);
      return;
    }
    const css = await res.text();
    
    // Split rules
    const rules = css.split('}');
    console.log('Selectors in post-5.css:');
    rules.forEach(rule => {
      if (rule.trim()) {
        const parts = rule.split('{');
        const selector = parts[0].trim();
        const body = parts[1] ? parts[1].trim() : '';
        if (selector.includes('body') || selector.includes('h1') || selector.includes('h2') || selector.includes('h3') || selector.includes('p') || selector.includes('a')) {
          console.log(` - Selector: ${selector} -> Rules: ${body.substring(0, 150)}`);
        }
      }
    });
  } catch (err) {
    console.error(err.message);
  }
}

fetchElementorCss();
