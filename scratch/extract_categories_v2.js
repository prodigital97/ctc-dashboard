const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

const excelPath = path.join(__dirname, '..', 'Trending Blog Topics.xlsx');
const poolPath = path.join(__dirname, '..', 'renders_pool.json');

const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets['Trends History'];
const data = XLSX.utils.sheet_to_json(sheet);

const pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));

console.log(`Pool has ${pool.length} posts. Finding categories...`);

const uniqueCategories = new Set();
let matchCount = 0;

for (const post of pool) {
    const postTopic = post.topic.toLowerCase().trim();
    // find this topic in the excel data
    let found = false;
    for (const row of data) {
        if (row['Topic'] && row['Topic'].toLowerCase().trim() === postTopic) {
            const cat = row['Category Tags'] || row['Category'];
            if (cat) {
                uniqueCategories.add(cat);
                found = true;
                matchCount++;
                break;
            }
        }
    }
    if (!found) {
        console.log(`Could not find category for: ${post.topic}`);
    }
}

console.log(`Matched ${matchCount} out of ${pool.length} posts.`);
console.log('Unique categories found:');
console.log(Array.from(uniqueCategories));
