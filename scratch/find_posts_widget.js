const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '../website_pages/africa_v2.html'), 'utf8');

// Find the elementor-posts widget and surrounding content
const postsWidgetIdx = html.indexOf('elementor-posts');
if (postsWidgetIdx > -1) {
  console.log('=== ELEMENTOR POSTS WIDGET CONTEXT ===');
  console.log(html.substring(postsWidgetIdx - 200, postsWidgetIdx + 2000));
}

// Find latest-post classes
const latestPostIdx = html.indexOf('latest-post');
if (latestPostIdx > -1) {
  console.log('\n=== LATEST POST SECTION ===');
  console.log(html.substring(latestPostIdx - 500, latestPostIdx + 1500));
}
