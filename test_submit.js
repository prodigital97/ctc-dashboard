const WebSocket = require('ws');

const wsUrl = 'ws://127.0.0.1:9222/devtools/page/B3E5429635CDBE6235F52A8A219CECF9';
const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('Connected to Chrome DevTools Protocol!');

  const script = `(() => {
    // Find the button containing "arrow_forward" or class "sc-586bebe6-5"
    const btn = document.querySelector('.sc-586bebe6-5') || [...document.querySelectorAll('button')].find(b => b.innerText.includes('arrow_forward'));
    if (!btn) return 'Submit button not found';
    
    btn.click();
    return 'Clicked successfully!';
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
