const WebSocket = require('ws');

const wsUrl = 'ws://127.0.0.1:9222/devtools/page/B3E5429635CDBE6235F52A8A219CECF9';

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  const ws = new WebSocket(wsUrl);
  
  ws.on('open', async () => {
    console.log('Connected to Chrome DevTools Protocol!');
    
    // Poll the page status 15 times (every 3 seconds = 45 seconds total)
    for (let attempt = 1; attempt <= 15; attempt++) {
      console.log(`Polling attempt ${attempt}...`);
      
      const payload = {
        id: attempt,
        method: 'Runtime.evaluate',
        params: {
          expression: `(() => {
            const images = [...document.querySelectorAll('img')].map(img => img.src);
            const textContent = document.body.innerText || '';
            const hasPercent = /\\d+%/.test(textContent);
            
            // Look for any download buttons or buttons inside the new card
            const buttons = [...document.querySelectorAll('button')].map(b => ({
              text: b.innerText,
              className: b.className
            }));
            
            return JSON.stringify({ images, hasPercent, textLength: textContent.length, buttonsCount: buttons.length });
          })()`,
          returnByValue: true
        }
      };
      
      ws.send(JSON.stringify(payload));
      await delay(3000);
    }
  });

  ws.on('message', (data) => {
    const response = JSON.parse(data);
    if (response.result && response.result.result && response.result.result.value) {
      const state = JSON.parse(response.result.result.value);
      console.log(`State (id ${response.id}):`, state);
      if (!state.hasPercent && state.images.length > 1) {
        console.log('Generation appears to be complete! Images found:', state.images);
      }
    }
  });
}

run().catch(console.error);
