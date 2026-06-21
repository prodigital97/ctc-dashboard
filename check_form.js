const WebSocket = require('ws');

const wsUrl = 'ws://127.0.0.1:9222/devtools/page/B3E5429635CDBE6235F52A8A219CECF9';
const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('Connected to Chrome DevTools Protocol!');

  const script = `(() => {
    // Look for form wrapper
    const form = document.querySelector('form');
    if (form) {
      form.submit();
      return 'Form found and submitted!';
    }
    
    // Check if the submit button is disabled or if there are click handlers
    const btn = document.querySelector('.sc-586bebe6-5') || [...document.querySelectorAll('button')].find(b => b.innerText.includes('Create'));
    if (btn) {
      return 'Button attributes: disabled=' + btn.disabled + ', class=' + btn.className;
    }
    return 'No form or button found';
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
