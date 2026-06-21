const fs = require('fs');

const html = fs.readFileSync('scratch/live_post.html', 'utf8');

// Title tag
const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
console.log('Page <title>:', titleMatch ? titleMatch[1].trim() : 'NONE');

// H1 tag
const h1Match = html.match(/<h1\b[^>]*>([\s\S]*?)<\/h1>/i);
console.log('Page <h1>:', h1Match ? h1Match[1].trim() : 'NONE');

// Let's check some text snippets from the post body to see what it contains
console.log('\nLooking for Amphoras or Santorini in body text:');
console.log('Contains "Amphoras":', html.includes('Amphoras'));
console.log('Contains "wine regions":', html.toLowerCase().includes('wine regions'));
console.log('Contains "Tuscany":', html.includes('Tuscany'));
console.log('Contains "Santorini":', html.includes('Santorini'));

// Let's print the main content area (e.g. #ctc-post or similar wrapper)
const ctcPostStart = html.indexOf('id="ctc-post"');
if (ctcPostStart > -1) {
  console.log('\nFound #ctc-post. Extracting first 1000 characters of its content:');
  console.log(html.substring(ctcPostStart, ctcPostStart + 1000));
} else {
  console.log('\nNo #ctc-post found in the HTML!');
}
