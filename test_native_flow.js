const WebSocket = require('ws');

const wsUrl = 'ws://127.0.0.1:9222/devtools/page/B3E5429635CDBE6235F52A8A219CECF9';
const ws = new WebSocket(wsUrl);

const promptText = "Extreme wide-angle beachfront wedding ceremony setup at Cheval Blanc St-Barth Isle de France on Flamands Beach, St. Barts. A simple driftwood arch decorated with orchids and white roses stands on the white sand at sunset, with a calm turquoise ocean in the background. Canon EOS R5, 24mm lens. Empty of people, no humans.";

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function evaluate(ws, id, expression) {
  return new Promise((resolve, reject) => {
    const callback = (data) => {
      const response = JSON.parse(data);
      if (response.id === id) {
        ws.off('message', callback);
        if (response.result && response.result.result) {
          resolve(response.result.result.value);
        } else {
          reject(new Error(JSON.stringify(response)));
        }
      }
    };
    ws.on('message', callback);
    ws.send(JSON.stringify({
      id,
      method: 'Runtime.evaluate',
      params: { expression, returnByValue: true }
    }));
  });
}

ws.on('open', async () => {
  console.log('Connected to Chrome DevTools Protocol!');

  // Get input box coordinates
  console.log('Querying input coordinates...');
  const inputCoordsStr = await evaluate(ws, 1, `(() => {
    const div = document.querySelector('.sc-586bebe6-6');
    if (!div) return null;
    const rect = div.getBoundingClientRect();
    return JSON.stringify({ x: rect.left + 50, y: rect.top + rect.height / 2 });
  })()`);

  if (!inputCoordsStr) {
    console.error('Input box not found!');
    ws.close();
    return;
  }

  const inputCoords = JSON.parse(inputCoordsStr);
  console.log('Input box coordinates:', inputCoords);

  // Click the input box natively to focus it
  ws.send(JSON.stringify({
    id: 10,
    method: 'Input.dispatchMouseEvent',
    params: { type: 'mouseMoved', x: inputCoords.x, y: inputCoords.y }
  }));
  await delay(100);
  ws.send(JSON.stringify({
    id: 11,
    method: 'Input.dispatchMouseEvent',
    params: { type: 'mousePressed', x: inputCoords.x, y: inputCoords.y, button: 'left', clickCount: 1 }
  }));
  await delay(100);
  ws.send(JSON.stringify({
    id: 12,
    method: 'Input.dispatchMouseEvent',
    params: { type: 'mouseReleased', x: inputCoords.x, y: inputCoords.y, button: 'left', clickCount: 1 }
  }));

  await delay(500);

  // Clear existing text via execCommand
  console.log('Clearing existing input...');
  await evaluate(ws, 2, `(() => {
    document.execCommand('selectAll', false, null);
    document.execCommand('delete', false, null);
    return true;
  })()`);

  await delay(500);

  // Type prompt natively character by character
  console.log('Typing prompt natively...');
  for (let i = 0; i < promptText.length; i++) {
    const char = promptText[i];
    ws.send(JSON.stringify({
      id: 100 + i * 3,
      method: 'Input.dispatchKeyEvent',
      params: { type: 'keyDown', text: char, unmodifiedText: char, key: char }
    }));
    ws.send(JSON.stringify({
      id: 100 + i * 3 + 1,
      method: 'Input.dispatchKeyEvent',
      params: { type: 'keyUp', key: char }
    }));
    await delay(15); // safe typing delay
  }

  console.log('Typing complete. Waiting 1 second...');
  await delay(1000);

  // Get submit button coordinates
  console.log('Querying submit button coordinates...');
  const btnCoordsStr = await evaluate(ws, 3, `(() => {
    const btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('arrow_forward'));
    if (!btn) return null;
    const rect = btn.getBoundingClientRect();
    return JSON.stringify({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
  })()`);

  if (!btnCoordsStr) {
    console.error('Submit button not found!');
    ws.close();
    return;
  }

  const btnCoords = JSON.parse(btnCoordsStr);
  console.log('Submit button coordinates:', btnCoords);

  // Click submit button natively
  ws.send(JSON.stringify({
    id: 20,
    method: 'Input.dispatchMouseEvent',
    params: { type: 'mouseMoved', x: btnCoords.x, y: btnCoords.y }
  }));
  await delay(100);
  ws.send(JSON.stringify({
    id: 21,
    method: 'Input.dispatchMouseEvent',
    params: { type: 'mousePressed', x: btnCoords.x, y: btnCoords.y, button: 'left', clickCount: 1 }
  }));
  await delay(100);
  ws.send(JSON.stringify({
    id: 22,
    method: 'Input.dispatchMouseEvent',
    params: { type: 'mouseReleased', x: btnCoords.x, y: btnCoords.y, button: 'left', clickCount: 1 }
  }));

  console.log('Click dispatched! Closing WebSocket.');
  ws.close();
});

ws.on('error', (err) => {
  console.error('WebSocket Error:', err);
});
