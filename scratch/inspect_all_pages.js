const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const auth = 'Basic ' + Buffer.from(process.env.WP_USERNAME + ':' + process.env.WP_APPLICATION_PASSWORD).toString('base64');
const WP = 'https://classytravelcouples.com/wp-json/wp/v2';

async function run() {
  // Get destinations page
  const destRes = await fetch(`${WP}/pages?slug=destinations&per_page=1`, { headers: { Authorization: auth } });
  const [destPage] = await destRes.json();
  console.log('=== DESTINATIONS PAGE ===');
  console.log('ID:', destPage.id, '| Title:', destPage.title.rendered);
  console.log('Content length:', destPage.content.rendered.length);
  // Show first 3000 chars of rendered content
  const stripped = destPage.content.rendered.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  console.log('Text preview:', stripped.substring(0, 500));

  // Get all pages to find journal
  const pagesRes = await fetch(`${WP}/pages?per_page=100&status=any`, { headers: { Authorization: auth } });
  const pages = await pagesRes.json();
  console.log('\n=== ALL PAGES ===');
  pages.forEach(p => console.log(`  ID:${p.id} | Status:${p.status} | Slug:${p.slug} | Title:${p.title.rendered}`));

  // Check journal page specifically
  const journalRes = await fetch(`${WP}/pages?slug=journal&per_page=1`, { headers: { Authorization: auth } });
  const journalPages = await journalRes.json();
  console.log('\n=== JOURNAL PAGE ===');
  if (journalPages.length) {
    const j = journalPages[0];
    console.log('ID:', j.id, '| Template:', j.template, '| Link:', j.link);
    const strippedJ = j.content.rendered.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
    console.log('Content preview:', strippedJ.substring(0, 300));
  } else {
    console.log('No journal page found with slug "journal"');
  }

  // Check continent page slugs
  const continents = ['europe', 'asia', 'africa', 'americas', 'indian-ocean', 'middle-east'];
  console.log('\n=== CONTINENT PAGES ===');
  for (const slug of continents) {
    const res = await fetch(`${WP}/pages?slug=${slug}&per_page=1`, { headers: { Authorization: auth } });
    const pg = await res.json();
    if (pg.length) {
      console.log(`  ${slug}: ID=${pg[0].id} | Link=${pg[0].link} | ContentLen=${pg[0].content.rendered.length}`);
    } else {
      console.log(`  ${slug}: NOT FOUND`);
    }
  }
}

run().catch(console.error);
