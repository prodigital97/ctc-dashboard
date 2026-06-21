const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const auth = 'Basic ' + Buffer.from(process.env.WP_USERNAME + ':' + process.env.WP_APPLICATION_PASSWORD).toString('base64');
const WP = 'https://classytravelcouples.com/wp-json/wp/v2';

// ─── DESTINATIONS PAGE CONTENT ───────────────────────────────────────────────
const DESTINATIONS = [
  { key:'europe',       tag:'destination-europe',       pageUrl:'/europe/',
    label:'Old World Romance',     title:'EUROPE',       subtitle:'chronicles',
    blurb:'Cobblestone alleys, Michelin bistros, and timeless skylines for the discerning couple.',
    hero:'https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1200&auto=format&fit=crop&q=85' },
  { key:'asia',         tag:'destination-asia',         pageUrl:'/asia/',
    label:'Mystical & Exotic',     title:'ASIA',         subtitle:'adventures',
    blurb:'Ancient temples, jungle villas, and turquoise seas — for couples who crave the extraordinary.',
    hero:'https://images.unsplash.com/photo-1528360983277-13d401cdc186?w=1200&auto=format&fit=crop&q=85' },
  { key:'indian-ocean', tag:'destination-indian-ocean', pageUrl:'/indian-ocean/',
    label:'Turquoise Paradise',    title:'INDIAN OCEAN', subtitle:'hideaways',
    blurb:'Overwater villas, powder-white sands, and the world\'s most secluded island sanctuaries.',
    hero:'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&auto=format&fit=crop&q=85' },
  { key:'africa',       tag:'destination-africa',       pageUrl:'/africa/',
    label:'Wild & Untamed',        title:'AFRICA',       subtitle:'stories',
    blurb:'Dramatic coastlines, safari sunrises, and the continent\'s most epic romantic encounters.',
    hero:'https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=1200&auto=format&fit=crop&q=85' },
  { key:'americas',     tag:'destination-americas',     pageUrl:'/americas/',
    label:'Majestic New World',    title:'THE AMERICAS', subtitle:'journeys',
    blurb:'Caribbean shores, redwood forests, and urban romance — bold destinations for bold couples.',
    hero:'https://images.unsplash.com/photo-1489824904134-891ab64532f1?w=1200&auto=format&fit=crop&q=85' },
  { key:'middle-east',  tag:'destination-middle-east',  pageUrl:'/middle-east/',
    label:'Opulent & Timeless',    title:'MIDDLE EAST',  subtitle:'revelations',
    blurb:'Desert palaces, ancient spice routes, and ultra-luxury that redefines indulgence.',
    hero:'https://images.unsplash.com/photo-1540541338441-85829ac3cd98?w=1200&auto=format&fit=crop&q=85' },
];

function buildDestSection(d) {
  return `
        <section class="ctc-dsec" id="dest-${d.key}">
          <div class="ctc-dsec-inner">
            <div class="ctc-dsec-hero" style="background-image:url('${d.hero}')">
              <div class="ctc-dsec-herograd"></div>
            </div>
            <div class="ctc-dsec-body">
              <div class="ctc-dsec-top">
                <div class="ctc-dsec-left">
                  <div class="ctc-slabel">${d.label}</div>
                  <h2 class="ctc-stitle">
                    <a href="${d.pageUrl}" class="ctc-stitle-a">${d.title}</a>
                    <span class="ctc-sc">${d.subtitle}</span>
                  </h2>
                  <p class="ctc-sdesc">${d.blurb}</p>
                </div>
                <a href="${d.pageUrl}" class="ctc-explore-btn">EXPLORE</a>
              </div>
              <div id="blog-grid-${d.key}" class="ctc-bgrid"><div class="ctc-loading">Loading…</div></div>
              <a href="${d.pageUrl}" class="ctc-viewall">Browse all ${d.title} articles →</a>
            </div>
          </div>
        </section>`;
}

