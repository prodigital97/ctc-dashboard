const fetch = require('node-fetch').default || require('node-fetch');

async function check() {
  try {
    const res = await fetch('http://127.0.0.1:9222/json');
    const tabs = await res.json();
    console.log('Connected to Chrome DevTools! Active tabs:', tabs);
  } catch (e) {
    console.log('Chrome DevTools not active on 9222:', e.message);
  }
}

check();
