const fs = require('fs');
const path = require('path');

async function checkDetails() {
  const pages = [
    'https://classytravelcouples.com/free-guide/',
    'https://classytravelcouples.com/contact/'
  ];
  
  for(const u of pages) {
    try {
      const res = await fetch(u + '?nocache=1');
      const html = await res.text();
      console.log(`\n=== ${u} ===`);
      console.log('x-litespeed-cache:', res.headers.get('x-litespeed-cache'));
      console.log('Contains ctc-wrap:', html.includes('ctc-wrap'));
      console.log('HTML size:', html.length);
      
      // Print first 500 characters after the body tag to see the layout
      const bodyIdx = html.indexOf('<body');
      if (bodyIdx !== -1) {
        console.log('Body snippet:');
        console.log(html.substring(bodyIdx, bodyIdx + 800));
      }
    } catch (e) {
      console.error(e.message);
    }
  }
}

checkDetails();
