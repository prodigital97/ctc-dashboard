const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'confirm_err.html');
if (!fs.existsSync(filePath)) {
  console.error('confirm_err.html not found!');
  process.exit(1);
}

const html = fs.readFileSync(filePath, 'utf8');

console.log('Searching for messages in confirm_err.html...');
const pRegex = /<p[^>]*>([\s\S]*?)<\/p>/gi;
const matches = html.match(pRegex) || [];
console.log(`Found ${matches.length} paragraphs:`);
matches.forEach(m => {
  const text = m.replace(/<[^>]*>/g, '').trim();
  if (text.includes('theme') || text.includes('update') || text.includes('install') || text.includes('fail') || text.includes('success') || text.includes('active')) {
    console.log(' -', text);
  }
});

// Print the main content div or update-php logs if they exist
const updateInfoRegex = /<div class="wrap">([\s\S]*?)<\/div>/i;
const wrapMatch = html.match(updateInfoRegex);
if (wrapMatch) {
  console.log('\n--- Update Wrap Content ---');
  console.log(wrapMatch[1].replace(/<[^>]*>/g, '\n').split('\n').map(l => l.trim()).filter(Boolean).slice(0, 30).join('\n'));
} else {
  console.log('No wrap div found.');
}
