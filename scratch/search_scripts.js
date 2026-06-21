const fs = require('fs');

const html = fs.readFileSync('scratch/live_post.html', 'utf8');

const regex = /<script\b[^>]*>([\s\S]*?)<\/script>/gi;
let match;
let count = 0;
while ((match = regex.exec(html)) !== null) {
  const scriptContent = match[1].trim();
  const scriptTag = match[0].substring(0, match[0].indexOf('>') + 1);
  if (scriptContent.includes('location') || scriptContent.includes('redirect') || scriptContent.includes('href') || scriptContent.includes('replace')) {
    count++;
    console.log(`\n--- Script tag: ${scriptTag} ---`);
    console.log(scriptContent.substring(0, 500));
    if (scriptContent.length > 500) console.log('... [truncated]');
  }
}
console.log(`\nFound ${count} scripts containing redirect keywords.`);