function buildDestinationsContent() {
  const tagLoaders = DESTINATIONS.map(d =>
    `loadBlogs('${d.key}','${d.tag}');`
  ).join('\n    ');

  return `<link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
.ctc-dw{font-family:'DM Sans',sans-serif;background:#0a0a0a;color:#fff;overflow-x:hidden}
.ctc-dw *{box-sizing:border-box;margin:0;padding:0}
.ctc-dw a{color:inherit !important;text-decoration:none !important}
.ctc-dw a:hover{color:#C9A86C !important}
:root{--gd:#C9A86C;--gd2:#EDD9A3;--blk:#0a0a0a;--pnl:#141414;--mut:#777}

/* HERO */
.ctc-dhero{min-height:56vh;position:relative;display:flex;align-items:flex-end;overflow:hidden}
.ctc-dhero-bg{position:absolute;inset:0;background:url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=1800&auto=format&fit=crop&q=90') center/cover;filter:brightness(.38)}
.ctc-dhero-gr{position:absolute;inset:0;background:linear-gradient(to top,#0a0a0a 0%,rgba(10,10,10,.2) 55%,transparent 100%)}
.ctc-dhero-c{position:relative;z-index:2;padding:0 72px 72px}
.ctc-deyebrow{font-size:10px;letter-spacing:5px;text-transform:uppercase;color:var(--gd);margin-bottom:18px;display:flex;align-items:center;gap:14px}
.ctc-deyebrow::before{content:'';width:28px;height:1px;background:var(--gd)}
.ctc-dh1{font-family:'Bebas Neue',sans-serif;font-size:clamp(64px,9vw,116px);line-height:.9;letter-spacing:2px;color:#fff}
.ctc-dscript{font-family:'Abril Fatface',serif;font-size:clamp(38px,5.5vw,66px);color:var(--gd2);display:block;line-height:1.15}
.ctc-dherosub{font-size:14px;line-height:1.9;color:rgba(255,255,255,.45);max-width:500px;font-weight:300;margin-top:18px}

/* DESTINATION SECTIONS */
.ctc-dsec{border-bottom:1px solid #1a1a1a}
.ctc-dsec:nth-child(odd){background:#0d0d0d}
.ctc-dsec:nth-child(even){background:#111}
.ctc-dsec-inner{max-width:1280px;margin:0 auto;padding:72px 48px}
.ctc-dsec-hero{width:100%;height:280px;border-radius:6px;background-size:cover;background-position:center;position:relative;margin-bottom:44px;overflow:hidden}
.ctc-dsec-herograd{position:absolute;inset:0;background:linear-gradient(135deg,rgba(10,10,10,.7) 0%,transparent 60%)}
.ctc-dsec-body{}
.ctc-dsec-top{display:flex;align-items:flex-end;justify-content:space-between;margin-bottom:36px;gap:20px;flex-wrap:wrap}
.ctc-dsec-left{}
.ctc-slabel{font-size:9px;letter-spacing:4px;text-transform:uppercase;color:var(--gd);margin-bottom:10px;display:flex;align-items:center;gap:10px}
.ctc-slabel::before{content:'';width:20px;height:1px;background:var(--gd)}
.ctc-stitle{font-family:'Bebas Neue',sans-serif;font-size:clamp(40px,5vw,64px);line-height:.95;letter-spacing:2px}
.ctc-stitle-a{color:#fff;text-decoration:none;transition:color .2s}
.ctc-stitle-a:hover{color:var(--gd)}
.ctc-sc{font-family:'Abril Fatface',serif;font-size:clamp(22px,3vw,38px);color:var(--gd2);display:block;line-height:1.2;font-weight:400}
.ctc-sdesc{font-size:13px;color:rgba(255,255,255,.45);line-height:1.75;max-width:420px;margin-top:10px;font-weight:300}
.ctc-explore-btn{display:inline-block;padding:12px 28px;border:1px solid var(--gd);color:var(--gd);font-size:10px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;white-space:nowrap;transition:all .25s;flex-shrink:0;align-self:center}
.ctc-explore-btn:hover{background:var(--gd);color:#000}

/* BLOG GRID */
.ctc-bgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(290px,1fr));gap:20px;margin-bottom:32px}
.ctc-loading,.ctc-empty{grid-column:1/-1;text-align:center;padding:48px 20px;color:#444;font-size:12px;letter-spacing:2px}

/* BLOG CARD */
.ctc-bc{display:block;text-decoration:none;background:#1a1a1a;border-radius:4px;overflow:hidden;transition:transform .28s,box-shadow .28s;color:#fff !important;text-align:left !important}
.ctc-bc:hover{transform:translateY(-5px);box-shadow:0 18px 48px rgba(201,168,108,.13)}
.ctc-bc-img{height:195px;overflow:hidden;position:relative;background:#222}
.ctc-bc-img img{width:100%;height:100%;object-fit:cover;transition:transform .38s;display:block}
.ctc-bc:hover .ctc-bc-img img{transform:scale(1.06)}
.ctc-bc-tag{position:absolute;top:10px;left:10px;background:rgba(201,168,108,.88);color:#000;font-size:9px;letter-spacing:2px;text-transform:uppercase;padding:4px 9px;border-radius:2px}
.ctc-bc-body{padding:18px 20px 22px;text-align:left !important}
.ctc-bc-title{font-family:'Bebas Neue',sans-serif;font-size:19px;color:#fff !important;line-height:1.25;letter-spacing:1px;margin-bottom:8px;text-align:left !important}
.ctc-bc-ex{font-size:12px;color:#777 !important;line-height:1.6;margin-bottom:12px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;text-align:left !important}
.ctc-bc-cta{font-size:10px;color:var(--gd) !important;letter-spacing:2px;text-transform:uppercase;text-align:left !important}

/* VIEW ALL */
.ctc-viewall{display:inline-flex;align-items:center;gap:8px;font-size:10px;letter-spacing:3px;text-transform:uppercase;color:#555;text-decoration:none;transition:color .2s}
.ctc-viewall:hover{color:var(--gd)}
.ctc-viewall::after{content:'→';transition:transform .2s}
.ctc-viewall:hover::after{transform:translateX(4px)}

/* CTA */
.ctc-dcta{padding:96px 48px;background:#060606;text-align:center;border-top:1px solid #181818}
.ctc-dcta-ttl{font-family:'Bebas Neue',sans-serif;font-size:clamp(34px,5vw,58px);color:#fff;letter-spacing:3px;margin-bottom:14px}
.ctc-dcta-sub{font-size:13px;color:#666;line-height:1.8;max-width:460px;margin:0 auto 34px;font-weight:300}
.ctc-dcta-btn{display:inline-block;padding:15px 42px;background:var(--gd);color:#000;font-size:11px;letter-spacing:3px;text-transform:uppercase;text-decoration:none;font-weight:500;transition:background .2s}
.ctc-dcta-btn:hover{background:var(--gd2)}

@media(max-width:768px){
  .ctc-dhero-c,.ctc-dsec-inner{padding:0 24px 48px}
  .ctc-dsec-inner{padding:48px 24px}
  .ctc-dsec-hero{height:180px}
  .ctc-bgrid{grid-template-columns:1fr}
  .ctc-dsec-top{flex-direction:column;align-items:flex-start}
  .ctc-dcta{padding:60px 24px}
}
</style>

<div class="ctc-dw">
  <div class="ctc-dhero">
    <div class="ctc-dhero-bg"></div>
    <div class="ctc-dhero-gr"></div>
    <div class="ctc-dhero-c">
      <div class="ctc-deyebrow">Where Will You Go Next</div>
      <h1 class="ctc-dh1">THE<br><span class="ctc-dscript">destinations</span></h1>
      <p class="ctc-dherosub">Six continents of curated couple-first travel — from ancient European chronicles to Indian Ocean hideaways and beyond.</p>
    </div>
  </div>

  <div id="ctc-dest-sections">
${DESTINATIONS.map(buildDestSection).join('')}
  </div>

  <div class="ctc-dcta">
    <p style="font-size:10px;letter-spacing:4px;text-transform:uppercase;color:var(--gd);margin-bottom:14px">Plan With Us</p>
    <h2 class="ctc-dcta-ttl">LET'S DESIGN YOUR ESCAPE</h2>
    <p class="ctc-dcta-sub">Tell us your dream destination, travel style, and budget — we'll craft a bespoke itinerary just for the two of you.</p>
    <a href="/contact/" class="ctc-dcta-btn">FREE TRIP PLANNER →</a>
  </div>
</div>

<script>
(function(){
  var API = 'https://classytravelcouples.com/wp-json/wp/v2';

  function dec(s){
    return s.replace(/&#([0-9]+);/g,function(_,n){return String.fromCharCode(n);})
            .replace(/&amp;/g,'&').replace(/&quot;/g,'"').replace(/&#8217;/g,"'")
            .replace(/&#038;/g,'&').replace(/&#8211;/g,'–').replace(/&#8212;/g,'—')
            .replace(/&[a-z]+;/g,'');
  }

  function card(p){
    var m=p._embedded&&p._embedded['wp:featuredmedia']&&p._embedded['wp:featuredmedia'][0];
    var img=m?m.source_url:'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop&q=75';
    var title=dec(p.title.rendered);
    var ex=p.excerpt?p.excerpt.rendered.replace(/<[^>]+>/g,'').trim().substring(0,105)+'…':'';
    var cats=p._embedded&&p._embedded['wp:term']&&p._embedded['wp:term'][0]||[];
    var cat=cats.filter(function(c){return c.name!=='Uncategorized';})[0];
    return '<a href="'+p.link+'" class="ctc-bc" style="text-align:left;">'+
      '<div class="ctc-bc-img">'+
        '<img src="'+img+'" alt="'+title+'" loading="lazy">'+
        (cat?'<div class="ctc-bc-tag">'+cat.name+'</div>':'')+
      '</div>'+
      '<div class="ctc-bc-body" style="text-align:left;">'+
        '<div class="ctc-bc-title" style="text-align:left;">'+title+'</div>'+
        (ex?'<div class="ctc-bc-ex" style="text-align:left;">'+ex+'</div>':'')+
        '<div class="ctc-bc-cta" style="text-align:left;">Read the Guide →</div>'+
      '</div>'+
    '</a>';
  }

  function loadBlogs(key,tagSlug){
    var grid=document.getElementById('blog-grid-'+key);
    if(!grid)return;
    fetch(API+'/tags?slug='+tagSlug)
      .then(function(r){return r.json();})
      .then(function(tags){
        if(!tags.length){
          return fetch(API+'/posts?status=publish&per_page=3&orderby=date&order=desc&_embed');
        }
        return fetch(API+'/posts?status=publish&per_page=3&tags='+tags[0].id+'&orderby=date&order=desc&_embed');
      })
      .then(function(r){return r.json();})
      .then(function(posts){
        if(!posts.length){
          grid.innerHTML='<div class="ctc-empty">✈️ Articles coming soon!</div>';
          return;
        }
        grid.innerHTML=posts.map(card).join('');
      })
      .catch(function(){
        grid.innerHTML='<div class="ctc-empty">Unable to load articles.</div>';
      });
  }

  ${tagLoaders}
})();
</script>`;
}

