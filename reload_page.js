const WebSocket = require('ws');

const wsUrl = 'ws://127.0.0.1:9222/devtools/page/B3E5429635CDBE6235F52A8A219CECF9';
const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('Connected to Chrome DevTools Protocol!');
  ws.send(JSON.stringify({
    id: 1,
    method: 'Page.reload'
  }));
});

ws.on('message', (data) => {
  console.log('Page reload event triggered!');
  ws.close();
});

ws.on('error', (err) => {
  console.error('WebSocket Error:', err);
});
