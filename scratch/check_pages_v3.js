const fs = require('fs');
const path = require('path');

async function checkDetails() {
  const pages = [
    'https://classytravelcouples.com/destinations/',
    'https://classytravelcouples.com/blog/',
    'https://classytravelcouples.com/europe/'
  ];
  
  for (const u of pages) {
    try {
      const res = await fetch(u + '?nocache=1');
      const html = await res.text();
      console.log(`\n=== ${u} ===`);
      console.log('HTTP Status:', res.status);
      console.log('Contains ctc-dw:', html.includes('ctc-dw'));
      console.log('Contains ctc-bw:', html.includes('ctc-bw'));
      console.log('Contains <style>:', html.includes('<style>'));
      console.log('Contains style in head/body:', html.indexOf('.ctc-dw') !== -1);
      console.log('HTML size:', html.length);
      
      // Let's write the first 1500 chars after the opening of the main content or body tag
      const bodyIdx = html.indexOf('<body');
      if (bodyIdx !== -1) {
        console.log('Body snippet (1000 chars):');
        console.log(html.substring(bodyIdx, bodyIdx + 1000));
      }
      
      // Look for ctc-dw/ctc-bw container
      const idx = html.indexOf('ctc-dsec');
      if (idx !== -1) {
        console.log('ctc-dsec snippet (1000 chars):');
        console.log(html.substring(idx - 100, idx + 900));
      }
    } catch (e) {
      console.error(e.message);
    }
  }
}

checkDetails();
