const WebSocket = require('ws');

const wsUrl = 'ws://127.0.0.1:9222/devtools/page/B3E5429635CDBE6235F52A8A219CECF9';
const ws = new WebSocket(wsUrl);

const promptText = 'Extreme wide-angle aerial drone view of a luxury thatched villa at Azura Benguerra Island in the Bazaruto Archipelago, Mozambique. The private infinity pool blends into the pristine white sand beach and the turquoise tidal channels of the ocean. Warm daylight, professional travel photography. Empty of people, no humans.';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

ws.on('open', async () => {
  console.log('Connected to Chrome DevTools Protocol!');

  // 1. Focus the contenteditable element
  const focusPayload = {
    id: 1,
    method: 'Runtime.evaluate',
    params: {
      expression: `(() => {
        const div = document.querySelector('.sc-586bebe6-6');
        if (!div) return false;
        div.focus();
        // Clear existing text
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
      
      // Send characters natively
      for (let i = 0; i < promptText.length; i++) {
        const char = promptText[i];
        
        // keyDown
        ws.send(JSON.stringify({
          id: 100 + i * 3,
          method: 'Input.dispatchKeyEvent',
          params: {
            type: 'keyDown',
            text: char,
            unmodifiedText: char,
            key: char
          }
        }));
        
        // keyUp
        ws.send(JSON.stringify({
          id: 100 + i * 3 + 1,
          method: 'Input.dispatchKeyEvent',
          params: {
            type: 'keyUp',
            key: char
          }
        }));
        
        await delay(10); // small delay to simulate typing speed
      }
      
      console.log('Typing complete. Waiting 1 second...');
      await delay(1000);
      
      // 2. Click the submit button using click() in the page context (now that state is updated)
      console.log('Clicking the submit button...');
      ws.send(JSON.stringify({
        id: 999,
        method: 'Runtime.evaluate',
        params: {
          expression: `(() => {
            const btn = document.querySelector('.sc-586bebe6-5') || document.querySelector('.cJBRhk') || [...document.querySelectorAll('button')].find(b => b.innerText.includes('Create'));
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
  } else if (response.id === 999) {
    console.log('Submit result:', response.result.result.value);
    ws.close();
  }
});

ws.on('error', (err) => {
  console.error('WebSocket Error:', err);
});
