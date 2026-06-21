const fs = require('fs');
const path = require('path');

const urls = [
  { url: 'https://classytravelcouples.com/', match: 'ctc-wrap' },
  { url: 'https://classytravelcouples.com/destinations/', match: 'ctc-wrap' },
  { url: 'https://classytravelcouples.com/blog/', match: 'ctc-wrap' },
  { url: 'https://classytravelcouples.com/our-shop/', match: 'ctc-wrap' },
  { url: 'https://classytravelcouples.com/free-guide/', match: 'fg-hero-title' },
  { url: 'https://classytravelcouples.com/about/', match: 'ab-hero' },
  { url: 'https://classytravelcouples.com/contact/', match: 'ct-hero-title' },
  { url: 'https://classytravelcouples.com/europe/', match: 'ctc-wrap' },
  { url: 'https://classytravelcouples.com/asia/', match: 'ctc-wrap' },
  { url: 'https://classytravelcouples.com/africa/', match: 'ctc-wrap' },
  { url: 'https://classytravelcouples.com/middle-east/', match: 'ctc-wrap' },
  { url: 'https://classytravelcouples.com/indian-ocean/', match: 'ctc-wrap' },
  { url: 'https://classytravelcouples.com/americas/', match: 'ctc-wrap' }
];

async function checkAll() {
  for(const item of urls) {
    try {
      const res = await fetch(item.url + '?nocache=1');
      const html = await res.text();
      const containsMatch = html.includes(item.match);
      console.log(`${item.url} | Class: ${item.match} | Live: ${containsMatch} | Size: ${html.length}`);
    } catch (e) {
      console.error(`Error checking ${item.url}:`, e.message);
    }
  }
}

checkAll();
