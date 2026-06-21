require('dotenv').config({ path: '../.env' });
const wpUrl = process.env.WP_URL || 'https://classytravelcouples.com';
const wpUsername = process.env.WP_USERNAME || 'duttapronoy97@gmail.com';
const wpPassword = process.env.WP_APPLICATION_PASSWORD || 'Sajal@25021997';

const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
const authHeader = `Basic ${base64Auth}`;

async function reschedule() {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  console.log('Fetching scheduled posts...');
  
  try {
    const res = await fetch(`${cleanWpUrl}/wp-json/wp/v2/posts?status=future&per_page=100&orderby=date&order=asc`, {
      headers: { 'Authorization': authHeader }
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch posts: ${res.statusText}`);
    }
    
    const posts = await res.json();
    console.log(`Found ${posts.length} scheduled posts.`);
    
    // Set start time: 2 minutes from now
    const startTime = new Date();
    startTime.setMinutes(startTime.getMinutes() + 2);
    
    for (let i = 0; i < posts.length; i++) {
      const post = posts[i];
      // Space each post by 45 minutes
      const newDate = new Date(startTime.getTime() + i * 45 * 60 * 1000);
      
      // format to WordPress ISO 8601 (YYYY-MM-DDTHH:MM:SS) in UTC time
      const year = newDate.getUTCFullYear();
      const month = String(newDate.getUTCMonth() + 1).padStart(2, '0');
      const day = String(newDate.getUTCDate()).padStart(2, '0');
      const hours = String(newDate.getUTCHours()).padStart(2, '0');
      const minutes = String(newDate.getUTCMinutes()).padStart(2, '0');
      const seconds = String(newDate.getUTCSeconds()).padStart(2, '0');
      
      const dateStr = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
      
      console.log(`Rescheduling post ID ${post.id} "${post.title.rendered}" to ${dateStr}`);
      
      const updateRes = await fetch(`${cleanWpUrl}/wp-json/wp/v2/posts/${post.id}`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          date: dateStr
        })
      });
      
      if (updateRes.ok) {
        console.log(` -> Successfully rescheduled.`);
      } else {
        console.error(` -> Failed:`, await updateRes.text());
      }
      
      // Brief pause to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    console.log('All posts rescheduled successfully!');
  } catch (err) {
    console.error('Error rescheduling posts:', err.message);
  }
}

reschedule();
