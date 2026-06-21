const WebSocket = require('ws');
const path = require('path');
const fs = require('fs');

const wsUrl = 'ws://127.0.0.1:9222/devtools/page/B3E5429635CDBE6235F52A8A219CECF9';
const brainDir = 'C:\\Users\\91976\\.gemini\\antigravity\\brain\\96a099e3-4d4a-4797-9aa7-5a776a6ee7ed';

const tasks = [
  {
    row: 26,
    prompt: "Extreme wide-angle beachfront wedding ceremony setup at Cheval Blanc St-Barth Isle de France on Flamands Beach, St. Barts. A simple driftwood arch decorated with orchids and white roses stands on the white sand at sunset, with a calm turquoise ocean in the background. Canon EOS R5, 24mm lens. Empty of people, no humans."
  },
  {
    row: 42,
    prompt: "Extreme wide-angle panoramic view of the white sand spit of One Foot Island (Tapuaetai) in Aitutaki, Cook Islands. Surrounded by a shallow, glowing neon-turquoise South Pacific lagoon under a clear warm sky. Sony a7R V, 16mm lens. Devoid of human figures, no people."
  },
  {
    row: 82,
    prompt: "Extreme wide-angle twilight photograph of a luxury hillside plunge pool suite at Hermitage Bay Resort, Antigua. Showing the private pool deck and double daybed overlooking the calm Caribbean Sea under a vibrant orange sunset. Fujifilm GFX 100S, 23mm lens. Empty of people, no humans."
  },
  {
    row: 231,
    prompt: "Extreme wide-angle top-down aerial drone photograph of a luxury wooden boardwalk winding through a neon-turquoise tropical lagoon in the Maldives. Crystal clear shallow waters showing pristine coral reefs below, under warm natural sunlight. Hasselblad H6D-100c. Devoid of human figures, no people."
  },
  {
    row: 234,
    prompt: "Extreme wide-angle twilight photograph of an empty dining table set with fresh oysters and sparkling wine glasses on a wooden deck right at the ocean's edge at Tintswalo Atlantic, Cape Town, South Africa. The dramatic cliffs of Chapman's Peak rise in the background under a colorful sunset sky. Leica SL2, 28mm lens. Devoid of human figures, no people."
  },
  {
    row: 236,
    prompt: "Extreme wide-angle morning photograph of a luxury wooden suite built on stilts over a calm lake at Les Sources de Caudalie, Bordeaux, France. Surrounded by weeping willows and rows of wine grapes in a vineyard under a soft, misty morning sky. Phase One XF. Devoid of human figures, no people."
  },
  {
    row: 246,
    prompt: "Extreme wide-angle photograph of a fresh, folded wood-fired Neapolitan street pizza portafoglio resting on a rustic wooden table on a narrow, historic street in Spaccanapoli, Naples, Italy. Colorful ancient building facades rise on both sides under warm daylight. Leica M11. Devoid of human figures, no people."
  },
  {
    row: 270,
    prompt: "Extreme wide-angle sunset photograph of a minimalist beach wedding altar with white fabric drapes on a wooden platform at a luxury resort in the Maldives. A vast, calm turquoise ocean stretches to the horizon under a soft pastel sky. Hasselblad. Devoid of human figures, no people."
  },
  {
    row: 295,
    prompt: "Extreme wide-angle morning photograph of the iconic white-washed buildings and blue domes of Oia, Santorini, Greece. The empty stone paths overlook the deep blue Aegean Sea caldera under warm, golden sunrise light. Leica M11, 24mm lens. Devoid of human figures, no people."
  },
  {
    row: 328,
    prompt: "Extreme wide-angle morning photograph of the private wooden deck of a luxury overwater villa at Soneva Fushi, Baa Atoll, Maldives. Features an empty daybed, a water slide, and a glass-bottom floor panel overlooking the crystal-clear turquoise sea. Sony a7R V, 16mm lens. Devoid of human figures, no people."
  },
  {
    row: 368,
    prompt: "Extreme wide-angle photograph of a sleek modern smartphone resting on a marble table in a premium airport lounge, showing a simple digital travel cellular connection app. Through the massive floor-to-ceiling glass windows, wide views of empty runways and commercial airplanes are visible. Devoid of human figures, no people."
  },
  {
    row: 392,
    prompt: "Extreme wide-angle underwater scenic photograph of Apo Island Marine Sanctuary, Negros Oriental, Philippines. A green sea turtle swims gracefully over a massive, colorful hard coral reef garden with sunbeams filtering down through crystal-clear turquoise water. Canon EOS R5. Devoid of human figures, no people."
  },
  {
    row: 467,
    prompt: "Extreme wide-angle twilight landscape photograph of the vertical cliffside houses of Positano on the Amalfi Coast, Italy. Colorful villas stacked on the steep hillside glow with warm lights overlooking the dark blue Mediterranean sea. Phase One XF. Devoid of human figures, no people."
  }
];

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

