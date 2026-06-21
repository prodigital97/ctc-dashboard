const fs = require('fs');

const html = fs.readFileSync('editor_response.html', 'utf8');
const startIdx = html.indexOf('<form name="template"');
if (startIdx !== -1) {
  const endIdx = html.indexOf('</form>', startIdx);
  const formHtml = html.substring(startIdx, endIdx + 7);
  console.log('Template Editor Form HTML:');
  console.log(formHtml);
} else {
  console.log('Template form not found!');
}
