require('dotenv').config({ path: '../.env' });
const wpUrl = process.env.WP_URL || 'https://classytravelcouples.com';
const wpUsername = process.env.WP_USERNAME || 'duttapronoy97@gmail.com';
const wpPassword = process.env.WP_APPLICATION_PASSWORD || 'Sajal@25021997';

const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
const authHeader = `Basic ${base64Auth}`;

async function checkSchedules() {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  const url = `${cleanWpUrl}/wp-json/wp/v2/posts?status=future&per_page=100&orderby=date&order=asc`;
  try {
    const response = await fetch(url, { headers: { 'Authorization': authHeader } });
    const posts = await response.json();
    console.log(`Found ${posts.length} scheduled posts.`);
    
    // Group posts by day
    const dayMap = {};
    posts.forEach(p => {
      const dateStr = p.date; // e.g. "2026-05-28T05:35:00"
      const day = dateStr.split('T')[0];
      if (!dayMap[day]) dayMap[day] = [];
      dayMap[day].push({ id: p.id, title: p.title.rendered, time: dateStr.split('T')[1] });
    });
    
    console.log('\n--- Scheduled Posts Grouped by Day ---');
    for (const [day, list] of Object.entries(dayMap)) {
      console.log(`Day: ${day} (${list.length} posts)`);
      list.forEach(item => {
        console.log(`  - Time: ${item.time} | ID: ${item.id} | Title: ${item.title}`);
      });
    }
  } catch (err) {
    console.error(err.message);
  }
}

checkSchedules();
