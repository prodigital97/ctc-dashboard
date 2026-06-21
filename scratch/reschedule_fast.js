require('dotenv').config({ path: '../.env' });

const wpUrl = process.env.WP_URL || 'https://classytravelcouples.com';
const wpUsername = process.env.WP_USERNAME || 'duttapronoy97@gmail.com';
const wpPassword = process.env.WP_APPLICATION_PASSWORD || 'Sajal@25021997';

const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
const authHeader = `Basic ${base64Auth}`;

// Target: 30 posts per day = 48 minutes apart
// This is a good middle-ground between 20 and 40 posts/day
const MINUTES_PER_POST = 48;
const START_OFFSET_MINUTES = 2; // First post goes live in 2 minutes

async function rescheduleAll() {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  console.log('Fetching all scheduled (future) posts...');

  const res = await fetch(
    `${cleanWpUrl}/wp-json/wp/v2/posts?status=future&per_page=100&orderby=date&order=asc`,
    { headers: { 'Authorization': authHeader } }
  );

  if (!res.ok) throw new Error(`Failed to fetch posts: ${res.statusText}`);
  const posts = await res.json();
  console.log(`Found ${posts.length} scheduled posts to reschedule.`);

  // Start time: 2 minutes from now (UTC)
  const startTime = new Date();
  startTime.setUTCMinutes(startTime.getUTCMinutes() + START_OFFSET_MINUTES);

  const totalDays = (posts.length * MINUTES_PER_POST) / (60 * 24);
  console.log(`\nSchedule plan:`);
  console.log(`  Interval: every ${MINUTES_PER_POST} minutes`);
  console.log(`  Posts: ${posts.length}`);
  console.log(`  Will complete in: ~${totalDays.toFixed(1)} days`);
  console.log(`  Rate: ~${(60 * 24 / MINUTES_PER_POST).toFixed(0)} posts/day\n`);

  for (let i = 0; i < posts.length; i++) {
    const post = posts[i];
    const newDate = new Date(startTime.getTime() + i * MINUTES_PER_POST * 60 * 1000);

    // Format to WordPress ISO 8601 (YYYY-MM-DDTHH:MM:SS) in UTC
    const year = newDate.getUTCFullYear();
    const month = String(newDate.getUTCMonth() + 1).padStart(2, '0');
    const day = String(newDate.getUTCDate()).padStart(2, '0');
    const hours = String(newDate.getUTCHours()).padStart(2, '0');
    const minutes = String(newDate.getUTCMinutes()).padStart(2, '0');
    const seconds = String(newDate.getUTCSeconds()).padStart(2, '0');

    const dateStr = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
    const localDisplay = newDate.toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    console.log(`[${i + 1}/${posts.length}] ID ${post.id}: "${post.title.rendered.substring(0, 60)}..."`);
    console.log(`  -> Scheduled UTC: ${dateStr} | IST: ${localDisplay}`);

    const updateRes = await fetch(`${cleanWpUrl}/wp-json/wp/v2/posts/${post.id}`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ date: dateStr })
    });

    if (updateRes.ok) {
      console.log(`  -> OK`);
    } else {
      console.error(`  -> FAILED:`, await updateRes.text());
    }

    await new Promise(resolve => setTimeout(resolve, 300));
  }

  console.log('\nAll posts rescheduled at 30/day pace!');
  console.log('First post goes live in ~2 minutes from now.');
}

rescheduleAll().catch(console.error);
