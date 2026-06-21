require('dotenv').config({ path: '../.env' });
const fs = require('fs');
const path = require('path');

const wpUrl = process.env.WP_URL || 'https://classytravelcouples.com';
const wpUsername = process.env.WP_USERNAME || 'duttapronoy97@gmail.com';
const wpPassword = process.env.WP_APPLICATION_PASSWORD || 'Sajal@25021997';

const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
const authHeader = `Basic ${base64Auth}`;

const pagesToSync = [
  { file: 'home_v2.html', title: 'Home', slug: 'home', id: 17, transparentHeader: 'enabled' },
  { file: 'shop_v2.html', title: 'our shop', slug: 'our-shop', id: 152, transparentHeader: 'enabled' },
  { file: 'free_guide_v2.html', title: 'Free Guide', slug: 'free-guide', id: 204, transparentHeader: 'enabled' },
  { file: 'about_v2.html', title: 'About', slug: 'about', id: 216, transparentHeader: 'enabled' },
  { file: 'contact_v2.html', title: 'Contact', slug: 'contact', id: 223, transparentHeader: 'enabled' },
  { file: 'thank_you_v2.html', title: 'Thank You', slug: 'thank-you', transparentHeader: 'enabled' },
  { file: 'europe_v2.html', title: 'Europe', slug: 'europe', transparentHeader: 'enabled' },
  { file: 'asia_v2.html', title: 'Asia', slug: 'asia', transparentHeader: 'enabled' },
  { file: 'africa_v2.html', title: 'Africa', slug: 'africa', transparentHeader: 'enabled' },
  { file: 'middle_east_v2.html', title: 'Middle East', slug: 'middle-east', transparentHeader: 'enabled' },
  { file: 'indian_ocean_v2.html', title: 'Indian Ocean', slug: 'indian-ocean', transparentHeader: 'enabled' },
  { file: 'americas_v2.html', title: 'Americas', slug: 'americas', transparentHeader: 'enabled' }
];

function extractElementorContent(html) {
  const startStr = '<div data-elementor-type="wp-page"';
  const startIdx = html.indexOf(startStr);
  if (startIdx === -1) return null;
  
  let openDivs = 1;
  let currentIdx = html.indexOf('>', startIdx) + 1;
  
  while (currentIdx < html.length && openDivs > 0) {
    const nextOpen = html.indexOf('<div', currentIdx);
    const nextClose = html.indexOf('</div>', currentIdx);
    
    if (nextClose === -1) break;
    
    if (nextOpen !== -1 && nextOpen < nextClose) {
      openDivs++;
      currentIdx = nextOpen + 4;
    } else {
      openDivs--;
      currentIdx = nextClose + 6;
      if (openDivs === 0) {
        return html.substring(startIdx, currentIdx);
      }
    }
  }
  return null;
}

