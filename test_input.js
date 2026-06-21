const WebSocket = require('ws');

const wsUrl = 'ws://127.0.0.1:9222/devtools/page/B3E5429635CDBE6235F52A8A219CECF9';
const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('Connected to Chrome DevTools Protocol!');

  const script = `(() => {
    const div = document.querySelector('.sc-586bebe6-6');
    if (!div) return 'DIV not found';
    
    div.focus();
    div.innerText = 'Extreme wide-angle test prompt';
    div.dispatchEvent(new Event('input', { bubbles: true }));
    return 'Typed successfully!';
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
