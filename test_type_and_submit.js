const WebSocket = require('ws');

const wsUrl = 'ws://127.0.0.1:9222/devtools/page/B3E5429635CDBE6235F52A8A219CECF9';
const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('Connected to Chrome DevTools Protocol!');

  const script = `(() => {
    const div = document.querySelector('.sc-586bebe6-6');
    if (!div) return 'DIV not found';
    
    div.focus();
    // Select all text to overwrite if there is any
    document.execCommand('selectAll', false, null);
    // Insert text like a real user typing
    document.execCommand('insertText', false, 'Extreme wide-angle aerial view of a pristine beach, drone photography, no humans');
    
    // Find the submit button
    const btn = document.querySelector('.sc-586bebe6-5') || [...document.querySelectorAll('button')].find(b => b.innerText.includes('arrow_forward'));
    if (!btn) return 'Submit button not found';
    
    // Click the submit button after a short delay
    setTimeout(() => {
      btn.click();
    }, 500);
    
    return 'Typed and clicked submit!';
  })()`;

  const payload = {
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      expression: script,
      returnByValue: true
    }
  };

  ws.send(JSON.stringify(payload));
});

ws.on('message', (data) => {
  const response = JSON.parse(data);
  if (response.id === 1) {
    console.log('Result:', response.result.result.value);
    ws.close();
  }
});
