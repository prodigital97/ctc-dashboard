require('dotenv').config();
// Node.js has native fetch in v18+

const wpUrl = process.env.WP_URL;
const wpUsername = process.env.WP_USERNAME;
const wpPassword = process.env.WP_APPLICATION_PASSWORD;
const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

console.log('Testing WordPress Fact-Checking & QA single post run...');
console.log('WP URL:', wpUrl);
console.log('WP Username:', wpUsername);
console.log('Gemini Key prefix:', apiKey ? apiKey.substring(0, 10) : 'None');

async function testSingle() {
  try {
    const cleanWpUrl = wpUrl.replace(/\/$/, '');
    const listEndpoint = `${cleanWpUrl}/wp-json/wp/v2/posts?per_page=1&status=publish,draft`;
    const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
    const authHeader = `Basic ${base64Auth}`;

    console.log('Fetching the latest post...');
    const listResponse = await fetch(listEndpoint, { headers: { 'Authorization': authHeader } });
    if (!listResponse.ok) {
      throw new Error(`WordPress error: ${listResponse.statusText}`);
    }
    const posts = await listResponse.json();
    if (posts.length === 0) {
      console.log('No posts found.');
      return;
    }
    const post = posts[0];
    console.log(`Selected post ID: ${post.id}, Title: "${post.title.rendered}"`);

    // Let's run executeQACheck logic
    console.log('\n--- Running QA Check ---');
    const qaPrompt = `You are a professional travel editor and facts auditor for Classy Travel Couples (classytravelcouples.com).
Your task is to run a rigorous fact check and quality assurance (QA) audit on the following blog post.

Here is the blog post content:
Title: "${post.title.rendered}"
HTML Content:
${post.content.rendered}

Your instructions:
1. Identify all verifiable facts mentioned in the text, such as:
   - Prices (e.g. hotel room rates, tour costs, dining bills).
   - Names of locations, hotels, restaurants, bars, cafés, transit passes.
   - Operating hours, seasonal windows, travel logistics (e.g., ferry times, route durations, coordinates).
   - Operational status (i.e. whether a place is open, closed, or under renovation).
2. Execute Google searches to verify these claims against current real-world data (current year is 2026).
3. Check for any style, formatting, or structural issues:
   - Heading structure (there should be a single H1, and sections should use H2 and H3).
   - Check if headings look generic or copy-pasted instead of being organic and editorial (e.g., do they use names of content blocks like 'Strategic Context', 'Accommodations', 'Photography', 'Practicalities' as actual headings? The brand guidelines say: "DO NOT use the names of the content blocks as headings. Generate organic, creative, editorial headings").
   - Check if the post uses any AI structural clichés (e.g., concluding or 'In conclusion' summaries at the end).
4. Evaluate SEO: Title length, Meta description length, and focus keyword presence.

Format your entire response as a JSON object with the following exact keys (and nothing else):
{
  "qaStatus": "pass" | "needs_review",
  "verifiedClaims": [
    {
      "claim": "The specific claim made in the blog",
      "verification": "The verified information and how it was checked"
    }
  ],
  "discrepancies": [
    {
      "originalText": "The exact wording or price in the blog that is outdated or incorrect",
      "correctedText": "The corrected wording or price based on live search",
      "reason": "Detailed explanation of why this was changed (e.g. price increase, permanent/temporary closure, name change)",
      "sources": ["Array of citation URLs found during search"]
    }
  ],
  "seoCheck": {
    "titleAssessment": "Assessment of the title (e.g. good, too long, too short)",
    "metaDescriptionAssessment": "Assessment of the meta description, including length and keyword alignment",
    "headingHierarchyAssessment": "Assessment of heading tags and if they follow the editorial guideline (avoiding generic block names)",
    "clichesFound": ["Any AI clichés like 'In conclusion' or 'Wrapping up' found at the end. Otherwise empty array"]
  },
  "recommendations": [
    "Specific actionable recommendation 1",
    "Specific actionable recommendation 2"
  ]
}

Ensure your output is strictly a valid JSON object, with no markdown tags like \`\`\`json or surrounding text.`;

    const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const qaResponse = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: qaPrompt }] }],
        tools: [{ google_search: {} }]
      })
    });

    if (!qaResponse.ok) {
      const errText = await qaResponse.text();
      throw new Error(`Gemini API Error: ${qaResponse.statusText} (${errText})`);
    }

    const qaData = await qaResponse.json();
    let qaText = qaData.candidates[0].content.parts[0].text;
    qaText = qaText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    const qaReport = JSON.parse(qaText);
    console.log('QA Report generated successfully.');
    console.log('Status:', qaReport.qaStatus);
    console.log('Discrepancies found:', qaReport.discrepancies.length);
    console.log(JSON.stringify(qaReport, null, 2));

    // Let's run executeRewrite logic
    console.log('\n--- Running Rewrite ---');
    const rewritePrompt = `You are the lead travel writer for Classy Travel Couples (classytravelcouples.com).
Your task is to rewrite the following blog post HTML to apply the corrections and improvements identified in the QA audit report, making it highly customized, informative, and engaging.

Original Title: "${post.title.rendered}"
Original HTML Body:
${post.content.rendered}

QA Audit Report:
${JSON.stringify(qaReport, null, 2)}

Strict Formatting & Writing Guidelines:
1. CUSTOM EDITORIAL HEADINGS (Crucial!): 
   - The headings in the original post look too standardized and identical across all blogs. You have a free hand to change them.
   - DO NOT use generic section names as headings (e.g. do not write 'Strategic Context', 'Accommodations', 'Photography Spot Guide', 'Practicalities', or 'Introduction').
   - Instead, write highly customized, organic, and Conde-Nast-style editorial headings that directly represent the title and specific content of this section (e.g., instead of 'Accommodations' in a Bordeaux blog, write 'Châteaux & Vineyards: Where to Stay in Bordeaux'). Make them unique and creative for every single blog post!
2. READER-FOCUSED SPECIFIC DETAILS (Crucial!):
   - The content must not sound like a generic travel brochure. It must provide the actual, specific information a reader is looking for.
   - Apply all factual/price/operating corrections listed in the QA report's 'discrepancies' section.
   - Include specific hotel room names, dining recommendations (with specific table choices or reservation rules), travel times, route details, and local secrets.
   - Include real-life travel friction (e.g. wait times, transfer gridlock warnings, booking windows, or local surcharges).
3. STYLING CARDS:
   - Keep the custom website HTML cards (like '<div class="hotel-card">', '<div class="tip-box">', '<div class="ctc-summary-card">') intact. Just update the text and details inside them.
4. NO AI CLICHÉS:
   - Do not end the article with concluding summary paragraphs or 'In conclusion' lines. End naturally on a memorable couple tip.

Output should be formatted as a JSON object with the following exact keys:
- "title": Revised post title (or original if good).
- "metaTitle": Revised SEO meta title.
- "metaDescription": Revised SEO meta description.
- "bodyHtml": The complete rewritten HTML body content.

Ensure your output is strictly a valid JSON object, with no markdown tags like \`\`\`json or surrounding text.`;

    const rwResponse = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: rewritePrompt }] }] })
    });

    if (!rwResponse.ok) {
      const errText = await rwResponse.text();
      throw new Error(`Gemini Rewrite Error: ${rwResponse.statusText} (${errText})`);
    }

    const rwData = await rwResponse.json();
    let rwText = rwData.candidates[0].content.parts[0].text;
    rwText = rwText.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    const rewrite = JSON.parse(rwText);
    console.log('Rewrite generated successfully.');
    console.log('New Title:', rewrite.title);
    console.log('New Meta Description:', rewrite.metaDescription);

    console.log('\nAll APIs checked successfully. Not applying changes to WP in this test script.');
  } catch (error) {
    console.error('Test run failed:', error);
  }
}

testSingle();
