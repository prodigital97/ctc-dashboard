const fs = require('fs');
const html = fs.readFileSync('scratch/live_europe.html', 'utf8');

let pos = 0;
while (true) {
  const startIdx = html.indexOf('<script', pos);
  if (startIdx === -1) break;
  const endIdx = html.indexOf('</script>', startIdx);
  if (endIdx === -1) break;
  
  const scriptContent = html.substring(startIdx, endIdx + 9);
  if (scriptContent.includes('fetch(apiBase')) {
    console.log('--- FOUND BLOG LOADING SCRIPT ---');
    console.log(scriptContent);
  }
  pos = endIdx + 9;
}
