const fs = require('fs');
const path = require('path');

async function testAboutHTML() {
  try {
    const res = await fetch('https://classytravelcouples.com/about/?nocache=1');
    const html = await res.text();
    
    console.log('HTML length:', html.length);
    console.log('Contains ab-hero:', html.includes('ab-hero'));
    console.log('Contains ctc-about:', html.includes('ctc-about'));
    console.log('Contains classytravelcouples:', html.includes('classytravelcouples'));
    
    // Find where ab-hero starts
    const heroIdx = html.indexOf('ab-hero');
    if (heroIdx !== -1) {
      console.log('ab-hero context:');
      console.log(html.substring(heroIdx - 50, heroIdx + 200));
    }
  } catch (e) {
    console.error(e.message);
  }
}

testAboutHTML();
