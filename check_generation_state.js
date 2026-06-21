const WebSocket = require('ws');

const wsUrl = 'ws://127.0.0.1:9222/devtools/page/B3E5429635CDBE6235F52A8A219CECF9';
const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  const script = `(() => {
    const images = [...document.querySelectorAll('img')].map(img => img.src);
    const divs = [...document.querySelectorAll('div')].filter(el => {
      const text = el.innerText ? el.innerText.toLowerCase() : '';
      return text.includes('generating') || text.includes('loading') || text.includes('creating');
    }).map(el => el.innerText.substring(0, 100));

    // Also look for cards
    const cards = [...document.querySelectorAll('[class*="card"], [class*="asset"]')].map(el => el.innerText.substring(0, 100));

    return JSON.stringify({ images, divs: divs.slice(0, 5), cards: cards.slice(0, 5) });
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
