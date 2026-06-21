const fs = require('fs');

async function checkBlogPage() {
  const url = 'https://classytravelcouples.com/blog/';
  console.log(`Fetching ${url}...`);
  const res = await fetch(url);
  const html = await res.text();
  fs.writeFileSync('scratch/live_blog_page.html', html);
  console.log('Saved to scratch/live_blog_page.html');

  const hasCtcBw = html.includes('ctc-bw');
  const hasAstra = html.includes('ast-archive-description') || html.includes('astra-logo');
  
  console.log(`Contains ctc-bw (our custom layout): ${hasCtcBw}`);
  console.log(`Contains ast-archive-description / default archive indicators: ${html.includes('ast-row') || html.includes('archive-title')}`);
}

checkBlogPage().catch(console.error);