function navigate(ws, id, url) {
  return new Promise((resolve, reject) => {
    const callback = (data) => {
      const response = JSON.parse(data);
      if (response.id === id) {
        ws.off('message', callback);
        resolve();
      }
    };
    ws.on('message', callback);
    ws.send(JSON.stringify({
      id,
      method: 'Page.navigate',
      params: { url }
    }));
  });
}

async function run() {
  const ws = new WebSocket(wsUrl);
  
  await new Promise((resolve, reject) => {
    ws.on('open', resolve);
    ws.on('error', reject);
  });
  console.log('Connected to Chrome DevTools Protocol!');

  let msgId = 4000;

  for (let idx = 0; idx < tasks.length; idx++) {
    const task = tasks[idx];
    console.log(`\n========================================`);
    console.log(`Starting Row ${task.row} (${idx + 1}/${tasks.length})...`);
    console.log(`========================================`);

    // 1. Navigate back to the project editor page
    console.log('Navigating to Google Flow project editor...');
    await navigate(ws, ++msgId, 'https://labs.google/fx/tools/flow/project/28bf8fed-fdc8-4eee-9728-694220392a00');
    
    // Wait for the editor input element to appear
    console.log('Waiting for editor interface to load...');
    let loaded = false;
    for (let i = 0; i < 30; i++) {
      await delay(1000);
      try {
        const hasInput = await evaluate(ws, ++msgId, `!!document.querySelector('.sc-586bebe6-6')`);
        if (hasInput) {
          loaded = true;
          break;
        }
      } catch (e) {
        // Wait and retry
      }
    }

    if (!loaded) {
      console.error('Failed to load project editor. Skipping task.');
      continue;
    }
    console.log('Editor loaded successfully. Focusing input natively...');

    // 2. Query input coordinates and click to focus natively (guarantees window focus)
    const inputCoordsStr = await evaluate(ws, ++msgId, `(() => {
      const div = document.querySelector('.sc-586bebe6-6');
      if (!div) return null;
      const rect = div.getBoundingClientRect();
      return JSON.stringify({ x: rect.left + 50, y: rect.top + rect.height / 2 });
    })()`);

    if (!inputCoordsStr) {
      console.error('Input box not found. Skipping task.');
      continue;
    }

    const inputCoords = JSON.parse(inputCoordsStr);
    ws.send(JSON.stringify({
      id: ++msgId,
      method: 'Input.dispatchMouseEvent',
      params: { type: 'mouseMoved', x: inputCoords.x, y: inputCoords.y }
    }));
    await delay(100);
    ws.send(JSON.stringify({
      id: ++msgId,
      method: 'Input.dispatchMouseEvent',
      params: { type: 'mousePressed', x: inputCoords.x, y: inputCoords.y, button: 'left', clickCount: 1 }
    }));
    await delay(100);
    ws.send(JSON.stringify({
      id: ++msgId,
      method: 'Input.dispatchMouseEvent',
      params: { type: 'mouseReleased', x: inputCoords.x, y: inputCoords.y, button: 'left', clickCount: 1 }
    }));
    await delay(500);

    // 3. Clear and paste the prompt instantly using execCommand (React state compatible)
    console.log('Typing prompt instantly...');
    const promptEscaped = task.prompt.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\n/g, '\\n');
    await evaluate(ws, ++msgId, `(() => {
      const div = document.querySelector('.sc-586bebe6-6');
      div.focus();
      document.execCommand('selectAll', false, null);
      document.execCommand('delete', false, null);
      document.execCommand('insertText', false, '${promptEscaped}');
      div.dispatchEvent(new Event('input', { bubbles: true }));
    })()`);

    await delay(1000);

    // 4. Find button coordinates
    console.log('Querying submit button coordinates...');
    const coordsStr = await evaluate(ws, ++msgId, `(() => {
      const btn = [...document.querySelectorAll('button')].find(b => b.innerText.includes('arrow_forward'));
      if (!btn) return null;
      const rect = btn.getBoundingClientRect();
      return JSON.stringify({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    })()`);

    if (!coordsStr) {
      console.error('Could not find submit button coordinates. Skipping task.');
      continue;
    }

    const coords = JSON.parse(coordsStr);
    console.log(`Clicking submit button at coordinates: x=${coords.x}, y=${coords.y}`);

    // Click natively
    ws.send(JSON.stringify({
      id: ++msgId,
      method: 'Input.dispatchMouseEvent',
      params: { type: 'mouseMoved', x: coords.x, y: coords.y }
    }));
    await delay(100);
    ws.send(JSON.stringify({
      id: ++msgId,
      method: 'Input.dispatchMouseEvent',
      params: { type: 'mousePressed', x: coords.x, y: coords.y, button: 'left', clickCount: 1 }
    }));
    await delay(100);
    ws.send(JSON.stringify({
      id: ++msgId,
      method: 'Input.dispatchMouseEvent',
      params: { type: 'mouseReleased', x: coords.x, y: coords.y, button: 'left', clickCount: 1 }
    }));

    // 5. Monitor progress and resolve redirect
    console.log('Generating image. Monitoring progress...');
    let imageSrc = null;
    for (let check = 1; check <= 30; check++) { // check for up to 90 seconds
      await delay(3000);
      
      const pageInfoStr = await evaluate(ws, ++msgId, `(() => {
        const textContent = document.body.innerText || '';
        const hasPercent = /\\d+%/.test(textContent) || textContent.includes('%');
        
        // Find the image element
        const img = [...document.querySelectorAll('img')].find(img => img.src.includes('media.getMediaUrlRedirect'));
        
        const currentUrl = window.location.href;
        const isRawImagePage = currentUrl.includes('flow-content.google') || currentUrl.includes('getMediaUrlRedirect');
        
        // If image exists and we haven't navigated yet, navigate to trigger authenticated redirect
        if (img && !isRawImagePage) {
          window.location.href = img.src;
          return JSON.stringify({
            hasPercent: false,
            imgSrc: null,
            isRawImagePage: false,
            navigating: true,
            currentUrl
          });
        }
        
        return JSON.stringify({
          hasPercent,
          imgSrc: img ? img.src : null,
          isRawImagePage,
          navigating: false,
          currentUrl
        });
      })()`);

      const pageInfo = JSON.parse(pageInfoStr);
      console.log(`  [Check ${check}/30] hasPercent: ${pageInfo.hasPercent}, isRawImagePage: ${pageInfo.isRawImagePage}, navigating: ${pageInfo.navigating}`);
      
      if (pageInfo.isRawImagePage) {
        if (pageInfo.currentUrl.includes('Signature=')) {
          imageSrc = pageInfo.currentUrl;
          break;
        } else {
          console.log('  Waiting for redirect to resolve...');
        }
      }
    }

    if (!imageSrc) {
      console.error(`Timeout waiting for Row ${task.row} image generation. Skipping.`);
      continue;
    }

    console.log(`Image generation complete! Resolved public CDN URL: ${imageSrc}`);

    // 6. Download the raw image via Node fetch
    console.log(`Downloading image from CDN...`);
    try {
      const response = await fetch(imageSrc);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const targetPath = path.join(brainDir, `row_${task.row}_v2_download.png`);
      fs.writeFileSync(targetPath, buffer);
      console.log(`Row ${task.row} image successfully saved to: ${targetPath}`);
    } catch (err) {
      console.error(`Error downloading image for Row ${task.row}:`, err.message);
    }
  }

  console.log('\nAll generations finished!');
  ws.close();
}

run().catch(console.error);
