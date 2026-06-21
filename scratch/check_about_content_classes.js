const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '..', 'website_pages', 'about_v2.html');
const fileHtml = fs.readFileSync(filePath, 'utf8');

const classes = ['ctc-about', 'ctc-about-text', 'ctc-about-quote', 'ctc-about-images'];
classes.forEach(cls => {
  console.log(`Contains class "${cls}":`, fileHtml.includes(cls));
});
