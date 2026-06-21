const fs = require('fs');
const path = require('path');
const styleHelper = require('./style_helper');

const poolPath = path.join(__dirname, 'renders_pool.json');

if (!fs.existsSync(poolPath)) {
  console.error('Error: renders_pool.json not found!');
  process.exit(1);
}

const pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));

// Convert all items in the pool
console.log('Converting all blogs in the renders pool to premium styling...');
const updatedPool = pool.map(item => {
  console.log(`Processing Row ${item.row}: "${item.topic}"`);
  const styledHtml = styleHelper.convertHtmlToPremium(item);
  return {
    ...item,
    bodyHtml: styledHtml
  };
});

fs.writeFileSync(poolPath, JSON.stringify(updatedPool, null, 2), 'utf8');
console.log('Saved styled blogs to renders_pool.json!');
