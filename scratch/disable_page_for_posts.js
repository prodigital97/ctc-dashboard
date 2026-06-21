const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const auth = 'Basic ' + Buffer.from(process.env.WP_USERNAME + ':' + process.env.WP_APPLICATION_PASSWORD).toString('base64');
const WP = 'https://classytravelcouples.com/wp-json/wp/v2';

async function disablePageForPosts() {
  try {
    const res = await fetch(`${WP}/settings`, {
      method: 'POST',
      headers: {
        'Authorization': auth,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        page_for_posts: 0
      })
    });
    
    if (res.ok) {
      const data = await res.json();
      console.log('✅ Successfully set page_for_posts to 0. Updated settings:');
      console.log('show_on_front:', data.show_on_front);
      console.log('page_on_front:', data.page_on_front);
      console.log('page_for_posts:', data.page_for_posts);
    } else {
      console.log('❌ Failed to update settings:', res.statusText);
      console.log(await res.text());
    }
  } catch (e) {
    console.error('Error updating settings:', e);
  }
}

disablePageForPosts();
