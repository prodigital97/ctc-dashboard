const fs = require('fs');
const path = require('path');

// Read africa_v2.html and find the featured blogs section in Elementor content
const html = fs.readFileSync(path.join(__dirname, '../website_pages/africa_v2.html'), 'utf8');

// Find all section headings that mention blogs/featured
const sectionMatches = html.match(/Featured[\s\S]{0,50}Blog|Blog[\s\S]{0,20}Section|Latest[\s\S]{0,20}Post|from the blog/gi) || [];
console.log('Section heading mentions:', sectionMatches.slice(0, 10));

// Find Elementor widgets that handle posts
const postWidgets = html.match(/eael-post|jet-listing|elementor-posts|posts-widget|query-posts|loop-grid/gi) || [];
console.log('Post widget classes:', [...new Set(postWidgets)]);

// Find all h2/h3 headings in the page to understand structure
const headings = [...html.matchAll(/<h[23][^>]*>([\s\S]*?)<\/h[23]>/gi)];
console.log('\nAll headings on Africa page:');
headings.forEach(m => {
  const text = m[1].replace(/<[^>]+>/g, '').trim();
  if (text) console.log(' -', text.substring(0, 100));
});

// Look for data-settings with category/posts config
const dataSettings = [...html.matchAll(/data-settings="([^"]{0,500})"/gi)];
console.log('\nData settings with post/category refs:');
dataSettings.forEach(m => {
  if (m[1].includes('post') || m[1].includes('categor') || m[1].includes('query')) {
    console.log(' -', m[1].substring(0, 200));
  }
});
