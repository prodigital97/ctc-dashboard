const fs = require('fs');
const path = require('path');

const brainDir = 'C:\\Users\\91976\\.gemini\\antigravity\\brain';

function searchTranscripts(dir) {
  if (!fs.existsSync(dir)) return;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      searchTranscripts(fullPath);
    } else if (file === 'transcript.jsonl') {
      try {
        const content = fs.readFileSync(fullPath, 'utf8');
        const regex = /AIzaSy[A-Za-z0-9_-]{33,40}/g;
        let match;
        while ((match = regex.exec(content)) !== null) {
          const key = match[0];
          if (!key.includes('your_real') && !key.includes('placeholder') && !key.includes('your_gemini')) {
            console.log(`FOUND KEY in ${fullPath}: ${key}`);
          }
        }
      } catch (err) {
        // ignore errors
      }
    }
  }
}

searchTranscripts(brainDir);
console.log('Search complete.');
