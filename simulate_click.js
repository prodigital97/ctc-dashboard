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
    document.execCommand('insertText', false, 'Extreme wide-angle test of a luxury resort island, drone photography, no humans');
    
    // Dispatch input event to trigger React state updates
    div.dispatchEvent(new Event('input', { bubbles: true }));
    
    // Find the actual button with text containing "Create" or class cJBRhk
    const btn = document.querySelector('.cJBRhk') || [...document.querySelectorAll('button')].find(b => b.innerText.includes('Create'));
    if (!btn) return 'Submit button not found';
    
    // Dispatch full mouse click sequence to simulate user click
    btn.dispatchEvent(new MouseEvent('mousedown', { bubbles: true }));
    btn.dispatchEvent(new MouseEvent('mouseup', { bubbles: true }));
    btn.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    
    return 'Dispatched full mouse click sequence!';
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
