const WebSocket = require('ws');
const fs = require('fs');
const path = require('path');

const wsUrl = 'ws://127.0.0.1:9222/devtools/page/B3E5429635CDBE6235F52A8A219CECF9';
const ws = new WebSocket(wsUrl);

ws.on('open', () => {
  console.log('Connected to Chrome DevTools Protocol!');

  const payload = {
    id: 1,
    method: 'Page.captureScreenshot',
    params: {
      format: 'png'
    }
  };

  ws.send(JSON.stringify(payload));
});

ws.on('message', (data) => {
  const response = JSON.parse(data);
  if (response.id === 1) {
    if (response.result && response.result.data) {
      const buffer = Buffer.from(response.result.data, 'base64');
      const targetPath = path.join('C:\\Users\\91976\\.gemini\\antigravity\\brain\\96a099e3-4d4a-4797-9aa7-5a776a6ee7ed', 'flow_screenshot.png');
      fs.writeFileSync(targetPath, buffer);
      console.log('Screenshot captured successfully and saved to:', targetPath);
    } else {
      console.error('Error or no screenshot result:', response);
    }
    ws.close();
  }
});

ws.on('error', (err) => {
  console.error('WebSocket Error:', err);
});
