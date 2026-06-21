const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const auth = 'Basic ' + Buffer.from(process.env.WP_USERNAME + ':' + process.env.WP_APPLICATION_PASSWORD).toString('base64');
const WP = 'https://classytravelcouples.com/wp-json/wp/v2';

// Destination page config: WP page slug -> tag slug for filtering
const DESTINATION_PAGES = [
  { name: 'Africa',       pageSlug: 'africa',       tagSlug: 'destination-africa',      emoji: '🌍' },
  { name: 'Europe',       pageSlug: 'europe',       tagSlug: 'destination-europe',      emoji: '🏛️' },
  { name: 'Asia',         pageSlug: 'asia',         tagSlug: 'destination-asia',        emoji: '🌏' },
  { name: 'Americas',     pageSlug: 'americas',     tagSlug: 'destination-americas',    emoji: '🌎' },
  { name: 'Indian Ocean', pageSlug: 'indian-ocean', tagSlug: 'destination-indian-ocean', emoji: '🌊' },
  { name: 'Middle East',  pageSlug: 'middle-east',  tagSlug: 'destination-middle-east', emoji: '🕌' },
];

// The dynamic blog section HTML+JS to inject into each destination page
function buildBlogSection(dest) {
  return `
<!-- ===== DYNAMIC FEATURED BLOGS SECTION ===== -->
<section id="ctc-dest-blogs-${dest.pageSlug}" style="
  background: #0a0a0a;
  padding: 80px 20px;
  font-family: 'DM Sans', sans-serif;
">
  <div style="max-width:1200px; margin:0 auto;">
    <div style="text-align:center; margin-bottom:50px;">
      <p style="color:#c9a96e; letter-spacing:4px; font-size:12px; text-transform:uppercase; margin:0 0 12px;">Featured Articles</p>
      <h2 style="color:#fff; font-family:'Bebas Neue',sans-serif; font-size:clamp(36px,5vw,56px); margin:0; letter-spacing:2px;">
        ${dest.emoji} Discover ${dest.name}
      </h2>
    </div>
    <div id="ctc-blog-grid-${dest.pageSlug}" style="
      display:grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap:28px;
    ">
      <!-- Posts load here dynamically -->
      <div style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">Loading articles...</div>
    </div>
    <div style="text-align:center; margin-top:48px;">
      <a href="/blog/" style="
        display:inline-block;
        padding:16px 42px;
        background:transparent;
        border:1px solid #c9a96e;
        color:#c9a96e;
        text-decoration:none;
        font-size:13px;
        letter-spacing:3px;
        text-transform:uppercase;
        transition:all 0.3s;
      " onmouseover="this.style.background='#c9a96e';this.style.color='#000';"
         onmouseout="this.style.background='transparent';this.style.color='#c9a96e';">
        View All Articles
      </a>
    </div>
  </div>
</section>

<script>
(function() {
  var tagSlug = '${dest.tagSlug}';
  var gridId = 'ctc-blog-grid-${dest.pageSlug}';
  var apiBase = 'https://classytravelcouples.com/wp-json/wp/v2';

  function formatDate(d) {
    return new Date(d).toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
  }

  function renderCard(post) {
    var img = (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0])
      ? post._embedded['wp:featuredmedia'][0].source_url
      : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&h=500&q=80';
    var title = post.title.rendered.replace(/&#[0-9]+;/g, '').replace(/&amp;/g, '&').replace(/&[a-z]+;/g, '');
    var excerpt = post.excerpt ? post.excerpt.rendered.replace(/<[^>]+>/g, '').substring(0, 120) + '...' : '';
    var cats = (post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0])
      ? post._embedded['wp:term'][0].map(function(c){return c.name;}).join(' · ')
      : '';

    return '<a href="' + post.link + '" style="text-decoration:none;display:block;" target="_blank">' +
      '<article style="background:#111;border-radius:12px;overflow:hidden;transition:transform 0.3s,box-shadow 0.3s;cursor:pointer;" ' +
        'onmouseover="this.style.transform=\'translateY(-6px)\';this.style.boxShadow=\'0 20px 60px rgba(201,169,110,0.15)\'" ' +
        'onmouseout="this.style.transform=\'translateY(0)\';this.style.boxShadow=\'none\'">' +
        '<div style="position:relative;height:220px;overflow:hidden;">' +
          '<img src="' + img + '" alt="' + title + '" loading="lazy" style="width:100%;height:100%;object-fit:cover;transition:transform 0.4s;" ' +
            'onmouseover="this.style.transform=\'scale(1.06)\'" onmouseout="this.style.transform=\'scale(1)\'">' +
          (cats ? '<div style="position:absolute;top:14px;left:14px;background:rgba(201,169,110,0.9);color:#000;font-size:10px;letter-spacing:2px;text-transform:uppercase;padding:5px 12px;border-radius:4px;">' + cats.split(' · ')[0] + '</div>' : '') +
        '</div>' +
        '<div style="padding:22px 24px 26px;">' +
          '<h3 style="color:#fff;font-family:\'Bebas Neue\',sans-serif;font-size:22px;margin:0 0 10px;line-height:1.3;letter-spacing:1px;">' + title + '</h3>' +
          (excerpt ? '<p style="color:#aaa;font-size:13px;line-height:1.6;margin:0 0 16px;">' + excerpt + '</p>' : '') +
          '<span style="color:#c9a96e;font-size:11px;letter-spacing:2px;text-transform:uppercase;">Read More →</span>' +
        '</div>' +
      '</article>' +
    '</a>';
  }

  fetch(apiBase + '/tags?slug=' + tagSlug)
    .then(function(r){return r.json();})
    .then(function(tags) {
      if (!tags.length) {
        // Fallback: show latest posts if no tag found
        return fetch(apiBase + '/posts?status=publish&per_page=6&orderby=date&order=desc&_embed');
      }
      return fetch(apiBase + '/posts?status=publish&per_page=6&tags=' + tags[0].id + '&orderby=date&order=desc&_embed');
    })
    .then(function(r){return r.json();})
    .then(function(posts) {
      var grid = document.getElementById(gridId);
      if (!grid) return;
      if (!posts.length) {
        grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#666;">No articles yet. Check back soon!</div>';
        return;
      }
      grid.innerHTML = posts.map(renderCard).join('');
    })
    .catch(function(e) {
      var grid = document.getElementById(gridId);
      if (grid) grid.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:40px;color:#666;">Unable to load articles.</div>';
    });
})();
</script>
<!-- ===== END DYNAMIC FEATURED BLOGS SECTION ===== -->
`;
}

