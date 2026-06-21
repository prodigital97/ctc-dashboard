const XLSX = require('xlsx');
const path = require('path');

const excelPath = path.join(__dirname, '..', 'Trending Blog Topics.xlsx');
const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets['Trends History'];
const data = XLSX.utils.sheet_to_json(sheet);

const uniqueCategories = new Set();

data.forEach(row => {
    let catStr = row['Category Tags'] || row['Category'] || '';
    if (catStr) {
        catStr.split(',').forEach(c => {
            const cleanCat = c.trim();
            if (cleanCat) uniqueCategories.add(cleanCat);
        });
    }
});

console.log('All Unique Categories from Excel:');
console.log(JSON.stringify(Array.from(uniqueCategories), null, 2));
