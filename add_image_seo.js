const fs = require('fs');
const path = require('path');

const poolPath = path.join(__dirname, 'renders_pool.json');

if (!fs.existsSync(poolPath)) {
  console.error('Error: renders_pool.json not found!');
  process.exit(1);
}

const pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));

const updatedPool = pool.map(item => {
  // Create clean slug for image filename
  const slug = item.topic
    .toLowerCase()
    .replace(/[^\w\s-]/g, '') // remove special characters
    .replace(/\s+/g, '-')     // replace spaces with hyphens
    .replace(/-+/g, '-')      // remove double hyphens
    .trim();
  
  const filename = `${slug}.jpg`;
  const title = item.title || '';
  const altText = item.title || '';
  const description = item.imageDescription || '';
  
  // Format as a clear copy-pasteable text block with line breaks
  const imageSeoText = `Filename: ${filename}\nTitle: ${title}\nAlt Text: ${altText}\nDescription: ${description}`;
  
  return {
    ...item,
    imageSeoDetails: imageSeoText
  };
});

fs.writeFileSync(poolPath, JSON.stringify(updatedPool, null, 2), 'utf8');
console.log('Successfully updated renders_pool.json with WordPress Image SEO details!');
