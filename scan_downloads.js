const WebSocket = require('ws');

const wsUrl = 'ws://127.0.0.1:9222/devtools/page/B3E5429635CDBE6235F52A8A219CECF9';
const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('Connected to Chrome DevTools Protocol!');

  const script = `(() => {
    // Scan all buttons/links to see if any have "download" in class, text, id, or attributes
    const elements = [...document.querySelectorAll('button, a, div, span, i')].filter(el => {
      const text = el.innerText ? el.innerText.toLowerCase() : '';
      const html = el.innerHTML ? el.innerHTML.toLowerCase() : '';
      const className = el.className ? String(el.className).toLowerCase() : '';
      return text.includes('download') || html.includes('download') || className.includes('download');
    }).map(el => ({
      tagName: el.tagName,
      className: el.className,
      text: el.innerText ? el.innerText.substring(0, 100) : ''
    }));

    return JSON.stringify(elements);
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
