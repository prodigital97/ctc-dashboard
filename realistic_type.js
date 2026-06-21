const WebSocket = require('ws');

const wsUrl = 'ws://127.0.0.1:9222/devtools/page/B3E5429635CDBE6235F52A8A219CECF9';
const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('Connected to Chrome DevTools Protocol!');

  const script = `(() => {
    const div = document.querySelector('.sc-586bebe6-6');
    if (!div) return 'DIV not found';
    
    div.focus();
    document.execCommand('selectAll', false, null);
    
    // Type character by character to trigger all keyup/keydown events
    const text = 'Extreme wide-angle test prompt, luxury resort, no humans';
    for (let char of text) {
      const downEvent = new KeyboardEvent('keydown', { key: char, char: char, bubbles: true });
      div.dispatchEvent(downEvent);
      
      document.execCommand('insertText', false, char);
      
      const upEvent = new KeyboardEvent('keyup', { key: char, char: char, bubbles: true });
      div.dispatchEvent(upEvent);
    }
    
    // Find the submit button
    const btn = document.querySelector('.cJBRhk') || [...document.querySelectorAll('button')].find(b => b.innerText.includes('Create'));
    if (!btn) return 'Submit button not found';
    
    // Wait slightly and click
    setTimeout(() => {
      btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
      btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
      btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    }, 500);
    
    return 'Simulated realistic typing and click!';
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
