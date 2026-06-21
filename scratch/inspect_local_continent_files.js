const fs = require('fs');
const path = require('path');

const files = [
  'europe_v2.html',
  'asia_v2.html',
  'africa_v2.html',
  'middle_east_v2.html',
  'indian_ocean_v2.html',
  'americas_v2.html'
];

const dir = path.join(__dirname, '../website_pages');

files.forEach(file => {
  const filePath = path.join(dir, file);
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${file}`);
    return;
  }
  const html = fs.readFileSync(filePath, 'utf8');
  console.log(`\n=== File: ${file} | Size: ${html.length} ===`);
  
  // Find ctc-wrap or custom container
  const wrapIdx = html.indexOf('ctc-wrap');
  if (wrapIdx !== -1) {
    console.log(`Found "ctc-wrap" at index: ${wrapIdx}`);
    // Print 300 chars around it
    console.log(html.substring(wrapIdx - 100, wrapIdx + 400));
  } else {
    console.log('No "ctc-wrap" found.');
  }
});