function rewriteLinks(content) {
  return content
    .replace(/href=["']home_v2\.html["']/g, 'href="/"')
    .replace(/href=["']destinations_v2\.html["']/g, 'href="/destinations/"')
    .replace(/href=["']europe_v2\.html["']/g, 'href="/europe/"')
    .replace(/href=["']asia_v2\.html["']/g, 'href="/asia/"')
    .replace(/href=["']africa_v2\.html["']/g, 'href="/africa/"')
    .replace(/href=["']middle_east_v2\.html["']/g, 'href="/middle-east/"')
    .replace(/href=["']indian_ocean_v2\.html["']/g, 'href="/indian-ocean/"')
    .replace(/href=["']americas_v2\.html["']/g, 'href="/americas/"')
    .replace(/href=["']blog_v2\.html["']/g, 'href="/blog/"')
    .replace(/href=["']blog_v2\.html\?filter=([^"']+)["']/g, 'href="/blog/?filter=$1"')
    .replace(/href=["']shop_v2\.html["']/g, 'href="/our-shop/"')
    .replace(/href=["']free_guide_v2\.html["']/g, 'href="/free-guide/"')
    .replace(/href=["']about_v2\.html["']/g, 'href="/about/"')
    .replace(/href=["']contact_v2\.html["']/g, 'href="/contact/"')
    .replace(/href=["']thank_you_v2\.html["']/g, 'href="/thank-you/"')
    .replace(/href=["']sample_blog_santorini_v2\.html["']/g, 'href="/santorini-couples-guide-2026/"');
}

const blogFilterScript = `
<script>
document.addEventListener('DOMContentLoaded', () => {
  const filterBtns = document.querySelectorAll('.ctc-filter-btn');
  const cards = document.querySelectorAll('.ctc-bc');
  
  // Set initial state from URL query param if present
  const urlParams = new URLSearchParams(window.location.search);
  const filterParam = urlParams.get('filter');
  if (filterParam) {
    const targetBtn = document.querySelector('.ctc-filter-btn[data-filter="' + filterParam + '"]');
    if (targetBtn) {
      filterBtns.forEach(b => b.classList.remove('active'));
      targetBtn.classList.add('active');
      applyFilter(filterParam);
    }
  }
  
  filterBtns.forEach(btn => {
    btn.addEventListener('click', function(e) {
      e.preventDefault();
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      const filterValue = this.getAttribute('data-filter');
      
      // Update URL search query without reloading
      const newUrl = filterValue === 'all' ? window.location.pathname : window.location.pathname + '?filter=' + filterValue;
      window.history.replaceState({ path: newUrl }, '', newUrl);
      
      applyFilter(filterValue);
    });
  });
  
  function applyFilter(value) {
    cards.forEach(card => {
      // Smooth fade transition
      card.style.transition = 'opacity 0.25s ease, transform 0.25s ease';
      if (value === 'all') {
        card.style.display = 'block';
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        }, 10);
      } else {
        const cats = card.getAttribute('data-categories') || '';
        const catArray = cats.split(',').map(c => c.trim());
        if (catArray.includes(value)) {
          card.style.display = 'block';
          setTimeout(() => {
            card.style.opacity = '1';
            card.style.transform = 'scale(1)';
          }, 10);
        } else {
          card.style.opacity = '0';
          card.style.transform = 'scale(0.95)';
          setTimeout(() => {
            card.style.display = 'none';
          }, 250);
        }
      }
    });
  }
});
</script>
`;

async function syncPages() {
  const cleanWpUrl = wpUrl.replace(/\/$/, '');
  
  // 1. Fetch all pages on WordPress to find slugs of any existing pages
  console.log('Fetching live WordPress pages...');
  const resPages = await fetch(`${cleanWpUrl}/wp-json/wp/v2/pages?per_page=100`, {
    headers: { 'Authorization': authHeader }
  });
  
  if (!resPages.ok) {
    console.error('Failed to fetch pages:', await resPages.text());
    return;
  }
  
  const livePages = await resPages.json();
  const livePagesMap = {}; // slug -> page object
  livePages.forEach(p => {
    livePagesMap[p.slug] = p;
  });
  
  // 2. Loop and sync each page
  for (const page of pagesToSync) {
    const fileLocalPath = path.join(__dirname, '..', 'website_pages', page.file);
    if (!fs.existsSync(fileLocalPath)) {
      console.error(`Local file ${page.file} not found, skipping sync.`);
      continue;
    }
    
    console.log(`Processing ${page.file}...`);
    const fileHtml = fs.readFileSync(fileLocalPath, 'utf8');
    
    // Extract Elementor layout container
    let extractedContent = extractElementorContent(fileHtml);
    if (!extractedContent) {
      console.warn(` -> Warning: Could not extract Elementor content from ${page.file}. Using whole file.`);
      extractedContent = fileHtml;
    }
    
    // Rewrite relative links to WordPress clean URLs
    let finalContent = '<!-- wp:html -->\n' + rewriteLinks(extractedContent);
    
    // Append blog filtering script if applicable
    if (page.isBlog) {
      console.log(' -> Appending dynamic category filter Javascript to Blog page.');
      finalContent += blogFilterScript;
    }
    
    finalContent += '\n<!-- /wp:html -->';
    
    // Match by ID first, then by slug
    let targetPage = livePages.find(p => p.id === page.id);
    if (!targetPage) {
      targetPage = livePagesMap[page.slug];
    }
    
    const payload = {
      title: page.title,
      content: finalContent,
      status: 'publish',
      meta: {
        'theme-transparent-header-meta': page.transparentHeader || 'default',
        '_elementor_edit_mode': '',
        '_elementor_data': ''
      }
    };
    
    if (targetPage) {
      // Update existing page
      console.log(` -> Updating existing page "${targetPage.title.rendered}" (ID: ${targetPage.id}, Slug: ${targetPage.slug})`);
      const updateRes = await fetch(`${cleanWpUrl}/wp-json/wp/v2/pages/${targetPage.id}`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (updateRes.ok) {
        console.log(` -> Successfully updated page ID ${targetPage.id}`);
      } else {
        console.error(` -> Failed to update page ID ${targetPage.id}:`, await updateRes.text());
      }
    } else {
      // Create new page
      console.log(` -> Page not found on WordPress. Creating new page "${page.title}" (Slug: ${page.slug})`);
      payload.slug = page.slug;
      const createRes = await fetch(`${cleanWpUrl}/wp-json/wp/v2/pages`, {
        method: 'POST',
        headers: {
          'Authorization': authHeader,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      if (createRes.ok) {
        const newPageData = await createRes.json();
        console.log(` -> Successfully created new page ID ${newPageData.id}`);
      } else {
        console.error(` -> Failed to create page "${page.title}":`, await createRes.text());
      }
    }
    
    // Brief pause to prevent rate limiting
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  
  console.log('All pages synced successfully.');
}

syncPages();
