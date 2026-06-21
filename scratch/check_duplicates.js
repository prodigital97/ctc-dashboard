const XLSX = require('xlsx');

function checkDuplicates(filePath) {
  console.log(`\n=== File: ${filePath} ===`);
  const workbook = XLSX.readFile(filePath);
  const sheet = workbook.Sheets['Trends History'];
  if (!sheet) {
    console.log('No Trends History sheet found.');
    return;
  }
  const data = XLSX.utils.sheet_to_json(sheet);
  console.log(`Total rows: ${data.length}`);
  
  const topics = data.map(r => (r['Detected Topic'] || r['Topic'] || '').trim().toLowerCase());
  const uniqueTopics = new Set(topics);
  console.log(`Unique topics: ${uniqueTopics.size}`);
  
  // Count how many have duplicate names
  const counts = {};
  topics.forEach(t => {
    counts[t] = (counts[t] || 0) + 1;
  });
  
  const dupes = Object.keys(counts).filter(t => counts[t] > 1);
  console.log(`Duplicate topics count: ${dupes.length}`);
  if (dupes.length > 0) {
    console.log('Sample duplicates:');
    dupes.slice(0, 5).forEach(d => {
      console.log(`  - "${d}" is repeated ${counts[d]} times`);
    });
  }
}

checkDuplicates('trends_history.xlsx');
checkDuplicates('Trending Blog Topics.xlsx');
