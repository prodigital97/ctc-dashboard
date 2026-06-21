const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const poolPath = path.join(__dirname, 'renders_pool.json');

const topicsToGenerate = [
  {
    row: 130,
    topic: "Malapascua diving (thresher sharks), Philippines",
    category: "Beach & Islands"
  },
  {
    row: 131,
    topic: "Moalboal diving & Sardine Run, Philippines",
    category: "Beach & Islands"
  },
  {
    row: 502,
    topic: "Historic Cafés with Quirky & Unique Local Dishes",
    category: "Food & Culinary"
  },
  {
    row: 32,
    topic: "Hyper-Local & Sustainable Fine Dining Experiences",
    category: "Food & Culinary"
  },
  {
    row: 199,
    topic: "Hidden Wine Regions of Eastern Europe",
    category: "Food & Culinary"
  }
];

async function generateAll() {
  console.log('Loading renders pool from:', poolPath);
  let pool = [];
  if (fs.existsSync(poolPath)) {
    try {
      pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));
    } catch (e) {
      console.warn('Could not parse renders_pool.json, resetting.');
    }
  }

  for (const item of topicsToGenerate) {
    console.log(`\n========================================`);
    console.log(`Generating Row ${item.row}: "${item.topic}"`);
    console.log(`========================================`);

    try {
      const response = await fetch('http://localhost:3002/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: item.topic,
          category: item.category,
          length: 'long',
          tone: 'romantic',
          context: ''
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }

      const generated = await response.json();
      console.log('Successfully generated blog data!');

      // Sanity check on structure
      if (!generated.bodyHtml || !generated.title) {
        console.error('Generated response is missing title or bodyHtml:', generated);
        continue;
      }

      // Add properties needed by style_helper
      const newEntry = {
        row: item.row,
        topic: item.topic,
        title: generated.title,
        metaTitle: generated.metaTitle || generated.title,
        metaDescription: generated.metaDescription || '',
        excerpt: generated.excerpt || '',
        keywords: generated.keywords || [],
        bodyHtml: generated.bodyHtml,
        instagram: generated.instagram || [],
        pinterest: generated.pinterest || '',
        imageDescription: generated.imageDescription || '',
        renderedAt: new Date().toLocaleString(),
        imagePromptV1: `An extreme wide-angle professional travel photograph of ${generated.imageDescription || item.topic}. Realistic twilight lighting, Phase One camera, no text, no watermark.`,
        imagePromptV2: `A realistic photo of @image1 Male character and @image 2 female character experiencing ${item.topic}. Soft warm ambient lighting, highly detailed, no text.`,
        imagePromptV3: `A triptych collage of three naturally blended scenes representing ${item.topic}. High realism, editorial style, no text, no border.`,
        imageSeoDetails: `Filename: ${item.topic.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.jpg\nTitle: ${generated.title}\nAlt Text: ${generated.title}\nDescription: ${generated.imageDescription || ''}`
      };

      // Add or update the pool
      const index = pool.findIndex(x => x.row === item.row);
      if (index !== -1) {
        pool[index] = newEntry;
        console.log(`Updated Row ${item.row} in renders_pool.json`);
      } else {
        pool.push(newEntry);
        console.log(`Added Row ${item.row} to renders_pool.json`);
      }

      // Write pool incrementally
      fs.writeFileSync(poolPath, JSON.stringify(pool, null, 2), 'utf8');

    } catch (err) {
      console.error(`❌ Error generating Row ${item.row}:`, err.message);
    }
  }

  // Run style converter
  console.log('\nRunning style_converter.js...');
  try {
    execSync('node style_converter.js', { stdio: 'inherit', cwd: __dirname });
  } catch (err) {
    console.error('Error running style_converter.js:', err.message);
  }

  // Run sync renders
  console.log('Running sync_renders.js...');
  try {
    execSync('node sync_renders.js', { stdio: 'inherit', cwd: __dirname });
  } catch (err) {
    console.error('Error running sync_renders.js:', err.message);
  }

  console.log('\nAll done! New batch written, styled, and synced successfully.');
}

generateAll().catch(console.error);
