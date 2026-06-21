const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const sourceDir = 'C:\\Users\\91976\\.gemini\\antigravity\\brain\\96a099e3-4d4a-4797-9aa7-5a776a6ee7ed';
const targetDir = path.join(__dirname, 'downloaded_images');

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

console.log(`Scanning brain directory: ${sourceDir}`);
if (!fs.existsSync(sourceDir)) {
  console.error(`Source directory does not exist: ${sourceDir}`);
  process.exit(1);
}

const files = fs.readdirSync(sourceDir);
const rowRegexV2 = /^row_(\d+)_v2_.*\.png$/i;
const rowRegexV1 = /^row_(\d+)_.*\.png$/i;

const latestFilesByRow = {};

// First pass: scan for V2 files
files.forEach(file => {
  const match = file.match(rowRegexV2);
  if (match) {
    const rowNum = parseInt(match[1]);
    const filePath = path.join(sourceDir, file);
    const stat = fs.statSync(filePath);
    
    if (!latestFilesByRow[rowNum]) {
      latestFilesByRow[rowNum] = {
        fileName: file,
        filePath: filePath,
        mtimeMs: stat.mtimeMs,
        isV2: true
      };
    }
  }
});

// Second pass: scan for V1 files if V2 doesn't exist
files.forEach(file => {
  const match = file.match(rowRegexV1);
  if (match && !file.includes('_v2_')) {
    const rowNum = parseInt(match[1]);
    const filePath = path.join(sourceDir, file);
    const stat = fs.statSync(filePath);
    
    if (!latestFilesByRow[rowNum] || (!latestFilesByRow[rowNum].isV2 && stat.mtimeMs > latestFilesByRow[rowNum].mtimeMs)) {
      latestFilesByRow[rowNum] = {
        fileName: file,
        filePath: filePath,
        mtimeMs: stat.mtimeMs,
        isV2: false
      };
    }
  }
});

const rowsFound = Object.keys(latestFilesByRow);
console.log(`Found generated images for ${rowsFound.length} rows:`, rowsFound);

rowsFound.forEach(rowNum => {
  const info = latestFilesByRow[rowNum];
  const destPath = path.join(targetDir, `${rowNum}.png`);
  console.log(`Copying latest image for row ${rowNum}: "${info.fileName}" -> "${rowNum}.png"`);
  fs.copyFileSync(info.filePath, destPath);
});

console.log('\nRunning image conversion (convert_images.js)...');
try {
  execSync('node convert_images.js', { stdio: 'inherit', cwd: __dirname });
} catch (e) {
  console.error('Error running convert_images.js:', e.message);
}

console.log('\nRunning HTML export (export_html.js)...');
try {
  execSync('node export_html.js', { stdio: 'inherit', cwd: __dirname });
} catch (e) {
  console.error('Error running export_html.js:', e.message);
}

console.log('\nAll operations complete!');
