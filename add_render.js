const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const poolPath = path.join(__dirname, 'renders_pool.json');
const tempPath = path.join(__dirname, 'temp_render.json');

if (!fs.existsSync(tempPath)) {
  console.error('Error: temp_render.json not found at ' + tempPath);
  process.exit(1);
}

try {
  const newRender = JSON.parse(fs.readFileSync(tempPath, 'utf8'));
  
  if (!newRender.row || !newRender.topic) {
    console.error('Error: temp_render.json must contain "row" and "topic" properties.');
    process.exit(1);
  }

  let pool = [];
  if (fs.existsSync(poolPath)) {
    try {
      pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));
    } catch (e) {
      console.warn('Warning: Could not parse renders_pool.json, resetting to empty array.');
    }
  }

  // Check if this row already exists in the pool
  const index = pool.findIndex(item => item.row === newRender.row);
  if (index !== -1) {
    pool[index] = newRender;
    console.log(`Updated existing render for row ${newRender.row}: "${newRender.topic}"`);
  } else {
    pool.push(newRender);
    console.log(`Added new render for row ${newRender.row}: "${newRender.topic}"`);
  }

  fs.writeFileSync(poolPath, JSON.stringify(pool, null, 2), 'utf8');
  console.log('Saved to renders_pool.json.');

  // Delete temp_render.json
  fs.unlinkSync(tempPath);
  console.log('Cleaned up temp_render.json.');

  // Run sync_renders.js
  console.log('Running sync_renders.js...');
  execSync('node sync_renders.js', { stdio: 'inherit', cwd: __dirname });

} catch (e) {
  console.error('Error processing render:', e.message);
  process.exit(1);
}
