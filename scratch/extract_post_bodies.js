const fs = require('fs');
const path = require('path');

function extract(id) {
  const jsonPath = path.join(__dirname, `../scratch/post_${id}.json`);
  if (!fs.existsSync(jsonPath)) {
    console.error(`File ${jsonPath} does not exist.`);
    return;
  }
  const post = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const outputPath = path.join(__dirname, `../scratch/post_${id}_body.html`);
  fs.writeFileSync(outputPath, post.content.rendered, 'utf8');
  console.log(`Extracted post ${id} body HTML to ${outputPath}`);
}

extract(353);
extract(345);
