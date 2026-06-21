const fs = require('fs');
const html = fs.readFileSync('scratch/live_europe.html', 'utf8');

const entryContentIdx = html.indexOf('class="entry-content');
if (entryContentIdx !== -1) {
  const content = html.substring(entryContentIdx, entryContentIdx + 8000);
  console.log('--- entry-content snippet ---');
  console.log(content);
} else {
  console.log('entry-content not found');
}
