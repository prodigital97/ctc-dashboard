const path = require('path');
const fs = require('fs');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

const auth = 'Basic ' + Buffer.from(process.env.WP_USERNAME + ':' + process.env.WP_APPLICATION_PASSWORD).toString('base64');
const WP = 'https://classytravelcouples.com/wp-json/wp/v2';

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

async function run() {
  console.log('🔧 Rebuilding dynamic premium Destinations page from destinations_v2.html...\n');

  const fileLocalPath = path.join(__dirname, '../website_pages/destinations_v2.html');
  if (!fs.existsSync(fileLocalPath)) {
    console.error('❌ Error: website_pages/destinations_v2.html not found!');
    process.exit(1);
  }

  const fileHtml = fs.readFileSync(fileLocalPath, 'utf8');

  // Extract Elementor layout container
  let extractedContent = extractElementorContent(fileHtml);
  if (!extractedContent) {
    console.warn('⚠️ Warning: Could not extract Elementor content. Using full file.');
    extractedContent = fileHtml;
  }

  // Rewrite relative links to WordPress clean URLs
  const rewrittenContent = rewriteLinks(extractedContent);

  // Wrap in Gutenberg custom HTML comment blocks
  const finalContent = '<!-- wp:html -->\n' + rewrittenContent + '\n<!-- /wp:html -->';

  console.log('Updating WordPress page ID 109...');
  
  const payload = {
    title: 'Destinations',
    content: finalContent,
    status: 'publish',
    meta: {
      'theme-transparent-header-meta': 'enabled',
      '_elementor_edit_mode': '',
      '_elementor_data': ''
    }
  };

  const updateRes = await fetch(`${WP}/pages/109`, {
    method: 'POST',
    headers: { 
      Authorization: auth, 
      'Content-Type': 'application/json' 
    },
    body: JSON.stringify(payload)
  });

  if (updateRes.ok) {
    console.log('✅ Destinations page (ID: 109) updated successfully!');
    console.log('   Visit: https://classytravelcouples.com/destinations/');
  } else {
    const err = await updateRes.json();
    console.error('❌ Failed to update page:', err.message || err);
  }
}

run().catch(console.error);
