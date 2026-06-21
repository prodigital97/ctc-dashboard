const WebSocket = require('ws');

const wsUrl = 'ws://127.0.0.1:9222/devtools/page/B3E5429635CDBE6235F52A8A219CECF9';
const ws = new WebSocket(wsUrl);

const promptText = 'Extreme wide-angle test prompt, luxury resort, no humans';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

ws.on('open', async () => {
  console.log('Connected to Chrome DevTools Protocol!');

  // Focus and clear input
  const focusPayload = {
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      expression: `(() => {
        const div = document.querySelector('.sc-586bebe6-6');
        if (!div) return false;
        div.focus();
        document.execCommand('selectAll', false, null);
        document.execCommand('delete', false, null);
        return true;
      })()`,
      returnByValue: true
    }
  };
  ws.send(JSON.stringify(focusPayload));
});

ws.on('message', async (data) => {
  const response = JSON.parse(data);
  
  if (response.id === 1) {
    if (response.result.result.value === true) {
      console.log('Focused and cleared input. Starting native typing...');
      
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
        await delay(10);
      }
      
      console.log('Typing complete. Waiting 1 second...');
      await delay(1000);
      
      console.log('Clicking the submit button...');
      ws.send(JSON.stringify({
        id: 2,
        method: 'Runtime.evaluate',
        params: {
          expression: `(() => {
            const btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('arrow_forward'));
            if (!btn) return 'Button not found';
            btn.click();
            return 'Button clicked!';
          })()`,
          returnByValue: true
        }
      }));
    } else {
      console.error('Failed to focus input');
      ws.close();
    }
  } else if (response.id === 2) {
    console.log('Submit result:', response.result.result.value);
    
    // Wait 10 seconds and check if the image has started generating
    console.log('Waiting 10 seconds to inspect the DOM...');
    await delay(10000);
    
    ws.send(JSON.stringify({
      id: 3,
      method: 'Runtime.evaluate',
      params: {
        expression: `(() => {
          // Check for any generating/creating/loading text in divs
          const divs = [...document.querySelectorAll('div')].filter(el => {
            const t = el.innerText ? el.innerText.toLowerCase() : '';
            return t.includes('generating') || t.includes('creating') || t.includes('loading');
          }).map(el => el.innerText.substring(0, 100));

          const images = [...document.querySelectorAll('img')].map(img => img.src);
          return JSON.stringify({ divs, images });
        })()`,
        returnByValue: true
      }
    }));
  } else if (response.id === 3) {
    console.log('Page state after 10s:');
    console.log(JSON.parse(response.result.result.value));
    ws.close();
  }
});

ws.on('error', (err) => {
  console.error('WebSocket Error:', err);
});
