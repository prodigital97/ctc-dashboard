const WebSocket = require('ws');

const wsUrl = 'ws://127.0.0.1:9222/devtools/page/B3E5429635CDBE6235F52A8A219CECF9';
const ws = new WebSocket(wsUrl);

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

ws.on('open', async () => {
  console.log('Connected to Chrome DevTools Protocol!');

  // Get the bounding client rect of the submit button
  const getCoordsPayload = {
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      expression: `(() => {
        const btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('arrow_forward'));
        if (!btn) return null;
        const rect = btn.getBoundingClientRect();
        return JSON.stringify({
          x: rect.left + rect.width / 2,
          y: rect.top + rect.height / 2
        });
      })()`,
      returnByValue: true
    }
  };
  ws.send(JSON.stringify(getCoordsPayload));
});

ws.on('message', async (data) => {
  const response = JSON.parse(data);
  
  if (response.id === 1) {
    if (response.result && response.result.result && response.result.result.value) {
      const coords = JSON.parse(response.result.result.value);
      console.log('Button coordinates:', coords);
      
      // Send native mouseMove to the button
      ws.send(JSON.stringify({
        id: 10,
        method: 'Input.dispatchMouseEvent',
        params: {
          type: 'mouseMoved',
          x: coords.x,
          y: coords.y
        }
      }));
      
      await delay(100);
      
      // Send native mousePressed
      ws.send(JSON.stringify({
        id: 11,
        method: 'Input.dispatchMouseEvent',
        params: {
          type: 'mousePressed',
          x: coords.x,
          y: coords.y,
          button: 'left',
          clickCount: 1
        }
      }));
      
      await delay(100);
      
      // Send native mouseReleased
      ws.send(JSON.stringify({
        id: 12,
        method: 'Input.dispatchMouseEvent',
        params: {
          type: 'mouseReleased',
          x: coords.x,
          y: coords.y,
          button: 'left',
          clickCount: 1
        }
      }));
      
      console.log('Dispatched native mouse events!');
    } else {
      console.error('Could not find button coordinates');
    }
    ws.close();
  }
});

ws.on('error', (err) => {
  console.error('WebSocket Error:', err);
});
