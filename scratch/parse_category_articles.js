const fs = require('fs');

const html = fs.readFileSync('scratch/category_food_culinary.html', 'utf8');

// Let's find all '<article' blocks to see the structure of each post card in the Astra archive.
const regex = /<article\b[^>]*>([\s\S]*?)<\/article>/gi;
let match;
let count = 0;
while ((match = regex.exec(html)) !== null && count < 3) {
  count++;
  console.log(`\n================= ARTICLE ${count} =================`);
  const articleContent = match[1];
  
  // Find all links in this article
  const linkRegex = /<a\s+[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
  let linkMatch;
  console.log('Links in article:');
  while ((linkMatch = linkRegex.exec(articleContent)) !== null) {
    const url = linkMatch[1];
    const text = linkMatch[2].replace(/<[^>]+>/g, '').trim().replace(/\s+/g, ' ');
    console.log(`  - URL: ${url}`);
    console.log(`    Text: "${text}"`);
  }
}
