const WebSocket = require('ws');

const wsUrl = 'ws://127.0.0.1:9222/devtools/page/B3E5429635CDBE6235F52A8A219CECF9';
const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('Connected to Chrome DevTools Protocol!');

  const script = `(() => {
    // Return all images with src including 'blob:' or 'googleusercontent'
    return JSON.stringify([...document.querySelectorAll('img')].map(img => ({
      src: img.src,
      parentClass: img.parentElement ? img.parentElement.className : ''
    })));
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
    console.log(JSON.parse(response.result.result.value));
    ws.close();
  }
});
