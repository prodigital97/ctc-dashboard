require('dotenv').config({ path: '../.env' });
const wpUrl = process.env.WP_URL || 'https://classytravelcouples.com';
const wpUsername = process.env.WP_USERNAME || 'duttapronoy97@gmail.com';
const wpPassword = process.env.WP_APPLICATION_PASSWORD || 'Sajal@25021997';

const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
const authHeader = `Basic ${base64Auth}`;

async function getPublishedPosts() {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  const url = `${cleanWpUrl}/wp-json/wp/v2/posts?status=publish&per_page=10`;
  try {
    const response = await fetch(url, { headers: { 'Authorization': authHeader } });
    const posts = await response.json();
    console.log(posts.map(p => ({ id: p.id, title: p.title.rendered, link: p.link })));
  } catch (err) {
    console.error(err.message);
  }
}

getPublishedPosts();
