const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, 'santorini_styling.css');
let cssStyle = '';
if (fs.existsSync(cssPath)) {
  cssStyle = fs.readFileSync(cssPath, 'utf8');
} else {
  console.warn('Warning: santorini_styling.css not found locally!');
}

// Unsplash hero images for each topic
const HERO_IMAGES = {
  18: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=600&q=80', // Medjumbe Island
  39: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=1200&h=600&q=80', // Raja Ampat
  49: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&h=600&q=80', // Iconic Luxury Hotels
  440: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&h=600&q=80', // Global Luxury Wedding Venues
  465: 'https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=1200&h=600&q=80', // Luxury Destination Wedding Venues
  76: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=600&q=80', // Bora Bora
  436: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=600&q=80', // Private Island Escapes in Mozambique (Reuse Medjumbe or similar)
  26: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&h=600&q=80',  // Luxury Beach & Island Destination Wedding Venues
  42: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&h=600&q=80',  // Hidden Paradise Tropical Islands
  82: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&h=600&q=80',   // Luxury All-Inclusive Resorts
  130: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=1200&h=600&q=80', // Malapascua diving
  131: 'https://images.unsplash.com/photo-1682687220063-4742bd7fd538?auto=format&fit=crop&w=1200&h=600&q=80', // Moalboal diving
  502: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=1200&h=600&q=80', // Historic Cafes
  32: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&h=600&q=80',  // Fine Dining
  199: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&h=600&q=80'  // Wine Regions
};

const CATEGORIES = {
  18: 'Beach & Islands &bull; Romantic Getaways',
  39: 'Beach & Islands &bull; Romantic Getaways',
  49: 'Luxury & Boutique &bull; Romantic Getaways',
  440: 'Luxury Travel &bull; Honeymoon',
  465: 'Romantic Getaways &bull; Luxury Travel',
  76: 'Romantic Getaways &bull; Beach & Islands',
  436: 'Luxury & Boutique &bull; Romantic Getaways',
  26: 'Romantic Getaways &bull; Beach & Islands',
  42: 'Beach & Islands &bull; Romantic Getaways',
  82: 'Romantic Getaways &bull; Luxury Travel',
  130: 'Beach & Islands &bull; Photography Spots',
  131: 'Beach & Islands &bull; Food & Culinary',
  502: 'Food & Culinary &bull; Romantic Getaways',
  32: 'Food & Culinary &bull; Luxury Travel',
  199: 'Food & Culinary &bull; Romantic Getaways'
};

const READ_TIMES = {
  18: '10 MIN READ',
  39: '12 MIN READ',
  49: '14 MIN READ',
  440: '12 MIN READ',
  465: '12 MIN READ',
  76: '12 MIN READ',
  436: '12 MIN READ',
  26: '12 MIN READ',
  42: '12 MIN READ',
  82: '12 MIN READ',
  130: '11 MIN READ',
  131: '13 MIN READ',
  502: '10 MIN READ',
  32: '12 MIN READ',
  199: '11 MIN READ'
};

function determineSectionLabel(headerText) {
  const h = headerText.toLowerCase();
  if (h.includes('allure') || h.includes('intro') || h.includes('paradise') || h.includes('magic') || h.includes('sanctuary') || h.includes('quest for seclusion')) {
    return 'Introduction';
  }
  if (h.includes('context') || h.includes('timing') || h.includes('geography') || h.includes('visit') || h.includes('when to') || h.includes('getting there')) {
    return 'Strategic Context';
  }
  if (h.includes('accommodation') || h.includes('luxury') || h.includes('resorts') || h.includes('hotels') || h.includes('stay')) {
    return 'Accommodations';
  }
  if (h.includes('culinary') || h.includes('dining') || h.includes('food') || h.includes('eat') || h.includes('gastronomy') || h.includes('restaurant')) {
    return 'Gastronomy';
  }
  if (h.includes('experience') || h.includes('activities') || h.includes('things to') || h.includes('handpicked')) {
    return 'Experiences';
  }
  if (h.includes('photography') || h.includes('instagram') || h.includes('photo') || h.includes('spot')) {
    return 'Photography';
  }
  if (h.includes('practicalities') || h.includes('tips') || h.includes('getting there') || h.includes('practical') || h.includes('guidelines')) {
    return 'Practicalities';
  }
  return 'Destinations';
}

