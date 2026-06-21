const fs = require('fs');
const path = require('path');

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

function extractInnermostContent(html) {
  let cleaned = html;

  // Remove styling and scripts
  cleaned = cleaned.replace(/<link[^>]*>/gi, '');
  cleaned = cleaned.replace(/<style[\s\S]*?<\/style>/gi, '');
  cleaned = cleaned.replace(/<script[\s\S]*?<\/script>/gi, '');

  // Strip navigation sidebar and hero if they exist in the raw string
  cleaned = cleaned.replace(/<aside class="ctc-sidebar-sticky">[\s\S]*?<\/aside>/gi, '');
  cleaned = cleaned.replace(/<div class="ctc-hero">[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/gi, '');

  // Find the innermost ctc-main-content
  let lastIndex = cleaned.lastIndexOf('<div class="ctc-main-content">');
  if (lastIndex === -1) {
    // If not found, look for article content-wrapper
    lastIndex = cleaned.lastIndexOf('<article class="content-wrapper">');
    if (lastIndex === -1) {
      // Look for ctc-post
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
  
  // Since there might be nested structures, let's recursively clean if needed
  if (innerContent.includes('<div class="ctc-main-content">')) {
    return extractInnermostContent(innerContent);
  }
  return cleanIndividualElements(innerContent);
}

function cleanIndividualElements(html) {
  let cleaned = html;

  // Remove existing gold-dividers
  cleaned = cleaned.replace(/<div class="gold-divider"><\/div>/g, '');

  // Remove section labels (they will be regenerated before H2s)
  cleaned = cleaned.replace(/<div class="section-label">[\s\S]*?<\/div>/g, '');

  // Remove ALL existing summary cards (they will be regenerated)
  let cardRange;
  while ((cardRange = extractDivRange(cleaned, 0, '<div class="ctc-summary-card">')) !== null) {
    cleaned = cleaned.substring(0, cardRange.start) + cleaned.substring(cardRange.end);
  }

  // Clean double line breaks or spaces
  cleaned = cleaned.trim();
  return cleaned;
}

// Test with Row 18
const poolPath = path.join(__dirname, '..', 'renders_pool.json');
const pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));
const row18 = pool.find(item => item.row === 18);

console.log('--- ORIGINAL BODYHTML LENGTH ---');
console.log(row18.bodyHtml.length);

const cleaned = extractInnermostContent(row18.bodyHtml);

console.log('--- CLEANED BODYHTML LENGTH ---');
console.log(cleaned.length);

console.log('--- SAMPLE OF CLEANED CONTENT (First 1500 chars) ---');
console.log(cleaned.substring(0, 1500));

console.log('--- SAMPLE OF CLEANED CONTENT (Last 500 chars) ---');
console.log(cleaned.substring(cleaned.length - 500));