// ─── BLOG/JOURNAL PAGE CONTENT ────────────────────────────────────────────────
function buildBlogContent() {
  return `<link href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Bebas+Neue&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<style>
.ctc-bw{font-family:'DM Sans',sans-serif;background:#0a0a0a;color:#fff;overflow-x:hidden}
.ctc-bw *{box-sizing:border-box;margin:0;padding:0}
.ctc-bw a{color:inherit !important;text-decoration:none !important}
.ctc-bw a:hover{color:#C9A86C !important}
:root{--gd:#C9A86C;--gd2:#EDD9A3;--mut:#777;--pnl:#141414}

/* HERO */
.ctc-bhero{min-height:50vh;position:relative;display:flex;align-items:flex-end;overflow:hidden}
.ctc-bhero-bg{position:absolute;inset:0;background:url('https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1800&auto=format&fit=crop&q=90') center/cover;filter:brightness(.35)}
.ctc-bhero-gr{position:absolute;inset:0;background:linear-gradient(to top,#0a0a0a 0%,rgba(10,10,10,.15) 55%,transparent 100%)}
.ctc-bhero-c{position:relative;z-index:2;padding:0 72px 64px}
.ctc-bey{font-size:10px;letter-spacing:5px;text-transform:uppercase;color:var(--gd);margin-bottom:16px;display:flex;align-items:center;gap:14px}
.ctc-bey::before{content:'';width:28px;height:1px;background:var(--gd)}
.ctc-bh1{font-family:'Bebas Neue',sans-serif;font-size:clamp(64px,9vw,110px);line-height:.9;letter-spacing:2px}
.ctc-bscript{font-family:'Abril Fatface',serif;font-size:clamp(36px,5vw,62px);color:var(--gd2);display:block;line-height:1.15}
.ctc-bsub{font-size:14px;line-height:1.9;color:rgba(255,255,255,.45);max-width:480px;margin-top:18px;font-weight:300}

/* FILTER BAR */
.ctc-filters{padding:30px 72px 24px;background:#0f0f0f;border-bottom:1px solid #1a1a1a;position:sticky;top:0;z-index:100}
.ctc-fscroll{display:flex;gap:8px;overflow-x:auto;scrollbar-width:thin;scrollbar-color:var(--gd) #1a1a1a}
.ctc-fscroll::-webkit-scrollbar{height:3px}
.ctc-fscroll::-webkit-scrollbar-thumb{background:var(--gd)}
.ctc-fbtn{padding:8px 18px;background:transparent;border:1px solid #252525;color:#666;font-family:'DM Sans',sans-serif;font-size:10px;letter-spacing:2px;text-transform:uppercase;cursor:pointer;white-space:nowrap;transition:all .2s}
.ctc-fbtn:hover,.ctc-fbtn.active{background:var(--gd);color:#000;border-color:var(--gd)}

/* SEARCH */
.ctc-search-wrap{padding:32px 72px;background:#0d0d0d;border-bottom:1px solid #1a1a1a}
.ctc-search{display:flex;gap:0;max-width:520px}
.ctc-search input{flex:1;background:#1a1a1a;border:1px solid #252525;border-right:none;color:#fff;padding:12px 18px;font-family:'DM Sans',sans-serif;font-size:13px;outline:none}
.ctc-search input::placeholder{color:#444}
.ctc-search input:focus{border-color:var(--gd)}
.ctc-search button{background:var(--gd);border:none;color:#000;padding:12px 22px;cursor:pointer;font-size:12px;letter-spacing:2px;text-transform:uppercase;font-weight:500;transition:background .2s}
.ctc-search button:hover{background:var(--gd2)}

/* MAIN GRID SECTION */
.ctc-bmain{padding:60px 72px 80px;max-width:1320px;margin:0 auto}
.ctc-blog-count{font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#444;margin-bottom:32px}
.ctc-blog-count span{color:var(--gd)}
.ctc-bgrid2{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:24px}
.ctc-loading2,.ctc-empty2{grid-column:1/-1;text-align:center;padding:80px 20px;color:#444;font-size:13px;letter-spacing:2px}

/* BLOG CARD */
.ctc-jcard{display:block;text-decoration:none;background:#141414;border-radius:4px;overflow:hidden;transition:transform .28s,box-shadow .28s;color:#fff !important;text-align:left !important}
.ctc-jcard:hover{transform:translateY(-6px);box-shadow:0 20px 50px rgba(201,168,108,.12)}
.ctc-jcard-img{height:210px;overflow:hidden;position:relative;background:#1a1a1a}
.ctc-jcard-img img{width:100%;height:100%;object-fit:cover;transition:transform .38s;display:block}
.ctc-jcard:hover .ctc-jcard-img img{transform:scale(1.07)}
.ctc-jcard-cat{position:absolute;top:12px;left:12px;background:rgba(201,168,108,.9);color:#000;font-size:9px;letter-spacing:2px;text-transform:uppercase;padding:4px 10px;text-align:left !important}
.ctc-jcard-body{padding:20px 22px 26px;text-align:left !important}
.ctc-jcard-title{font-family:'Bebas Neue',sans-serif;font-size:20px;color:#fff !important;line-height:1.25;letter-spacing:1px;margin-bottom:10px;text-align:left !important}
.ctc-jcard-ex{font-size:12px;color:#777 !important;line-height:1.65;margin-bottom:14px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden;text-align:left !important}
.ctc-jcard-meta{display:flex;align-items:center;justify-content:flex-end}
.ctc-jcard-date{display:none}
.ctc-jcard-cta{font-size:10px;color:var(--gd) !important;letter-spacing:2px;text-transform:uppercase;text-align:left !important}

/* PAGINATION */
.ctc-pagination{display:flex;justify-content:center;gap:8px;padding:48px 0}
.ctc-pg-btn{padding:10px 18px;background:transparent;border:1px solid #252525;color:#666;cursor:pointer;font-family:'DM Sans',sans-serif;font-size:11px;letter-spacing:2px;transition:all .2s}
.ctc-pg-btn:hover,.ctc-pg-btn.active{background:var(--gd);color:#000;border-color:var(--gd)}
.ctc-pg-btn:disabled{opacity:.3;cursor:default}

@media(max-width:768px){
  .ctc-bhero-c,.ctc-filters,.ctc-search-wrap,.ctc-bmain{padding-left:24px;padding-right:24px}
  .ctc-bgrid2{grid-template-columns:1fr}
}
</style>

<div class="ctc-bw">
  <div class="ctc-bhero">
    <div class="ctc-bhero-bg"></div>
    <div class="ctc-bhero-gr"></div>
    <div class="ctc-bhero-c">
      <div class="ctc-bey">The Journal</div>
      <h1 class="ctc-bh1">TRAVEL<br><span class="ctc-bscript">stories</span></h1>
      <p class="ctc-bsub">Hand-curated guides, romantic itineraries, and insider secrets from two passionate travellers exploring the world together.</p>
    </div>
  </div>

  <div class="ctc-filters">
    <div class="ctc-fscroll" id="ctc-filters">
      <button class="ctc-fbtn active" data-cat="">All Articles</button>
      <button class="ctc-fbtn" data-cat="romantic-getaways">Romantic Getaways</button>
      <button class="ctc-fbtn" data-cat="honeymoon-guides">Honeymoon Guides</button>
      <button class="ctc-fbtn" data-cat="beach-islands">Beach & Islands</button>
      <button class="ctc-fbtn" data-cat="europe">Europe</button>
      <button class="ctc-fbtn" data-cat="luxury-boutique">Luxury & Boutique</button>
      <button class="ctc-fbtn" data-cat="food-culinary">Food & Culinary</button>
      <button class="ctc-fbtn" data-cat="destination-guides">Destination Guides</button>
      <button class="ctc-fbtn" data-cat="scenic-road-trips">Road Trips</button>
      <button class="ctc-fbtn" data-cat="photography">Photography</button>
    </div>
  </div>

  <div class="ctc-search-wrap">
    <div class="ctc-search">
      <input type="text" id="ctc-search-input" placeholder="Search articles…">
      <button onclick="doSearch()">Search</button>
    </div>
  </div>

  <div class="ctc-bmain">
    <div id="ctc-blog-count" class="ctc-blog-count">Loading articles…</div>
    <div id="ctc-blog-grid" class="ctc-bgrid2"><div class="ctc-loading2">Loading articles…</div></div>
    <div class="ctc-pagination" id="ctc-pagination"></div>
  </div>
</div>

<script>
(function(){
  var API='https://classytravelcouples.com/wp-json/wp/v2';
  var currentCat='', currentSearch='', currentPage=1, totalPages=1, totalPosts=0;
  var categoriesMap={};

  function dec(s){
    return s.replace(/&#([0-9]+);/g,function(_,n){return String.fromCharCode(n);})
            .replace(/&amp;/g,'&').replace(/&#8217;/g,"'").replace(/&#038;/g,'&')
            .replace(/&#8211;/g,'–').replace(/&#8212;/g,'—').replace(/&[a-z]+;/g,'');
  }

  function formatDate(d){
    return new Date(d).toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'});
  }

  function card(p){
    var m=p._embedded&&p._embedded['wp:featuredmedia']&&p._embedded['wp:featuredmedia'][0];
    var img=m?m.source_url:'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&auto=format&fit=crop&q=75';
    var title=dec(p.title.rendered);
    var ex=p.excerpt?p.excerpt.rendered.replace(/<[^>]+>/g,'').trim().substring(0,130)+'…':'';
    var cats=p._embedded&&p._embedded['wp:term']&&p._embedded['wp:term'][0]||[];
    var cat=cats.filter(function(c){return c.name!=='Uncategorized';})[0];
    return '<a href="'+p.link+'" class="ctc-jcard">'+
      '<div class="ctc-jcard-img">'+
        '<img src="'+img+'" alt="'+title+'" loading="lazy">'+
        (cat?'<div class="ctc-jcard-cat">'+cat.name+'</div>':'')+
      '</div>'+
      '<div class="ctc-jcard-body">'+
        '<div class="ctc-jcard-title">'+title+'</div>'+
        (ex?'<div class="ctc-jcard-ex">'+ex+'</div>':'')+
        '<div class="ctc-jcard-meta" style="justify-content:flex-end;">'+
          '<span class="ctc-jcard-cta">Read →</span>'+
        '</div>'+
      '</div>'+
    '</a>';
  }

  function buildPagination(){
    var pg=document.getElementById('ctc-pagination');
    if(totalPages<=1){pg.innerHTML='';return;}
    var html='';
    html+='<button class="ctc-pg-btn" '+(currentPage===1?'disabled':'')+' onclick="goPage('+(currentPage-1)+')">← Prev</button>';
    var start=Math.max(1,currentPage-2), end=Math.min(totalPages,currentPage+2);
    for(var i=start;i<=end;i++){
      html+='<button class="ctc-pg-btn'+(i===currentPage?' active':'')+'" onclick="goPage('+i+')">'+i+'</button>';
    }
    html+='<button class="ctc-pg-btn" '+(currentPage===totalPages?'disabled':'')+' onclick="goPage('+(currentPage+1)+')">Next →</button>';
    pg.innerHTML=html;
  }

  function loadPosts(){
    var grid=document.getElementById('ctc-blog-grid');
    var count=document.getElementById('ctc-blog-count');
    grid.innerHTML='<div class="ctc-loading2">Loading articles…</div>';
    count.innerHTML='Loading…';

    var url=API+'/posts?status=publish&per_page=12&page='+currentPage+'&orderby=date&order=desc&_embed';
    if(currentCat && categoriesMap[currentCat]) {
      url+='&categories='+categoriesMap[currentCat];
    }
    if(currentSearch) url+='&search='+encodeURIComponent(currentSearch);

    fetch(url)
      .then(function(r){
        totalPages=parseInt(r.headers.get('X-WP-TotalPages')||1);
        totalPosts=parseInt(r.headers.get('X-WP-Total')||0);
        return r.json();
      })
      .then(function(posts){
        if(!posts.length){
          grid.innerHTML='<div class="ctc-empty2">No articles found. Try a different filter or check back soon!</div>';
          count.innerHTML='';
          document.getElementById('ctc-pagination').innerHTML='';
          return;
        }
        grid.innerHTML=posts.map(card).join('');
        count.innerHTML='Showing <span>'+totalPosts+'</span> '+(totalPosts===1?'article':'articles')+(currentCat?' in this category':'');
        buildPagination();
        window.scrollTo({top:document.querySelector('.ctc-bmain').offsetTop-80,behavior:'smooth'});
      })
      .catch(function(){
        grid.innerHTML='<div class="ctc-empty2">Unable to load articles. Please refresh the page.</div>';
      });
  }

  window.goPage=function(p){currentPage=p;loadPosts();};

  window.doSearch=function(){
    currentSearch=document.getElementById('ctc-search-input').value.trim();
    currentPage=1;
    if (history.pushState) {
      var searchParam = currentSearch ? '?search=' + encodeURIComponent(currentSearch) : '';
      var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + searchParam;
      window.history.pushState({path:newurl},'',newurl);
    }
    loadPosts();
  };

  document.getElementById('ctc-search-input').addEventListener('keydown',function(e){
    if(e.key==='Enter')doSearch();
  });

  document.querySelectorAll('.ctc-fbtn').forEach(function(btn){
    btn.addEventListener('click',function(){
      document.querySelectorAll('.ctc-fbtn').forEach(function(b){b.classList.remove('active');});
      btn.classList.add('active');
      currentCat=btn.getAttribute('data-cat');
      currentSearch='';
      document.getElementById('ctc-search-input').value='';
      currentPage=1;
      
      if (history.pushState) {
        var newurl = window.location.protocol + "//" + window.location.host + window.location.pathname + (currentCat ? '?filter=' + currentCat : '');
        window.history.pushState({path:newurl},'',newurl);
      }
      
      loadPosts();
    });
  });

  // Load all categories mapping on load, check URL params, then load posts
  fetch(API+'/categories?per_page=100')
    .then(function(r){return r.json();})
    .then(function(cats){
      cats.forEach(function(c){
        categoriesMap[c.slug]=c.id;
      });
      // Handle URL param filtering
      var params = new URLSearchParams(window.location.search);
      var initialFilter = params.get('filter');
      if(initialFilter) {
        var btn = document.querySelector('.ctc-fbtn[data-cat="'+initialFilter+'"]');
        if(btn) {
          document.querySelectorAll('.ctc-fbtn').forEach(function(b){b.classList.remove('active');});
          btn.classList.add('active');
          currentCat = initialFilter;
        }
      }
      var initialSearch = params.get('search');
      if(initialSearch) {
        currentSearch = initialSearch;
        var input = document.getElementById('ctc-search-input');
        if(input) input.value = initialSearch;
      }
      loadPosts();
    })
    .catch(function(){
      loadPosts();
    });
})();
</script>`;
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
async function update(pageId, content, label) {
  const res = await fetch(`${WP}/pages/${pageId}`, {
    method: 'POST',
    headers: { Authorization: auth, 'Content-Type': 'application/json' },
    body: JSON.stringify({ content })
  });
  console.log(res.ok ? `✅ ${label} updated` : `❌ ${label} FAILED: ${await res.text()}`);
}

async function run() {
  console.log('🔧 Rebuilding key pages...\n');

  // Update Destinations page (ID 109)
  await update(109, buildDestinationsContent(), 'Destinations page (ID 109)');

  // Update Blog/Journal page (ID 126)  
  await update(126, buildBlogContent(), 'Blog/Journal page (ID 126)');

  console.log('\n✅ Done!');
  console.log('  → Destinations: https://classytravelcouples.com/destinations/');
  console.log('  → Journal/Blog: https://classytravelcouples.com/blog/');
}

run().catch(console.error);
