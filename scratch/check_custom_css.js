const fs = require('fs');

async function checkCustomCss() {
  try {
    const res = await fetch('https://classytravelcouples.com/?nocache=1');
    const html = await res.text();
    const startIdx = html.indexOf('<style id="wp-custom-css">');
    if (startIdx !== -1) {
      const endIdx = html.indexOf('</style>', startIdx);
      const css = html.substring(startIdx + '<style id="wp-custom-css">'.length, endIdx);
      console.log('Live Customizer CSS (first 500 chars):');
      console.log(css.substring(0, 500));
      console.log('\nLength of Live Customizer CSS:', css.length);
      
      // Check if it contains the hero padding fixes
      console.log('Contains ctc-hero-content padding-top:', css.includes('padding-top: 200px'));
    } else {
      console.log('wp-custom-css style tag not found on live site!');
    }
  } catch (err) {
    console.error(err);
  }
}

checkCustomCss();
