const fs = require('fs');
const path = require('path');
const styleHelper = require('./style_helper');

const poolPath = path.join(__dirname, 'renders_pool.json');
const outputDir = path.join(__dirname, 'rendered_blogs');

if (!fs.existsSync(poolPath)) {
  console.error('Error: renders_pool.json not found!');
  process.exit(1);
}

// Create output folder if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log('Created folder:', outputDir);
}

const pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));

pool.forEach(item => {
  // Create a clean slug from the topic
  const slug = item.topic
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // remove special characters
    .replace(/\s+/g, '-')     // replace spaces with hyphens
    .replace(/-+/g, '-')      // remove double hyphens
    .trim();
  
  const fileName = `${slug}.html`;
  const filePath = path.join(outputDir, fileName);

  const styledHtml = styleHelper.convertHtmlToPremium(item);

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${item.title}</title>
  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #111111;
    }
  </style>
</head>
<body>
  ${styledHtml}
</body>
</html>`;

  fs.writeFileSync(filePath, fullHtml, 'utf8');
  console.log(`Exported: ${fileName}`);
});

console.log(`\nAll ${pool.length} blogs successfully exported to: ${outputDir}`);
