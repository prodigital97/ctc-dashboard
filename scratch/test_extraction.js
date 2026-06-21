const fs = require('fs');
const path = require('path');

const files = [
  { name: 'Europe', file: 'europe_v2.html' },
  { name: 'Asia', file: 'asia_v2.html' },
  { name: 'Africa', file: 'africa_v2.html' },
  { name: 'Middle East', file: 'middle_east_v2.html' },
  { name: 'Indian Ocean', file: 'indian_ocean_v2.html' },
  { name: 'Americas', file: 'americas_v2.html' }
];

const dir = path.join(__dirname, '../website_pages');

files.forEach(f => {
  const filePath = path.join(dir, f.file);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${f.file}`);
    return;
  }
  const html = fs.readFileSync(filePath, 'utf8');
  
  // Find start of font link
  const startIdx = html.indexOf('<link href="https://fonts.googleapis.com');
  if (startIdx === -1) {
    console.log(`❌ Fonts link not found in ${f.file}`);
    return;
  }
  
  // Find footer start
  const footerIdx = html.indexOf('<footer');
  if (footerIdx === -1) {
    console.log(`❌ Footer not found in ${f.file}`);
    return;
  }
  
  // Search backward from footerIdx for the last </div> before the footer
  let endIdx = html.lastIndexOf('</div>', footerIdx);
  if (endIdx === -1) {
    console.log(`❌ Closing div not found in ${f.file}`);
    return;
  }
  
  // Include the closing div itself
  endIdx += 6; 
  
  const extracted = html.substring(startIdx, endIdx);
  console.log(`\n=== Extracted ${f.name} ===`);
  console.log('Size:', extracted.length);
  console.log('Start snippet:', extracted.substring(0, 150));
  console.log('End snippet:', extracted.substring(extracted.length - 150));
});
