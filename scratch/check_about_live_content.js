const fs = require('fs');
const path = require('path');

async function checkAboutLive() {
  try {
    const res = await fetch('https://classytravelcouples.com/about/?nocache=1');
    const html = await res.text();
    
    console.log('Live HTML total length:', html.length);
    const contentIdx = html.indexOf('<div id="content"');
    if (contentIdx !== -1) {
      console.log('Found <div id="content" at index:', contentIdx);
      console.log('\nHTML CONTENT SNIPPET:');
      console.log(html.substring(contentIdx, contentIdx + 2000));
    } else {
      console.log('Could not find <div id="content"');
    }
  } catch (err) {
    console.error(err.message);
  }
}

checkAboutLive();
