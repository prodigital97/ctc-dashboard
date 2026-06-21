const fs = require('fs');
const path = require('path');

const PAGES = {
  home: 'https://classytravelcouples.com/',
  destinations: 'https://classytravelcouples.com/destinations/',
  blog: 'https://classytravelcouples.com/blog/',
  shop: 'https://classytravelcouples.com/our-shop/',
  free_guide: 'https://classytravelcouples.com/free-guide/',
  about: 'https://classytravelcouples.com/about/',
  contact: 'https://classytravelcouples.com/contact/',
  sample_blog_santorini: 'https://classytravelcouples.com/santorini-couples-guide-2026/'
};

const outputDir = path.join(__dirname, 'website_pages');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function downloadPage(name, url) {
  console.log(`Fetching ${name} from ${url}...`);
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    const filePath = path.join(outputDir, `${name}.html`);
    fs.writeFileSync(filePath, html, 'utf8');
    console.log(`Saved ${name}.html successfully.`);
  } catch (error) {
    console.error(`Failed to download ${name}:`, error.message);
  }
}

async function run() {
  for (const [name, url] of Object.entries(PAGES)) {
    await downloadPage(name, url);
    // Be nice to the server, wait 1 second between requests
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  console.log('All downloads completed!');
}

run();
