const WebSocket = require('ws');

const wsUrl = 'ws://127.0.0.1:9222/devtools/page/B3E5429635CDBE6235F52A8A219CECF9';
const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('Connected to Chrome DevTools Protocol!');

  // Scan document elements using Runtime.evaluate
  const script = `(() => {
    const inputs = [...document.querySelectorAll('input, textarea, [contenteditable="true"]')].map(el => ({
      tagName: el.tagName,
      id: el.id,
      className: el.className,
      placeholder: el.placeholder || el.getAttribute('placeholder'),
      value: el.value,
      ariaLabel: el.getAttribute('aria-label')
    }));

    const buttons = [...document.querySelectorAll('button, [role="button"]')].map(el => ({
      tagName: el.tagName,
      id: el.id,
      className: el.className,
      text: el.innerText.trim(),
      ariaLabel: el.getAttribute('aria-label')
    }));

    return JSON.stringify({ inputs, buttons });
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
    if (response.result && response.result.result && response.result.result.value) {
      const info = JSON.parse(response.result.result.value);
      console.log('--- Inputs ---');
      console.log(info.inputs);
      console.log('--- Buttons ---');
      console.log(info.buttons);
    } else {
      console.error('Error or no result:', response);
    }
    ws.close();
  }
});

ws.on('error', (err) => {
  console.error('WebSocket Error:', err);
});
