const XLSX = require('xlsx');
const path = require('path');
const fs = require('fs');
const styleHelper = require('./style_helper');

const jsonPath = path.join(__dirname, 'renders_pool.json');
const excelPaths = [
  path.join(__dirname, 'trends_history.xlsx'),
  path.join(__dirname, 'Trending Blog Topics.xlsx')
];

console.log('Loading renders pool from:', jsonPath);
let renders = [];
if (fs.existsSync(jsonPath)) {
  try {
    renders = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  } catch (e) {
    console.error('Error parsing renders_pool.json:', e.message);
    process.exit(1);
  }
} else {
  console.log('renders_pool.json does not exist yet. Creating empty renders sheet.');
}

// Convert renders to sheet data with separated columns
const sheetData = renders.map(item => {
  const instagram = Array.isArray(item.instagram) ? item.instagram : [];
  // Apply premium clean template styling on-the-fly
  const styledHtml = styleHelper.convertHtmlToCleanTemplate(item);
  return {
    '#': item.row,
    'Topic': item.topic,
    'Title': item.title || '',
    'Meta Title': item.metaTitle || '',
    'Description': item.metaDescription || '',
    'Content': styledHtml,
    'Excerpt': item.excerpt || '',
    'Keywords': Array.isArray(item.keywords) ? item.keywords.join(', ') : (item.keywords || ''),
    'Instagram Caption 1': instagram[0] || '',
    'Instagram Caption 2': instagram[1] || '',
    'Instagram Caption 3': instagram[2] || '',
    'Pinterest Description': item.pinterest || '',
    'Image Description': item.imageDescription || '',
    'WordPress Image SEO': item.imageSeoDetails || '',
    'Image Prompt V1 (Scene)': item.imagePromptV1 || '',
    'Image Prompt V2 (Couple)': item.imagePromptV2 || '',
    'Image Prompt V3 (Collage)': item.imagePromptV3 || '',
    'Render Date': item.renderedAt || new Date().toLocaleString()
  };
});

// Update each Excel workbook
excelPaths.forEach(excelPath => {
  if (!fs.existsSync(excelPath)) {
    console.log(`Workbook not found, skipping: ${excelPath}`);
    return;
  }
  
  console.log(`Updating workbook at: ${excelPath}`);
  try {
    const workbook = XLSX.readFile(excelPath);
    
    // Remove existing Renders sheet if it exists
    if (workbook.SheetNames.includes('Renders')) {
      const index = workbook.SheetNames.indexOf('Renders');
      workbook.SheetNames.splice(index, 1);
      delete workbook.Sheets['Renders'];
    }
    
    // Create new sheet
    const worksheet = XLSX.utils.json_to_sheet(sheetData);
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Renders');
    
    // Set column widths to make it highly readable and clean
    worksheet['!cols'] = [
      { wch: 5 },   // #
      { wch: 35 },  // Topic
      { wch: 35 },  // Title
      { wch: 35 },  // Meta Title
      { wch: 40 },  // Description
      { wch: 80 },  // Content (HTML body)
      { wch: 40 },  // Excerpt
      { wch: 30 },  // Keywords
      { wch: 40 },  // Instagram Caption 1
      { wch: 40 },  // Instagram Caption 2
      { wch: 40 },  // Instagram Caption 3
      { wch: 40 },  // Pinterest Description
      { wch: 40 },  // Image Description
      { wch: 50 },  // WordPress Image SEO
      { wch: 50 },  // Image Prompt V1 (Scene)
      { wch: 50 },  // Image Prompt V2 (Couple)
      { wch: 50 },  // Image Prompt V3 (Collage)
      { wch: 22 }   // Render Date
    ];
    
    XLSX.writeFile(workbook, excelPath);
    console.log(`✅ Workbook successfully updated: ${excelPath}`);
  } catch (err) {
    console.error(`❌ Failed to update workbook ${excelPath}:`, err.message);
  }
});
