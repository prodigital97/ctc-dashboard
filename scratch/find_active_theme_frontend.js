const wpUrl = 'https://classytravelcouples.com';

async function checkFrontendTheme() {
  try {
    const res = await fetch(wpUrl);
    if (!res.ok) {
      console.error(`HTTP error fetching homepage: ${res.status}`);
      return;
    }
    const html = await res.text();
    const matches = html.match(/\/wp-content\/themes\/([a-zA-Z0-9_-]+)\//g);
    if (matches) {
      const themes = [...new Set(matches.map(m => m.split('/')[3]))];
      console.log('Themes found in homepage source HTML:', themes);
    } else {
      console.log('No theme references found in homepage HTML.');
    }
  } catch (err) {
    console.error('Error fetching homepage:', err.message);
  }
}

checkFrontendTheme();
