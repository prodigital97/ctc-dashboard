const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const auth = 'Basic ' + Buffer.from(process.env.WP_USERNAME + ':' + process.env.WP_APPLICATION_PASSWORD).toString('base64');
const WP = 'https://classytravelcouples.com/wp-json/wp/v2';

const CONTINENT_PAGES = [
  { name: 'Europe',        id: 421, slug: 'europe',       file: 'europe_v2.html',       tag: 'destination-europe',       emoji: '🏛️' },
  { name: 'Asia',          id: 422, slug: 'asia',         file: 'asia_v2.html',         tag: 'destination-asia',         emoji: '🌏' },
  { name: 'Africa',        id: 423, slug: 'africa',       file: 'africa_v2.html',       tag: 'destination-africa',       emoji: '🌍' },
  { name: 'Middle East',   id: 424, slug: 'middle-east',  file: 'middle_east_v2.html',  tag: 'destination-middle-east',  emoji: '🕌' },
  { name: 'Indian Ocean',  id: 425, slug: 'indian-ocean', file: 'indian_ocean_v2.html', tag: 'destination-indian-ocean', emoji: '🌊' },
  { name: 'Americas',      id: 426, slug: 'americas',     file: 'americas_v2.html',     tag: 'destination-americas',     emoji: '🌎' }
];

const websitePagesDir = path.join(__dirname, '../website_pages');

// The dynamic blog section HTML and JavaScript
function buildBlogSectionHtml(dest) {
  return `
  <!-- ===== DYNAMIC RECENT BLOGS SECTION ===== -->
  <section class="ctc-section" style="background:#161616; padding: 80px 20px;">
    <div style="max-width:1200px; margin:0 auto;">
      <div style="margin-bottom:44px; text-align:left;">
        <p class="ctc-slabel" style="margin-bottom: 12px;">Recent Chronicles</p>
        <h2 class="ctc-stitle" style="margin:0;">
          ${dest.name.toUpperCase()}<br><span class="sc">chronicles</span>
        </h2>
      </div>
      <div id="ctc-blog-grid-${dest.slug}" class="ctc-dgrid" style="grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 28px;">
        <div style="grid-column:1/-1; text-align:center; padding:40px; color:#888;">Loading articles...</div>
      </div>
      <div style="text-align:center; margin-top:48px;">
        <a href="/blog/" class="ctc-btn-g" style="border:1px solid var(--gold); background:transparent; color:var(--gold);">
          View All Articles
        </a>
      </div>
    </div>
  </section>

  <script>
  (function() {
    var tagSlug = '${dest.tag}';
    var gridId = 'ctc-blog-grid-${dest.slug}';
    var apiBase = 'https://classytravelcouples.com/wp-json/wp/v2';

    function dec(s){
      return s.replace(/&#([0-9]+);/g,function(_,n){return String.fromCharCode(n);})
              .replace(/&amp;/g,'&').replace(/&#8217;/g,"'").replace(/&#038;/g,'&')
              .replace(/&#8211;/g,'–').replace(/&#8212;/g,'—').replace(/&[a-z]+;/g,'');
    }

    function renderCard(post) {
      var m = post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0];
      var img = m ? m.source_url : 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&h=500&q=80';
      var title = dec(post.title.rendered);
      var excerpt = post.excerpt ? post.excerpt.rendered.replace(/<[^>]+>/g, '').trim().substring(0, 110) + '...' : '';
      var cats = post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'][0] || [];
      var cat = cats.filter(function(c){return c.name!=='Uncategorized';})[0];

      return '<a href="' + post.link + '" class="ctc-dc" style="height:auto; min-height:380px; padding:0; background:#181818; display:flex; flex-direction:column; border:1px solid #1e1e1e; text-align:left;">' +
        '<div style="position:relative; height:200px; overflow:hidden;">' +
          '<div class="ctc-dc-img" style="background-image:url(\\'' + img + '\\'); position:absolute; inset:0; background-size:cover; background-position:center; filter:brightness(0.85); transition:transform 0.4s;"></div>' +
          (cat ? '<div style="position:absolute; top:12px; left:12px; background:rgba(201,168,108,0.9); color:#000; font-size:9px; letter-spacing:2px; text-transform:uppercase; padding:4px 9px; border-radius:2px; z-index:2; text-align:left;">' + cat.name + '</div>' : '') +
        '</div>' +
        '<div style="padding:20px; display:flex; flex-direction:column; flex:1; justify-content:space-between; position:relative; z-index:2; background:#181818; text-align:left;">' +
          '<div style="text-align:left;">' +
            '<h3 style="font-family:\\'Bebas Neue\\',sans-serif; font-size:22px; color:#fff; margin:0 0 10px; line-height:1.2; letter-spacing:1px; text-align:left;">' + title + '</h3>' +
            (excerpt ? '<p style="color:#888; font-size:12px; line-height:1.6; margin:0 0 16px; font-family:\\'DM Sans\\',sans-serif; text-align:left;">' + excerpt + '</p>' : '') +
          '</div>' +
          '<span style="color:var(--gold); font-size:10px; letter-spacing:2px; text-transform:uppercase; font-family:\\'DM Sans\\',sans-serif; font-weight:500; text-align:left;">Read More →</span>' +
        '</div>' +
      '</a>';
    }

    fetch(apiBase + '/tags?slug=' + tagSlug)
      .then(function(r){return r.json();})
      .then(function(tags) {
        if (!tags.length) {
          return fetch(apiBase + '/posts?status=publish&per_page=6&orderby=date&order=desc&_embed');
        }
        return fetch(apiBase + '/posts?status=publish&per_page=6&tags=' + tags[0].id + '&orderby=date&order=desc&_embed');
      })
      .then(function(r){return r.json();})
      .then(function(posts) {
        var grid = document.getElementById(gridId);
        if (!grid) return;
        if (!posts.length) {
          grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:#666;">No articles yet. Check back soon!</div>';
          return;
        }
        grid.innerHTML = posts.map(renderCard).join('');
        
        // Hover zoom animation
        var cards = grid.getElementsByClassName('ctc-dc');
        for(var i=0; i<cards.length; i++) {
          (function(c){
            var img = c.querySelector('.ctc-dc-img');
            c.addEventListener('mouseenter', function(){
              if(img) img.style.transform = 'scale(1.06)';
              c.style.borderColor = 'rgba(201,168,108,0.45)';
            });
            c.style.cursor = 'pointer';
            c.addEventListener('mouseleave', function(){
              if(img) img.style.transform = 'scale(1)';
              c.style.borderColor = '#1e1e1e';
            });
          })(cards[i]);
        }
      })
      .catch(function(e) {
        var grid = document.getElementById(gridId);
        if (grid) grid.innerHTML = '<div style="grid-column:1/-1; text-align:center; padding:40px; color:#666;">Unable to load articles.</div>';
      });
  })();
  </script>
  `;
}

