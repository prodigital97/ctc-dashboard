const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

const poolPath = path.join(__dirname, '..', 'renders_pool.json');
const xlsxPath = path.join(__dirname, '..', 'trends_history.xlsx');

const pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));
const wb = XLSX.readFile(xlsxPath);
const sheet = wb.Sheets['Trends History'];
const data = XLSX.utils.sheet_to_json(sheet);

const existingTopics = pool.map(p => p.topic.toLowerCase().trim());
const existingRows = new Set(pool.map(p => p.row));

// Keywords of topics we have already generated and want to avoid repeating
const duplicateKeywords = [
  'wedding venue', 'wedding venues',
  'medjumbe', 'raja ampat',
  'park hyatt', 'tokyo hotel', 'iconic luxury hotel',
  'diving', 'marine life', 'philippines',
  'elopement photoshoot', 'honeymoon photos',
  'esim', 'connectivity', 'insurance', 'car rental',
  'bordeaux', 'wine', 'street food', 'cape town culinary',
  'bali beach', 'bali beaches', 'greece', 'greek island',
  'nova scotia', 'japan machiya', 'historic café', 'historic cafe',
  'germany road trip', 'artisanal bakeries', 'pastry shop',
  'cinematic travel', 'travel reels', 'caribbean sailing', 'sailing in the caribbean',
  'new york city', 'nyc hotel'
];

const uniqueCandidates = [];

data.forEach(row => {
  const rowNum = row['#'] + 1; // row number in Excel
  const topic = row['Detected Topic'];
  const score = row['Signal Score'] || 0;
  
  if (!topic) return;
  const topicLower = topic.toLowerCase().trim();
  
  // 1. Check exact row or exact topic match
  if (existingRows.has(rowNum) || existingTopics.includes(topicLower)) return;
  
  // 2. Check if topic contains any of our duplicate keywords
  const isDuplicateTheme = duplicateKeywords.some(kw => topicLower.includes(kw));
  if (isDuplicateTheme) return;
  
  // 3. Prevent self-duplicates within the chosen candidates list
  const isAlreadyAdded = uniqueCandidates.some(c => {
    const words1 = c.topic.toLowerCase().split(/\s+/).filter(w => w.length > 4);
    const words2 = topicLower.split(/\s+/).filter(w => w.length > 4);
    const common = words1.filter(w => words2.includes(w));
    return common.length >= 3; 
  });
  
  if (isAlreadyAdded) return;
  
  uniqueCandidates.push({
    row: rowNum,
    id: row['#'],
    topic: topic,
    score: score,
    category: row['Category Tags']
  });
});

// Sort by score descending
uniqueCandidates.sort((a, b) => b.score - a.score);

console.log('Found', uniqueCandidates.length, 'unique candidates.');
console.log('Top 30 Unique Candidates:');
uniqueCandidates.slice(0, 30).forEach((c, idx) => {
  console.log(`${idx + 1}. [Row ${c.row}, ID ${c.id}] Score: ${c.score} | Category: ${c.category} | Topic: "${c.topic}"`);
});
