const fs = require('fs');
const path = require('path');

// Check all destination v2 pages for blog/featured sections
const pages = ['africa_v2.html', 'europe_v2.html', 'asia_v2.html', 'americas_v2.html', 'indian_ocean_v2.html', 'middle_east_v2.html'];
const dir = path.join(__dirname, '../website_pages');

pages.forEach(page => {
  const html = fs.readFileSync(path.join(dir, page), 'utf8');
  
  // Find blog-related sections
  const blogSection = html.match(/class="[^"]*blog[^"]*"/gi) || [];
  const postSection = html.match(/class="[^"]*post[^"]*"/gi) || [];
  const articleSection = html.match(/class="[^"]*article[^"]*"/gi) || [];
  const categorySection = html.match(/category[^"]{0,50}/gi) || [];
  
  console.log(`\n=== ${page} ===`);
  console.log('Blog classes found:', blogSection.slice(0, 5));
  console.log('Post classes found:', postSection.slice(0, 5));
  console.log('Category refs:', [...new Set(categorySection)].slice(0, 5));
  
  // Find the "featured blogs" section specifically
  const featuredIdx = html.toLowerCase().indexOf('featured blog');
  if (featuredIdx > -1) {
    console.log('Featured blogs section at idx:', featuredIdx);
    console.log(html.substring(featuredIdx - 50, featuredIdx + 500));
  }
  
  // Check for hardcoded blog cards vs dynamic loading
  const hardcodedCards = html.match(/href="https:\/\/classytravelcouples\.com\/[^"]+"/gi) || [];
  console.log('Hardcoded post links:', hardcodedCards.slice(0, 3));
});