function replaceExploreSection(html, dest) {
  const labelIdx = html.indexOf('<div class="ctc-slabel">Curated Escapes</div>');
  if (labelIdx === -1) {
    console.log(`[${dest.name}] Warning: No 'Curated Escapes' label found!`);
    return html;
  }
  
  const sectionStartIdx = html.lastIndexOf('<section class="ctc-section"', labelIdx);
  if (sectionStartIdx === -1) {
    console.log(`[${dest.name}] Warning: No section start found before 'Curated Escapes' label!`);
    return html;
  }
  
  const sectionEndIdx = html.indexOf('</section>', labelIdx);
  if (sectionEndIdx === -1) {
    console.log(`[${dest.name}] Warning: No section end found after 'Curated Escapes' label!`);
    return html;
  }
  
  const beforeSection = html.substring(0, sectionStartIdx);
  const afterSection = html.substring(sectionEndIdx + 10); // length of '</section>' is 10
  const blogSection = buildBlogSectionHtml(dest);
  
  return beforeSection + blogSection + afterSection;
}

async function rebuildContinentPage(dest) {
  const filePath = path.join(websitePagesDir, dest.file);
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File ${dest.file} not found locally.`);
    return;
  }
  
  const html = fs.readFileSync(filePath, 'utf8');
  
  // 1. Extract from font link
  const startIdx = html.indexOf('<link href="https://fonts.googleapis.com');
  if (startIdx === -1) {
    console.log(`❌ No Fonts link found in ${dest.file}`);
    return;
  }
  
  // 2. Find ctc-wrap start
  const ctcWrapIdx = html.indexOf('<div class="ctc-wrap">');
  if (ctcWrapIdx === -1) {
    console.log(`❌ No ctc-wrap starts in ${dest.file}`);
    return;
  }
  
  // 3. Trace div nesting to find closing tag of ctc-wrap
  let openDivs = 1;
  let pos = ctcWrapIdx + 22;
  while (openDivs > 0 && pos < html.length) {
    const nextOpen = html.indexOf('<div', pos);
    const nextClose = html.indexOf('</div>', pos);
    
    if (nextClose === -1) break;
    
    if (nextOpen !== -1 && nextOpen < nextClose) {
      openDivs++;
      pos = nextOpen + 4;
    } else {
      openDivs--;
      pos = nextClose + 6;
    }
  }
  
  const endIdx = pos;
  console.log(`[${dest.name}] Extracted custom block bounds: ${startIdx} -> ${endIdx}`);
  
  // Extract custom markup
  let customHtml = html.substring(startIdx, endIdx);
  
  // Replace the Curated Escapes section with the Blog Section
  const finalContent = replaceExploreSection(customHtml, dest);
  
  console.log(`[${dest.name}] Final content length: ${finalContent.length} chars.`);
  
  // Push to WordPress
  const res = await fetch(`${WP}/pages/${dest.id}`, {
    method: 'POST',
    headers: {
      'Authorization': auth,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      content: finalContent
    })
  });
  
  if (res.ok) {
    console.log(`✅ Successfully rebuilt and updated ${dest.name} page (ID ${dest.id})!`);
  } else {
    console.error(`❌ Failed to update ${dest.name} page (ID ${dest.id}):`, res.statusText);
    console.log(await res.text());
  }
}

async function run() {
  console.log('🔧 Rebuilding all 6 Continent pages...\n');
  for (const dest of CONTINENT_PAGES) {
    await rebuildContinentPage(dest);
    console.log();
    await new Promise(r => setTimeout(r, 400));
  }
  console.log('✨ All 6 Continent pages successfully rebuilt!');
}

run().catch(console.error);
