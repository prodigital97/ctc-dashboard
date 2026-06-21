const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const wsUrl = 'ws://127.0.0.1:9222/devtools/page/B3E5429635CDBE6235F52A8A219CECF9';
const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('Connected to Chrome DevTools Protocol!');

  const script = `(() => {
    // Find the generated image URL (excluding profile image)
    const img = [...document.querySelectorAll('img')].find(img => img.src.includes('media.getMediaUrlRedirect'));
    if (!img) return 'Image not found';
    
    // Create temporary link and click it to trigger download
    const a = document.createElement('a');
    a.href = img.src;
    a.download = 'row_436_v2_download.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    return 'Download triggered for: ' + img.src;
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
    console.log('Result:', response.result.result.value);
    ws.close();
  }
});

ws.on('error', (err) => {
  console.error('WebSocket Error:', err);
});
