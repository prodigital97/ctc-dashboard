const fs = require('fs');

async function verify() {
  const pages = [
    { name: 'Destinations', url: 'https://classytravelcouples.com/destinations/?nocache=1', key: 'ctc-dw' },
    { name: 'Blog', url: 'https://classytravelcouples.com/blog/?nocache=1', key: 'ctc-bw' },
    { name: 'Europe', url: 'https://classytravelcouples.com/europe/?nocache=1', key: 'ctc-wrap' }
  ];
  
  for (const page of pages) {
    try {
      const res = await fetch(page.url);
      const html = await res.text();
      console.log(`\n=== Verifying ${page.name} ===`);
      console.log('HTTP Status:', res.status);
      console.log(`Contains key "${page.key}":`, html.includes(page.key));
      console.log('Contains p tag corruption in CSS (/* DESTINATION SECTIONS */):', html.includes('</p>\n<p>/* DESTINATION SECTIONS */'));
      console.log('Contains p tag corruption in CSS (/* HERO */):', html.includes('</p>\n<p>          /* HERO */'));
      console.log('Contains ctc-jcard-date in HTML:', html.includes('ctc-jcard-date'));
      console.log('Contains email (duttapronoy97@gmail.com):', html.includes('duttapronoy97@gmail.com'));
      
      // Let's print out the script snippet to see if it's clean
      const scriptIdx = html.indexOf('var apiBase');
      if (scriptIdx !== -1) {
        console.log('Script snippet:');
        console.log(html.substring(scriptIdx - 50, scriptIdx + 150));
      }
    } catch (e) {
      console.error(e.message);
    }
  }
}

verify();
