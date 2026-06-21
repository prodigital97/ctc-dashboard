const fs = require('fs');

function inspectError() {
  if (fs.existsSync('upload_err.html')) {
    const html = fs.readFileSync('upload_err.html', 'utf8');
    
    // Look for error message divs or status blocks
    const match = html.match(/<div class="wrap">([\s\S]*?)<\/div>/i) || html.match(/<p>([\s\S]*?)<\/p>/i);
    if (match) {
      console.log('Error snippet:', match[1].replace(/<[^>]*>/g, '').trim().substring(0, 1000));
    } else {
      console.log('No wrap or p match. Searching for word "theme" or "error":');
      const lines = html.split('\n');
      lines.forEach((line, idx) => {
        if (line.includes('error') || line.includes('theme') || line.includes('failed') || line.includes('exist')) {
          console.log(`Line ${idx}: ${line.trim().substring(0, 150)}`);
        }
      });
    }
  } else {
    console.log('upload_err.html does not exist.');
  }
}

inspectError();
