const fs = require('fs');
const path = require('path');

function extractMenu() {
  const filePath = path.join(__dirname, '..', 'website_pages', 'home_v2.html');
  if (!fs.existsSync(filePath)) {
    console.error('home_v2.html not found!');
    return;
  }
  
  const html = fs.readFileSync(filePath, 'utf8');
  
  // Search for typical navigation tags
  // Look for `<ul id="menu-...` or `<nav` blocks or list items containing menu links
  console.log('--- Search for menu links ---');
  const liRegex = /<li[^>]*class="[^"]*menu-item[^"]*"[^>]*>([\s\S]*?)<\/li>/gi;
  let match;
  const items = [];
  while ((match = liRegex.exec(html)) !== null) {
    const content = match[1].replace(/<[^>]*>/g, ' ').trim().replace(/\s+/g, ' ');
    const hrefMatch = match[1].match(/href="([^"]*)"/i);
    const href = hrefMatch ? hrefMatch[1] : '';
    items.push({ text: content, href });
  }
  
  // Clean duplicates and print
  const uniqueItems = [];
  const seen = new Set();
  items.forEach(item => {
    const key = `${item.text.trim()}|${item.href.trim()}`;
    if (!seen.has(key)) {
      seen.add(key);
      uniqueItems.push(item);
    }
  });
  
  console.log('Unique Menu Items in home_v2.html:');
  uniqueItems.forEach(item => {
    console.log(` - Text: "${item.text}" | Href: "${item.href}"`);
  });
}

extractMenu();
