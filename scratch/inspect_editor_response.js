const fs = require('fs');

function inspectEditorResponse() {
  if (fs.existsSync('editor_response.html')) {
    const html = fs.readFileSync('editor_response.html', 'utf8');
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    if (bodyMatch) {
      console.log('Body Text:\n', bodyMatch[1].replace(/<[^>]*>/g, '\n').split('\n').map(l => l.trim()).filter(Boolean).join('\n'));
    } else {
      console.log(html.substring(0, 2000));
    }
  } else {
    console.log('editor_response.html does not exist.');
  }
}

inspectEditorResponse();
