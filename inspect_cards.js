const WebSocket = require('ws');

const wsUrl = 'ws://127.0.0.1:9222/devtools/page/B3E5429635CDBE6235F52A8A219CECF9';
const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('Connected to Chrome DevTools Protocol!');

  const script = `(() => {
    // Return the innerHTML structure of all elements with class names containing "media" or "card"
    const elements = [...document.querySelectorAll('*')].filter(el => {
      const cls = String(el.className).toLowerCase();
      return cls.includes('media') || cls.includes('card') || cls.includes('asset') || cls.includes('item');
    }).map(el => ({
      tagName: el.tagName,
      className: el.className,
      text: el.innerText ? el.innerText.substring(0, 100) : ''
    }));
    return JSON.stringify(elements.slice(0, 20));
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