function getHeadingMeta(title) {
  const label = determineSectionLabel(title);
  let id = 'section-' + title.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  let navTitle = label;

  switch(label) {
    case 'Introduction':
      id = 'understanding';
      navTitle = 'Understand';
      break;
    case 'Strategic Context':
      id = 'context';
      navTitle = 'Context';
      break;
    case 'Accommodations':
      id = 'where-to-stay';
      navTitle = 'Where to Stay';
      break;
    case 'Gastronomy':
      id = 'where-to-eat';
      navTitle = 'Where to Eat';
      break;
    case 'Experiences':
      id = 'what-to-do';
      navTitle = 'Experiences';
      break;
    case 'Photography':
      id = 'instagram-spots';
      navTitle = 'Instagram Spots';
      break;
    case 'Practicalities':
      id = 'practicalities';
      navTitle = 'Practical Tips';
      break;
  }
  return { label, id, navTitle };
}

function generateSummaryCard(item) {
  const title = (item.title || '').toLowerCase();
  const body = (item.bodyHtml || '').toLowerCase();
  
  let season = 'Year-Round';
  let style = 'Romantic Luxury';
  let duration = '4 – 5 Nights';
  let budget = '€300 – €700 / day';

  if (title.includes('maldives') || body.includes('maldives')) {
    season = 'November – April';
    style = 'Tropical Splurge';
    duration = '5 – 7 Nights';
    budget = '$600 – $1,200 / day';
  } else if (title.includes('bora bora') || body.includes('bora bora')) {
    season = 'May – October';
    style = 'Overwater Luxury';
    duration = '5 – 7 Nights';
    budget = '$800 – $1,500 / day';
  } else if (title.includes('cape town') || body.includes('cape town')) {
    season = 'November – March';
    style = 'Scenic Adventure';
    duration = '5 – 6 Nights';
    budget = '$250 – $500 / day';
  } else if (title.includes('bordeaux') || body.includes('wine')) {
    season = 'May – October';
    style = 'Wine & Culinary';
    duration = '3 – 4 Nights';
    budget = '€300 – €600 / day';
  } else if (title.includes('elopement') || title.includes('wedding')) {
    season = 'Spring – Autumn';
    style = 'Exclusive Elopement';
    duration = '3 – 4 Nights';
    budget = '$500 – $1,500 / day';
  } else if (title.includes('esim') || title.includes('connectivity') || title.includes('photo')) {
    // For general tech tips / packing check, return empty (no summary card needed)
    return '';
  }
  
  return `
        <!-- ITINERARY AT-A-GLANCE & BUDGET CARD -->
        <div class="ctc-summary-card">
          <div class="ctc-summary-title">ITINERARY AT-A-GLANCE</div>
          <div class="ctc-summary-grid">
            <div class="ctc-summary-col">
              <div class="ctc-summary-label">Best Season</div>
              <div class="ctc-summary-val">${season}</div>
            </div>
            <div class="ctc-summary-col">
              <div class="ctc-summary-label">Couple Style</div>
              <div class="ctc-summary-val">${style}</div>
            </div>
            <div class="ctc-summary-col">
              <div class="ctc-summary-label">Rec. Duration</div>
              <div class="ctc-summary-val">${duration}</div>
            </div>
            <div class="ctc-summary-col">
              <div class="ctc-summary-label">Est. Budget</div>
              <div class="ctc-summary-val">${budget}</div>
            </div>
          </div>
        </div>
  `;
}

function extractDivRange(html, startIndex, tagOpen) {
  const tagStart = html.indexOf(tagOpen, startIndex);
  if (tagStart === -1) return null;
  const contentStart = tagStart + tagOpen.length;

  let depth = 1;
  let pos = contentStart;
  while (depth > 0 && pos < html.length) {
    if (html.substring(pos, pos + 4).toLowerCase() === '<div') {
      depth++;
      pos += 4;
    } else if (html.substring(pos, pos + 6).toLowerCase() === '</div>') {
      depth--;
      if (depth === 0) {
        return {
          start: tagStart,
          end: pos + 6,
          content: html.substring(contentStart, pos).trim()
        };
      }
      pos += 6;
    } else {
      pos++;
    }
  }
  return {
    start: tagStart,
    end: html.length,
    content: html.substring(contentStart).trim()
  };
}