async function getPageBySlug(slug) {
  const res = await fetch(`${WP}/pages?slug=${slug}&per_page=1`, {
    headers: { Authorization: auth }
  });
  const pages = await res.json();
  return pages[0] || null;
}

async function updatePageContent(pageId, currentContent, newSection) {
  // Check if already injected
  if (currentContent.includes('ctc-dest-blogs-')) {
    // Remove old section and replace with new
    currentContent = currentContent.replace(/<!-- ===== DYNAMIC FEATURED BLOGS SECTION ===== -->[\s\S]*?<!-- ===== END DYNAMIC FEATURED BLOGS SECTION ===== -->/g, '');
  }
  const updatedContent = currentContent + '\n' + newSection;

  const res = await fetch(`${WP}/pages/${pageId}`, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content: updatedContent })
  });

  return res.ok;
}

async function run() {
  console.log('🔧 Injecting dynamic blog sections into destination pages...\n');

  for (const dest of DESTINATION_PAGES) {
    console.log(`[${dest.emoji} ${dest.name}] Finding page slug "${dest.pageSlug}"...`);
    const page = await getPageBySlug(dest.pageSlug);

    if (!page) {
      console.log(`  ❌ Page not found for slug: ${dest.pageSlug}`);
      console.log(`  -> Trying parent "destinations" page...`);
      continue;
    }

    console.log(`  Found: "${page.title.rendered}" (ID: ${page.id})`);
    const currentContent = page.content.rendered || '';
    const newSection = buildBlogSection(dest);

    const ok = await updatePageContent(page.id, currentContent, newSection);
    if (ok) {
      console.log(`  ✅ Dynamic blog section injected!`);
    } else {
      console.log(`  ❌ Failed to update page.`);
    }
    await new Promise(r => setTimeout(r, 500));
    console.log();
  }

  console.log('✨ All destination pages updated with dynamic blog sections!');
  console.log('\nBlogs will now appear automatically based on destination tags.');
  console.log('As new posts are tagged with destination-africa, destination-europe, etc., they will auto-appear.');
}

run().catch(console.error);
