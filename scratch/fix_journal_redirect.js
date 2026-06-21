const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const auth = 'Basic ' + Buffer.from(process.env.WP_USERNAME + ':' + process.env.WP_APPLICATION_PASSWORD).toString('base64');
const WP = 'https://classytravelcouples.com/wp-json/wp/v2';

// Fix the WordPress "Posts page" setting so /blog/ works as a posts archive
// AND fix the journal redirect by checking the nav menu

async function run() {
  // 1. Set page_for_posts = 126 (blog page) so WP knows to use it as posts archive
  console.log('Setting WordPress Posts page to Blog page (ID 126)...');
  const settingsRes = await fetch('https://classytravelcouples.com/wp-json/wp/v2/settings', {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ page_for_posts: 126 })
  });
  if (settingsRes.ok) {
    console.log('✅ WP Posts page set to Blog (ID 126)');
  } else {
    console.log('ℹ️  Settings update skipped (may need admin access)');
  }

  // 2. Check all nav menus to find "Journal" menu item
  console.log('\nChecking nav menus for Journal link...');
  const menusRes = await fetch('https://classytravelcouples.com/wp-json/wp/v2/menus', { headers: { Authorization: auth } });
  if (menusRes.ok) {
    const menus = await menusRes.json();
    console.log('Menus found:', menus.map(m => m.name + '('+m.id+')').join(', '));
  } else {
    console.log('Menus API not available. Checking menu items via wp-api-menus...');
  }

  // 3. Find the Santorini post to understand redirect
  const santoriniRes = await fetch(`${WP}/posts?slug=santorini-couples-guide-2026`, { headers: { Authorization: auth } });
  const santoriniPosts = await santoriniRes.json();
  console.log('\nSantorini post:', santoriniPosts.length ? `ID:${santoriniPosts[0].id} | ${santoriniPosts[0].link}` : 'NOT FOUND');

  // 4. Check what "journal" points to — could be a tag or category
  const journalTagRes = await fetch(`${WP}/tags?slug=journal`, { headers: { Authorization: auth } });
  const journalTags = await journalTagRes.json();
  console.log('Journal tag:', journalTags.length ? JSON.stringify(journalTags[0]) : 'none');

  const journalCatRes = await fetch(`${WP}/categories?slug=journal`, { headers: { Authorization: auth } });
  const journalCats = await journalCatRes.json();
  console.log('Journal category:', journalCats.length ? JSON.stringify(journalCats[0]) : 'none');

  // 5. Check if there's a "journal" post type or custom post
  const journalPostRes = await fetch(`${WP}/posts?slug=journal`, { headers: { Authorization: auth } });
  const journalPosts = await journalPostRes.json();
  console.log('Journal post:', journalPosts.length ? `ID:${journalPosts[0].id} | ${journalPosts[0].link}` : 'none');

  // 6. Look at the blog page to see if it has Santorini redirect in it
  const blogPageRes = await fetch(`${WP}/pages/126`, { headers: { Authorization: auth } });
  const blogPage = await blogPageRes.json();
  const content = blogPage.content.rendered;
  const santoriniRef = content.indexOf('santorini');
  console.log('\nBlog page references Santorini at index:', santoriniRef);
  if (santoriniRef > -1) {
    console.log('Context:', content.substring(santoriniRef - 100, santoriniRef + 300));
  }
}

run().catch(console.error);