function extractArticleRange(html, startIndex) {
  const tagOpen = '<article class="content-wrapper">';
  const tagStart = html.indexOf(tagOpen, startIndex);
  if (tagStart === -1) return null;
  const contentStart = tagStart + tagOpen.length;

  let depth = 1;
  let pos = contentStart;
  while (depth > 0 && pos < html.length) {
    if (html.substring(pos, pos + 8).toLowerCase() === '<article') {
      depth++;
      pos += 8;
    } else if (html.substring(pos, pos + 10).toLowerCase() === '</article>') {
      depth--;
      if (depth === 0) {
        return {
          start: tagStart,
          end: pos + 10,
          content: html.substring(contentStart, pos).trim()
        };
      }
      pos += 10;
    } else {
      pos++;
    }
  }
  return {
    start: tagStart,
    end: html.length,
    content: html.substring(contentStart).trim()
  };
}

function unwrapOuterWrappers(html) {
  let cleaned = html;

  cleaned = cleaned.replace(/<link[^>]*>/gi, '');
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, '');
  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, '');

  cleaned = cleaned.replace(/<aside class="ctc-sidebar-sticky">[\s\S]*?<\/aside>/gi, '');
  cleaned = cleaned.replace(/<div class="ctc-hero">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi, '');
  cleaned = cleaned.replace(/<div class="ctc-hero">[\s\S]*?<\/div>/gi, '');

  let lastIndex = cleaned.lastIndexOf('<div class="ctc-main-content">');
  if (lastIndex === -1) {
    lastIndex = cleaned.lastIndexOf('<article class="content-wrapper">');
    if (lastIndex === -1) {
      lastIndex = cleaned.lastIndexOf('<div id="ctc-post">');
      if (lastIndex === -1) {
        return cleanIndividualElements(cleaned);
      } else {
        const range = extractDivRange(cleaned, lastIndex, '<div id="ctc-post">');
        return cleanIndividualElements(range ? range.content : cleaned);
      }
    } else {
      const range = extractArticleRange(cleaned, lastIndex);
      return cleanIndividualElements(range ? range.content : cleaned);
    }
  }

  const range = extractDivRange(cleaned, lastIndex, '<div class="ctc-main-content">');
  const innerContent = range ? range.content : cleaned;
  
  if (innerContent.includes('<div class="ctc-main-content">')) {
    return unwrapOuterWrappers(innerContent);
  }
  return cleanIndividualElements(innerContent);
}

function cleanIndividualElements(html) {
  let cleaned = html;

  cleaned = cleaned.replace(/<div class="gold-divider"><\/div>/g, '');
  cleaned = cleaned.replace(/<div class="section-label">[\s\S]*?<\/div>/g, '');

  let cardRange;
  while ((cardRange = extractDivRange(cleaned, 0, '<div class="ctc-summary-card">')) !== null) {
    cleaned = cleaned.substring(0, cardRange.start) + cleaned.substring(cardRange.end);
  }

  cleaned = cleaned.replace(/<!-- ITINERARY AT-A-GLANCE & BUDGET CARD -->/g, '');
  cleaned = cleaned.replace(/\n\s*\n/g, '\n\n');

  cleaned = cleaned.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '<h2>$1</h2>');

  return cleaned.trim();
}

