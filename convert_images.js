const fs = require('fs');
const path = require('path');

const poolPath = path.join(__dirname, 'renders_pool.json');
const inputDir = path.join(__dirname, 'downloaded_images');
const outputDir = path.join(__dirname, 'optimized_images');

// Ensure Jimp is installed
let Jimp;
try {
  Jimp = require('jimp').Jimp;
} catch (e) {
  console.error('\nError: "jimp" is not installed yet. Please wait for npm install to finish or run: npm.cmd install jimp\n');
  process.exit(1);
}

if (!fs.existsSync(inputDir)) {
  fs.mkdirSync(inputDir, { recursive: true });
  console.log(`\nCreated folder: ${inputDir}`);
  console.log('Please place your downloaded PNG images in this folder.');
  console.log('You can name them by row number (e.g., "18.png", "39.png") or by topic name (e.g., "Raja Ampat.png").\n');
  process.exit(0);
}

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
  console.log(`Created folder: ${outputDir}`);
}

if (!fs.existsSync(poolPath)) {
  console.error('Error: renders_pool.json not found!');
  process.exit(1);
}

const pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));

// Helper to find a blog item in the pool by file name
function findBlogMatch(fileName) {
  const cleanName = path.basename(fileName, path.extname(fileName)).toLowerCase().trim();
  
  // Try matching by exact row number
  const rowMatch = cleanName.match(/^(\d+)$/);
  if (rowMatch) {
    const rowNum = parseInt(rowMatch[1]);
    const matched = pool.find(item => item.row === rowNum);
    if (matched) return matched;
  }

  // Try matching by topic name inside the filename
  for (const item of pool) {
    const topicKeywords = item.topic.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 3);
    // If filename contains most of the topic keywords
    if (topicKeywords.length > 0) {
      const matchCount = topicKeywords.filter(keyword => cleanName.includes(keyword)).length;
      if (matchCount >= Math.min(2, topicKeywords.length)) {
        return item;
      }
    }
  }

  return null;
}

const files = fs.readdirSync(inputDir).filter(file => file.toLowerCase().endsWith('.png'));

if (files.length === 0) {
  console.log('\nNo PNG files found in "downloaded_images" folder.');
  console.log('Please put your PNG images in that folder and run this script again.\n');
  process.exit(0);
}

console.log(`Found ${files.length} PNG images to process...\n`);

async function processImages() {
  for (const file of files) {
    const inputFilePath = path.join(inputDir, file);
    const matchedItem = findBlogMatch(file);
    
    if (!matchedItem) {
      console.warn(`Could not find a matching blog post for file: "${file}". Skipping.`);
      continue;
    }

    const slug = matchedItem.topic
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();

    const outputFileName = `${slug}.jpg`;
    const outputFilePath = path.join(outputDir, outputFileName);

    console.log(`Processing "${file}" -> "${outputFileName}"...`);
    try {
      const image = await Jimp.read(inputFilePath);
      // Crop the image to 21:9 aspect ratio from the center (1008x432)
      image.crop({ x: 8, y: 296, w: 1008, h: 432 });
      await image.write(outputFilePath);
      console.log(`Successfully converted and optimized: "${outputFileName}"`);
    } catch (err) {
      console.error(`Error processing file "${file}":`, err.message);
    }
  }
  console.log(`\nAll matching conversions complete! Check your optimized JPG files in: ${outputDir}\n`);
}

processImages();
