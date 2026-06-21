const WebSocket = require('ws');

const wsUrl = 'ws://127.0.0.1:9222/devtools/page/B3E5429635CDBE6235F52A8A219CECF9';
const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('Connected to Chrome DevTools Protocol!');

  // Check the DOM structure of generated images
  const script = `(() => {
    const images = [...document.querySelectorAll('img')].map(img => ({
      src: img.src,
      className: img.className,
      alt: img.alt
    }));

    const cards = [...document.querySelectorAll('[class*="card"], [class*="media"]')].map(el => ({
      tagName: el.tagName,
      className: el.className,
      text: el.innerText ? el.innerText.substring(0, 100) : ''
    }));

    return JSON.stringify({ images, cards: cards.slice(0, 10) });
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
      console.log(JSON.parse(response.result.result.value));
    } else {
      console.log(response);
    }
    ws.close();
  }
});