function convertHtmlToPremium(item) {
  let html = unwrapOuterWrappers(item.bodyHtml || '');

  const usedIds = new Set();
  const headingList = [];

  const h2Regex = /<h2>(.*?)<\/h2>/g;
  html = html.replace(h2Regex, (match, title) => {
    const meta = getHeadingMeta(title);
    let finalId = meta.id;
    let counter = 1;
    while (usedIds.has(finalId)) {
      finalId = meta.id + '-' + (++counter);
    }
    usedIds.add(finalId);

    headingList.push({ id: finalId, navTitle: meta.navTitle });
    return `<div class="section-label">${meta.label}</div>\n<h2 id="${finalId}">${title}</h2>`;
  });

  const firstPIndex = html.indexOf('<p>');
  if (firstPIndex !== -1) {
    html = html.substring(0, firstPIndex) + '<p class="drop-cap">' + html.substring(firstPIndex + 3);
  }

  let updatedHtml = html;
  const firstClosePIndex = updatedHtml.indexOf('</p>');
  if (firstClosePIndex !== -1) {
    const summaryCardHtml = generateSummaryCard(item);
    if (summaryCardHtml) {
      updatedHtml = updatedHtml.substring(0, firstClosePIndex + 4) + '\n\n' + summaryCardHtml + '\n\n' + updatedHtml.substring(firstClosePIndex + 4);
    }
  }

  const hotelLiRegex = /<li><strong>(The Splurge|Mid-Range|Boutique Value|The Romantic Sweet Spot|Romantic Sweet Spot):\s*(.*?)<\/strong><br>(.*?)<\/li>/gi;
  updatedHtml = updatedHtml.replace(hotelLiRegex, (match, tier, name, desc) => {
    const tierClass = tier.toLowerCase().includes('splurge') ? 'splurge' : (tier.toLowerCase().includes('mid') ? 'mid' : 'boutique');
    let cleanDesc = desc;
    let roomHtml = '';
    let priceHtml = '';

    const roomMatch = cleanDesc.match(/(?:Recommended Room|Best Room):\s*(.*?)(?:\.|$|;)/i);
    if (roomMatch) {
      roomHtml = `<div class="hotel-detail"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A86C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;"><path d="M2 4v16"/><path d="M2 8h18a2 2 0 0 1 2 2v10"/><path d="M2 17h20"/><path d="M6 8v9"/></svg><strong>Best room:</strong> ${roomMatch[1]}</div>`;
      cleanDesc = cleanDesc.replace(roomMatch[0], '');
    }

    const priceMatch = cleanDesc.match(/(?:Price Range|Price|Expect to pay around):\s*(.*?)(?:\.|$|;)/i);
    if (priceMatch) {
      priceHtml = `<div class="hotel-detail"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A86C" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:middle;margin-right:6px;"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg><strong>Price range:</strong> ${priceMatch[1]}</div>`;
      cleanDesc = cleanDesc.replace(priceMatch[0], '');
    }

    return `
<div class="hotel-card">
  <span class="hotel-tier tier-class"><span style="color:#C9A86C;margin-right:4px;">◆</span>${tier}</span>
  <div class="hotel-name">${name}</div>
  <p>${cleanDesc.trim().replace(/^,\s*/, '')}</p>
  ${roomHtml}
  ${priceHtml}
</div>`;
  });

  const restRegex = /<h3>(The Unmissable Splurge|Bahia Restaurant & Jahazi Bar|Bahia Restaurant|Jahazi Bar|Oro|Oro Dining|Oro Restaurant|The Splurge|Sunset\/Splurge Dinner|Local Food|Casual & Quick)(?::\s*(.*?))?<\/h3>\s*<p>(.*?)<\/p>/gi;
  updatedHtml = updatedHtml.replace(restRegex, (match, meta, name, desc) => {
    const finalName = name ? name.trim() : meta.trim();
    const finalMeta = name ? meta.trim() : 'Restaurant & Dining';
    return `
<div class="restaurant-card">
  <div class="r-name">${finalName}</div>
  <div class="r-meta">${finalMeta}</div>
  <p>${desc}</p>
</div>`;
  });

  const spotRegex = /<li><strong>(.*?)<\/strong>:\s*(.*?)<\/li>/gi;
  let spotCounter = 1;
  updatedHtml = updatedHtml.replace(spotRegex, (match, name, desc) => {
    const lowerName = name.toLowerCase();
    if (lowerName.includes('spot') || lowerName.includes('view') || lowerName.includes('jetty') || lowerName.includes('pool') || lowerName.includes('terrace') || lowerName.includes('arch') || lowerName.includes('steps') || lowerName.includes('lookout') || lowerName.includes('lagoon') || lowerName.includes('sandspit') || lowerName.includes('ridge') || lowerName.includes('dock') || lowerName.includes('hallway') || lowerName.includes('lookout') || lowerName.includes('descen') || lowerName.includes('swing')) {
      return `
<div class="ig-spot">
  <div class="spot-name">${spotCounter++}. ${name}</div>
  <p>${desc}</p>
</div>`;
    }
    return `
<div class="tip-box">
  <div class="tip-label">${name}</div>
  <p>${desc}</p>
</div>`;
  });

  updatedHtml = updatedHtml.replace(/<ul\s*>\s*<\/ul>/g, '').replace(/<ol\s*>\s*<\/ol>/g, '').replace(/<p><\/p>/g, '');

  const premiumHtml = `
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Inter:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&display=swap" rel="stylesheet">
${cssStyle ? `<style>\n${cssStyle.replace(/<\/?style>/g, '').trim()}\n</style>` : ''}

<div id="ctc-post">
  <article class="content-wrapper">
    <div class="ctc-main-content">
      ${updatedHtml}
      
      <div class="gold-divider"></div>
    </div>
  </article>
</div>
`;

  return premiumHtml;
}

function convertHtmlToCleanTemplate(item) {
  return unwrapOuterWrappers(item.bodyHtml || '');
}

module.exports = {
  convertHtmlToPremium,
  convertHtmlToCleanTemplate
};
