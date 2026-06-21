require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const Parser = require('rss-parser');

const app = express();
const parser = new Parser({
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
  }
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Serve the static frontend (index.html, etc.) from the workspace root
app.use(express.static(path.join(__dirname)));

// Fallback to serving index.html on root path
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Travel RSS feeds list to monitor for trends
const FEEDS_TO_SCAN = [
  { name: 'Nomadic Matt', url: 'https://www.nomadicmatt.com/travel-blog/feed/' },
  { name: 'Travel + Leisure', url: 'https://www.travelandleisure.com/syndication/feed/all' },
  { name: 'Practical Wanderlust', url: 'https://practicalwanderlust.com/feed/' },
  { name: 'Adventure Journal', url: 'https://www.adventure-journal.com/feed/' },
  
  // Core Competitors (Couples & Boutique Travel Focus)
  { name: 'Santorini Dave', url: 'https://santorinidave.com/feed/' },
  { name: 'Wanderlust Chloe', url: 'https://wanderlustchloe.com/feed/' },
  { name: 'Ordinary Traveler', url: 'https://ordinarytraveler.com/feed/' },
  { name: 'New England Wanderlust', url: 'https://newenglandwanderlust.com/feed/' },
  { name: 'Shannon Shipman', url: 'https://shannonshipman.com/feed/' },
  { name: 'Around the World L', url: 'https://aroundtheworldl.com/feed/' },
  { name: 'Midnight Blue Elephant', url: 'https://midnightblueelephant.com/feed/' },
  { name: 'The Planet D', url: 'https://theplanetd.com/feed/' },
  { name: 'HoneyTrek', url: 'https://honeytrek.com/feed/' },
  { name: 'Goats on the Road', url: 'https://goatsontheroad.com/feed/' },
  { name: 'NOMADasaurus', url: 'https://www.nomadasaurus.com/feed/' },
  { name: 'Getting Stamped', url: 'https://gettingstamped.com/feed/' },
  { name: 'Bruised Passports', url: 'https://bruisedpassports.com/feed/' },
  { name: 'Justin Plus Lauren', url: 'https://justinpluslauren.com/feed/' },
  { name: 'Follow Me Away', url: 'https://followmeaway.com/feed/' },
  { name: '27 Travels', url: 'https://27travels.com/feed/' },
  { name: 'Gypsycouple', url: 'https://gypsycouple.com/feed/' },
  { name: 'Divergent Travelers', url: 'https://divergenttravelers.com/feed/' },
  { name: 'MyTanFeet', url: 'https://mytanfeet.com/feed/' },
  { name: 'Two Wandering Soles', url: 'https://twowanderingsoles.com/feed/' },
  { name: 'Never Ending Voyage', url: 'https://neverendingvoyage.com/feed/' },
  { name: 'Along Dusty Roads', url: 'https://alongdustyroads.com/feed/' },
  { name: 'Hand Luggage Only', url: 'https://handluggageonly.co.uk/feed/' },
  { name: 'Our Escape Clause', url: 'https://ourescapeclause.com/feed/' },
  { name: 'The Barefoot Nomad', url: 'https://thebarefootnomad.com/feed/' },
  
  // New Competitor Additions
  { name: 'Luxe Adventure Traveler', url: 'https://luxeadventuretraveler.com/feed/' },
  { name: 'Roamaroo', url: 'https://roamaroo.com/feed/' },
  { name: 'Sand In My Suitcase', url: 'https://sandinmysuitcase.com/feed/' },
  { name: 'Two Drifters', url: 'https://twodrifters.us/feed/' },
  { name: 'The Style Traveller', url: 'https://thestyletraveller.com/feed/' },
  { name: 'Postcard Jar', url: 'https://postcardjar.com/feed/' },
  { name: 'Jyo Shankar', url: 'https://jyoshankar.com/feed/' },
  { name: 'Lisa Homsy', url: 'https://lisahomsy.com/feed/' },
  { name: 'Salty Luxe', url: 'https://saltyluxe.com/feed/' },
  { name: 'The World Pursuit', url: 'https://theworldpursuit.com/feed/' },
  { name: 'Unearth the Voyage', url: 'https://unearththevoyage.com/feed/' }
];

const OWN_FEED_URL = 'https://classytravelcouples.com/feed/';

// Helper function to extract API Key from environment or request headers
function getGeminiKey(req) {
  return req.headers['x-gemini-key'] || process.env.GEMINI_API_KEY || '';
}

// Helper function to extract Gemini Model
function getGeminiModel(req) {
  return req.headers['x-gemini-model'] || process.env.GEMINI_MODEL || 'gemini-2.5-flash';
}

// ─── ENDPOINT: GET API CONFIG (To let UI know if server has env configured) ───
app.get('/api/config-status', (req, res) => {
  res.json({
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    geminiModel: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    hasWordPress: !!(process.env.WP_URL && process.env.WP_USERNAME && process.env.WP_APPLICATION_PASSWORD),
    wpUrl: process.env.WP_URL || ''
  });
});

// ─── ENDPOINT: DETECT TRENDS ─────────────────────────────────────────────────
app.post('/api/trends', async (req, res) => {
  const apiKey = getGeminiKey(req);
  const model = getGeminiModel(req);
  const category = req.body.category || 'destination_guides';
  const categoryLabel = req.body.categoryLabel || 'Destination Guides';
  
  if (!apiKey) {
    return res.status(400).json({ error: 'Gemini API Key is required. Set it in .env or settings.' });
  }

  try {
    console.log(`[Trends] Starting trend detection for category: ${categoryLabel}`);
    
    // 1. Fetch own feed to build list of existing titles for deduplication
    let existingTitles = [];
    try {
      console.log(`[Trends] Fetching own feed for deduplication: ${OWN_FEED_URL}`);
      const ownFeed = await parser.parseURL(OWN_FEED_URL);
      existingTitles = ownFeed.items.map(item => item.title.toLowerCase().trim());
      console.log(`[Trends] Found ${existingTitles.length} existing topics on classytravelcouples.com`);
    } catch (err) {
      console.warn('[Trends] Failed to fetch own feed, proceeding without deduplication:', err.message);
    }

    // 2. Fetch external travel RSS feeds to scan for headlines
    let rawHeadlines = [];
    for (const feed of FEEDS_TO_SCAN) {
      try {
        console.log(`[Trends] Fetching feed from: ${feed.name}`);
        const parsed = await parser.parseURL(feed.url);
        parsed.items.forEach(item => {
          if (item.title) {
            rawHeadlines.push({
              title: item.title,
              description: item.snippet || item.contentSnippet || '',
              source: feed.name,
              link: item.link,
              date: item.isoDate || item.pubDate || new Date().toISOString()
            });
          }
        });
      } catch (err) {
        console.warn(`[Trends] Failed to fetch feed ${feed.name}:`, err.message);
      }
    }

    console.log(`[Trends] Fetched ${rawHeadlines.length} total external articles.`);

    // Sort all articles globally by date (newest first) to capture the freshest trends
    rawHeadlines.sort((a, b) => new Date(b.date) - new Date(a.date));

    // 3. Pick a sample of raw articles to send to Gemini for trend extraction
    // Increase context to 120 articles to ensure representation across all 40 feeds
    const articleSamples = rawHeadlines
      .slice(0, 120)
      .map((a, i) => `${i+1}. [${a.source}] (Published: ${new Date(a.date).toLocaleDateString()}) Title: "${a.title}" - Description: "${a.description.substring(0, 120)}..."`)
      .join('\n');

    // 4. Instruct Gemini to analyze raw items, compare against existing posts, and output all qualifying trends
    const prompt = `You are an AI trend intelligence engine for the couples-travel blog "Classy Travel Couples" (classytravelcouples.com).
    Your task is to analyze raw travel article headlines and extract all qualifying, distinct trending topics specifically in the category: "${categoryLabel}".
    
    ### CRITICAL RULE:
    - Do NOT recommend or include any trending topics, destinations, itinerary ideas, or activities located in India. Filter out any India-based locations entirely.
    
    Here is a list of recent travel news and topics from around the web:
    ${articleSamples}
    
    Here is a list of topics we have ALREADY published on our site (DO NOT duplicate or recommend anything similar to these):
    ${existingTitles.map(t => `- "${t}"`).join('\n')}
    
    Based on the web data, identify all distinct, trending travel topics that fit a stylish, romantic couple's travel profile. Extract as many distinct trends as qualify, without capping or limiting the number.
    
    Return ONLY a valid JSON array. Each object must have:
    - "topic" (string: the specific trending destination, itinerary idea, or travel style)
    - "score" (number: 1-100 indicating trend strength and search volume)
    - "source" (string: where this trend was spotted, e.g. "Lonely Planet", "Travel + Leisure", or synthesized from inputs)
    - "categories" (array of strings: all matching category IDs from this list: ["destination_guides", "romantic_getaways", "luxury_travel", "beach_islands", "city_breaks", "budget_travel", "weekend_getaways", "road_trips", "boutique_hotels", "tips_advice", "honeymoon", "food_culinary", "photography"])
    - "tags" (array of strings, e.g. ["Global", "Emerging", "Outdoorsy", "Luxury"])
    
    Ensure your output is strictly a valid JSON array of objects, with no markdown tags like \`\`\`json or surrounding text.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error: ${response.statusText} (${errText})`);
    }

    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;
    
    // Clean up potential markdown formatting block wrapper
    text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    
    const trends = JSON.parse(text);
    console.log(`[Trends] Successfully extracted ${trends.length} trends.`);
    res.json(trends);

  } catch (error) {
    console.error('[Trends] Error in trend detection:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── ENDPOINT: DETECT INSTAGRAM TRENDS ────────────────────────────────────────
app.post('/api/trends/instagram', async (req, res) => {
  const apiKey = getGeminiKey(req);
  const model = getGeminiModel(req);
  const category = req.body.category || 'destination_guides';
  const categoryLabel = req.body.categoryLabel || 'Destination Guides';
  
  const {
    igProvider,
    igApifyToken,
    igRapidApiKey,
    igRapidApiHost,
    igRapidApiUrl,
    igHashtags
  } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'Gemini API Key is required. Set it in .env or settings.' });
  }

  // Parse hashtags
  let hashtags = [];
  if (Array.isArray(igHashtags)) {
    hashtags = igHashtags;
  } else if (typeof igHashtags === 'string') {
    hashtags = igHashtags.split(',').map(h => h.trim().replace(/^#/, '')).filter(Boolean);
  }
  if (hashtags.length === 0) {
    hashtags = ['coupletravel', 'travelcouples', 'coupletravelgoals'];
  }

  try {
    console.log(`[Instagram Trends] Detecting trends in category "${categoryLabel}" using hashtags: ${hashtags.join(', ')}`);
    
    // 1. Fetch own feed for deduplication
    let existingTitles = [];
    try {
      console.log(`[Instagram Trends] Fetching own feed for deduplication: ${OWN_FEED_URL}`);
      const ownFeed = await parser.parseURL(OWN_FEED_URL);
      existingTitles = ownFeed.items.map(item => item.title.toLowerCase().trim());
    } catch (err) {
      console.warn('[Instagram Trends] Failed to fetch own feed, proceeding without deduplication:', err.message);
    }

    // 2. Fetch raw Instagram posts using the selected provider
    let scrapedPosts = [];

    if (igProvider === 'apify') {
      if (!igApifyToken) {
        return res.status(400).json({ error: 'Apify API Token is required for Apify provider.' });
      }
      console.log(`[Instagram Trends] Scraping via Apify with token: ${igApifyToken.substring(0, 8)}...`);
      const apifyUrl = `https://api.apify.com/v2/acts/apify~instagram-hashtag-scraper/run-sync-get-dataset-items?token=${igApifyToken}`;
      
      const response = await fetch(apifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hashtags: hashtags,
          resultsLimit: 15
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Apify Scraper failed: ${response.statusText} (${errText})`);
      }

      const items = await response.json();
      if (Array.isArray(items)) {
        scrapedPosts = items.map(item => ({
          caption: item.caption || '',
          url: item.url || '',
          likesCount: item.likesCount || 0,
          ownerUsername: item.ownerUsername || ''
        }));
      }
    } else if (igProvider === 'rapidapi') {
      if (!igRapidApiKey || !igRapidApiHost || !igRapidApiUrl) {
        return res.status(400).json({ error: 'RapidAPI Key, Host, and URL are required for RapidAPI provider.' });
      }
      console.log(`[Instagram Trends] Scraping via RapidAPI Host: ${igRapidApiHost}`);
      
      for (const tag of hashtags) {
        try {
          const url = igRapidApiUrl.includes('?') 
            ? `${igRapidApiUrl}&hashtag=${encodeURIComponent(tag)}` 
            : `${igRapidApiUrl}?hashtag=${encodeURIComponent(tag)}`;
            
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'x-rapidapi-key': igRapidApiKey,
              'x-rapidapi-host': igRapidApiHost
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            let posts = [];
            if (Array.isArray(data)) {
              posts = data;
            } else if (data.data && Array.isArray(data.data.items)) {
              posts = data.data.items;
            } else if (Array.isArray(data.items)) {
              posts = data.items;
            } else if (data.data && Array.isArray(data.data)) {
              posts = data.data;
            }
            
            posts.slice(0, 10).forEach(post => {
              scrapedPosts.push({
                caption: post.caption || post.text || (post.caption && post.caption.text) || '',
                url: post.url || post.link || (post.code ? `https://instagram.com/p/${post.code}` : ''),
                likesCount: post.likesCount || post.like_count || 0,
                ownerUsername: post.ownerUsername || (post.owner && post.owner.username) || ''
              });
            });
          } else {
            console.warn(`[Instagram Trends] Failed to fetch RapidAPI for tag ${tag}: ${response.statusText}`);
          }
        } catch (err) {
          console.error(`[Instagram Trends] Error scraping RapidAPI for tag ${tag}:`, err.message);
        }
      }
    } else {
      return res.status(400).json({ error: `Unsupported Instagram provider: ${igProvider}` });
    }

    console.log(`[Instagram Trends] Retrieved ${scrapedPosts.length} raw posts from Instagram.`);

    if (scrapedPosts.length === 0) {
      return res.status(400).json({ error: 'No Instagram posts were successfully scraped. Verify your API keys, subscription, and hashtags list.' });
    }

    // 3. Prepare data for Gemini analysis
    const formattedPosts = scrapedPosts
      .map((p, i) => `${i+1}. [User: @${p.ownerUsername || 'creator'}] (Likes: ${p.likesCount}) URL: ${p.url}\nCaption: "${p.caption.substring(0, 250)}..."`)
      .join('\n\n');

    // 4. Instruct Gemini to analyze and find trends in the specific category
    const prompt = `You are an AI trend intelligence engine for the couples-travel blog "Classy Travel Couples" (classytravelcouples.com).
    Your task is to analyze raw Instagram posts (captions, user styles, hashtags) and extract qualifying, distinct trending travel topics specifically in the category: "${categoryLabel}".
    
    ### CRITICAL RULE:
    - Do NOT recommend or include any trending topics, destinations, itinerary ideas, or activities located in India. Filter out any India-based locations entirely.
    
    Here is the recent Instagram feed data under monitored couple travel hashtags:
    ${formattedPosts}
    
    Here is a list of topics we have ALREADY published on our site (DO NOT duplicate or recommend anything similar to these):
    ${existingTitles.map(t => `- "${t}"`).join('\n')}
    
    Based on the Instagram data (identifying popular destinations, aesthetic activities, photography angles, scenic roads, or hotel styles mentioned in captions/tags), extract as many distinct travel trends as qualify.
    
    Return ONLY a valid JSON array. Each object must have:
    - "topic" (string: the specific trending destination, itinerary idea, or travel style)
    - "score" (number: 1-100 indicating trend strength based on caption mentions, likes, and engagement)
    - "source" (string: Instagram post link or "Instagram Synthesis")
    - "categories" (array of strings: all matching category IDs from this list: ["destination_guides", "romantic_getaways", "luxury_travel", "beach_islands", "city_breaks", "budget_travel", "weekend_getaways", "road_trips", "boutique_hotels", "tips_advice", "honeymoon", "food_culinary", "photography"])
    - "tags" (array of strings, e.g. ["Instagram Trend", "Aesthetic", "Viral Reel", "Honeymoon", "Adventure"])
    
    Ensure your output is strictly a valid JSON array of objects, with no markdown tags like \`\`\`json or surrounding text.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error: ${response.statusText} (${errText})`);
    }

    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;
    
    // Clean up potential markdown formatting block wrapper
    text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    
    const trends = JSON.parse(text);
    console.log(`[Instagram Trends] Successfully extracted ${trends.length} trends.`);
    res.json(trends);

  } catch (error) {
    console.error('[Instagram Trends] Error in trend detection:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── ENDPOINT: DETECT INSTAGRAM CAROUSEL TRENDS ───────────────────────────────
app.post('/api/trends/instagram/carousels', async (req, res) => {
  const apiKey = getGeminiKey(req);
  const model = getGeminiModel(req);
  
  const {
    igProvider,
    igApifyToken,
    igRapidApiKey,
    igRapidApiHost,
    igRapidApiUrl,
    igHashtags,
    carouselType,
    destinationFocus
  } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'Gemini API Key is required. Set it in .env or settings.' });
  }

  // Parse hashtags
  let hashtags = [];
  if (Array.isArray(igHashtags)) {
    hashtags = igHashtags;
  } else if (typeof igHashtags === 'string') {
    hashtags = igHashtags.split(',').map(h => h.trim().replace(/^#/, '')).filter(Boolean);
  }
  if (hashtags.length === 0) {
    hashtags = ['coupletravel', 'travelcouples', 'coupletravelgoals'];
  }

  try {
    console.log(`[Instagram Carousels] Detecting carousel trends. Type: ${carouselType || 'general'}, Focus: ${destinationFocus || 'None'}`);
    
    // 1. Fetch own feed for deduplication
    let existingTitles = [];
    try {
      const ownFeed = await parser.parseURL(OWN_FEED_URL);
      existingTitles = ownFeed.items.map(item => item.title.toLowerCase().trim());
    } catch (err) {
      console.warn('[Instagram Carousels] Failed to fetch own feed, proceeding without deduplication:', err.message);
    }

    // 2. Fetch raw Instagram posts using the selected provider
    let scrapedPosts = [];

    if (igProvider === 'apify') {
      if (!igApifyToken) {
        return res.status(400).json({ error: 'Apify API Token is required for Apify provider.' });
      }
      console.log(`[Instagram Carousels] Scraping via Apify...`);
      const apifyUrl = `https://api.apify.com/v2/acts/apify~instagram-hashtag-scraper/run-sync-get-dataset-items?token=${igApifyToken}`;
      
      const response = await fetch(apifyUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          hashtags: hashtags,
          resultsLimit: 15
        })
      });

      if (!response.ok) {
        const errText = await response.text();
        throw new Error(`Apify Scraper failed: ${response.statusText} (${errText})`);
      }

      const items = await response.json();
      if (Array.isArray(items)) {
        scrapedPosts = items.map(item => ({
          caption: item.caption || '',
          url: item.url || '',
          likesCount: item.likesCount || 0,
          ownerUsername: item.ownerUsername || ''
        }));
      }
    } else if (igProvider === 'rapidapi') {
      if (!igRapidApiKey || !igRapidApiHost || !igRapidApiUrl) {
        return res.status(400).json({ error: 'RapidAPI Key, Host, and URL are required for RapidAPI provider.' });
      }
      console.log(`[Instagram Carousels] Scraping via RapidAPI Host: ${igRapidApiHost}`);
      
      for (const tag of hashtags) {
        try {
          const url = igRapidApiUrl.includes('?') 
            ? `${igRapidApiUrl}&hashtag=${encodeURIComponent(tag)}` 
            : `${igRapidApiUrl}?hashtag=${encodeURIComponent(tag)}`;
            
          const response = await fetch(url, {
            method: 'GET',
            headers: {
              'x-rapidapi-key': igRapidApiKey,
              'x-rapidapi-host': igRapidApiHost
            }
          });
          
          if (response.ok) {
            const data = await response.json();
            let posts = [];
            if (Array.isArray(data)) {
              posts = data;
            } else if (data.data && Array.isArray(data.data.items)) {
              posts = data.data.items;
            } else if (Array.isArray(data.items)) {
              posts = data.items;
            } else if (data.data && Array.isArray(data.data)) {
              posts = data.data;
            }
            
            posts.slice(0, 10).forEach(post => {
              scrapedPosts.push({
                caption: post.caption || post.text || (post.caption && post.caption.text) || '',
                url: post.url || post.link || (post.code ? `https://instagram.com/p/${post.code}` : ''),
                likesCount: post.likesCount || post.like_count || 0,
                ownerUsername: post.ownerUsername || (post.owner && post.owner.username) || ''
              });
            });
          }
        } catch (err) {
          console.error(`[Instagram Carousels] Error scraping RapidAPI for tag ${tag}:`, err.message);
        }
      }
    } else {
      return res.status(400).json({ error: `Unsupported Instagram provider: ${igProvider}` });
    }

    console.log(`[Instagram Carousels] Retrieved ${scrapedPosts.length} raw posts from Instagram.`);

    if (scrapedPosts.length === 0) {
      return res.status(400).json({ error: 'No Instagram posts were successfully scraped. Verify your API keys, subscription, and hashtags list.' });
    }

    // 3. Prepare data for Gemini analysis
    const formattedPosts = scrapedPosts
      .map((p, i) => `${i+1}. [User: @${p.ownerUsername || 'creator'}] (Likes: ${p.likesCount}) URL: ${p.url}\nCaption: "${p.caption.substring(0, 250)}..."`)
      .join('\n\n');

    // 4. Instruct Gemini to analyze and find carousel trends
    const prompt = `You are an AI Instagram content strategist and visual designer for the couples-travel brand "Classy Travel Couples" (classytravelcouples.com).
    Your task is to analyze recent Instagram feed data, extract trends, and synthesize a set of 6-8 distinct, highly engaging couples-travel **Instagram Carousel Post Concepts** with slide-by-slide outlines.
    
    ### Guidelines:
    - **Niche**: Strictly stylish, romantic couples-travel. Focus on romantic getaways, boutique hotels, scenic locations, date-night ideas, and couple travel tips.
    - **Vibe**: Aesthetic, inspiring, and premium (Conde Nast / Pinterest style).
    - **Format Focus**: ${carouselType === 'hotels' ? 'Places to stay, romantic hotels, best boutique stays' : (carouselType === 'things_to_do' ? 'Location-based guides, things to do, sightseeing itineraries' : (carouselType === 'budget' ? 'Travel hacks, budget value luxury, travel tips' : 'General visual trends, couple aesthetic spots'))}.
    ${destinationFocus ? `- **Location Focus**: Prioritize topics and concepts about "${destinationFocus}".` : ''}
    
    ### CRITICAL RULE:
    - Do NOT recommend or include any trending topics, destinations, itinerary ideas, or activities located in India. Filter out any India-based locations entirely.
    
    Here is a list of recent Instagram posts in this niche:
    ${formattedPosts}
    
    Here is a list of blog topics we have already published (avoid duplicating these direct concepts):
    ${existingTitles.map(t => `- "${t}"`).join('\n')}
    
    Each Carousel Concept must be structured slide-by-slide. Each carousel should have between 5 and 8 slides.
    Structure:
    - Slide 1: Cover Slide. Needs a strong, clickable hook title (e.g. "3 Hotels in Italy with Private Pools") and visual guidelines.
    - Slide 2 to N-1: Content Slides. Each must have a clear heading, short body text (bullet points or punchy text), and detailed Visual Advice (what image/video to show on the slide).
    - Slide N: Call to Action (CTA) Slide (e.g. "Save this for your next trip!", follow @classytravelcouples for more romantic escapes).
    
    Return ONLY a valid JSON array. Each object in the array must represent a carousel concept and have these exact keys:
    - "topic" (string: the catchy headline/title of the carousel)
    - "concept" (string: brief summary of the visual concept/theme)
    - "score" (number: 1-100 indicating popularity/trend strength based on post likes)
    - "carouselType" (string: matching one of ["hotels", "things_to_do", "budget", "general"])
    - "tags" (array of strings, e.g. ["Italy", "Boutique", "Aesthetic"])
    - "referenceUrls" (array of strings: URLs of 1-3 scraped Instagram posts from the list above that directly inspired this carousel theme)
    - "slides" (array of objects. Each slide object must have:
      - "slideNumber" (number: 1-indexed)
      - "title" (string: heading of the slide)
      - "body" (string: text content of the slide, formatted nicely)
      - "visualAdvice" (string: description of the background photo, video, text overlay, or layout details)
    )
    
    Ensure your output is strictly a valid JSON array of objects, with no markdown tags like \`\`\`json or surrounding text.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error: ${response.statusText} (${errText})`);
    }

    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;
    
    // Clean up potential markdown formatting block wrapper
    text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    
    const carousels = JSON.parse(text);
    console.log(`[Instagram Carousels] Successfully extracted ${carousels.length} carousel concepts.`);
    res.json(carousels);

  } catch (error) {
    console.error('[Instagram Carousels] Error in carousel detection:', error);
    res.status(500).json({ error: error.message });
  }
});

function getCategorySpecificInstructions(categoryLabel) {
  const cat = (categoryLabel || '').toLowerCase();

  if (cat.includes('food') || cat.includes('culinary') || cat.includes('eat')) {
    return `
    ### Category-Specific Structure: Food & Culinary (Gastronomic Travelogue Style)
    
    ### Required Content Blocks & Guidelines:
    1. **Sensory Table-Setting**: Describe the scene, aromas, textures, lighting, and ambient noise of a specific dining room or food stall where you sat. Write in sensory, evocative prose.
    2. **The Regional Pantry**: A deep-dive into local ingredients, native spices, heritage crops, and traditional cooking methods (e.g. clay pots, specific wood fire, fermentation).
    3. **Signature Dishes & Flavor Profiles**: Outline 3-4 specific local dishes by their authentic local names. Detail their flavor balance, texture, ingredients, and how they are prepared.
    4. **The Ultimate Splurge Experience**: Review one high-end, fine-dining or Michelin-caliber establishment. Mention specific chef credentials, tasting menu highlights, reservation tricks, and exact pricing/booking windows.
    5. **Street Food & Local Markets**: A detailed guide to busy local food markets, naming specific stalls, coordinates, and exact local snacks to order (e.g. street skewers, vendor names).
    6. **Local Beverages & Nightcaps**: Sourcing local wines, craft beers, sake, or secret cocktail lounges. Detail specific wine grapes, brewery labels, or signature drinks.
    7. **Dining Etiquette & Practicalities**: Custom dining hours, tipping standards, water safety, and reservation windows.
    
    ### Critical Formatting Rule:
    - DO NOT use the names of the content blocks (e.g. "Sensory Table-Setting", "The Regional Pantry") as headings. Generate organic, creative, editorial headings matching the destination and food culture (e.g. "Wood Smoke & Sea Air: Waking Up at the Chania Fish Market").
    `;
  }

  if (cat.includes('hotel') || cat.includes('boutique') || cat.includes('luxury') || cat.includes('stay') || cat.includes('accommodation')) {
    return `
    ### Category-Specific Structure: Boutique Hotels & Luxury Stays (Architectural Review Style)
    
    ### Required Content Blocks & Guidelines:
    1. **The Arrival & First Impression**: Describe the transition from the gate/arrival to the lobby, the ambient design elements (teak, basalt, limestone, raw linen), the hotel's signature scent, and initial service touch.
    2. **The Architectural Identity**: Detail the design philosophy, historical context or preservation, landscape integration, and how it fosters couples' privacy.
    3. **Dream Suites (Specific Rooms to Book)**: Detail 2-3 specific room numbers or categories. Highlight mattress and bedding quality, layout details (e.g., sliding screens, outdoor baths), view angles, and privacy elements.
    4. **Wellness & Plunge Pools**: Deep-dive into private plunge pools, thermal grottos, heated infinity edges, spa therapies for couples, and treatment ingredients.
    5. **Bespoke Services & Guest Experiences**: Unique amenities (e.g., butler-delivered floating breakfasts, custom sunset picnic setups, in-room bath menus).
    6. **Property Dining**: Restaurant concepts, dress codes, standout tables (e.g. "table 4 overlooking the bay"), and chef style.
    7. **Booking Window & Perks**: Saturday-to-Saturday restrictions, lead time needed to book, best booking channels, and hidden credits or loyalty perks.
    
    ### Critical Formatting Rule:
    - DO NOT use the names of the content blocks (e.g. "Arrival & First Impression", "Dream Suites") as headings. Generate organic, creative, editorial headings (e.g. "Where Basalt Meets the Aegean: First Impressions of the Caldera Suites").
    `;
  }

  if (cat.includes('road') || cat.includes('trip') || cat.includes('drive')) {
    return `
    ### Category-Specific Structure: Scenic Road Trips (Navigational Log Style)
    
    ### Required Content Blocks & Guidelines:
    1. **The Allure of the Open Highway**: Define the driving theme, terrain challenges, and recommend a specific vehicle model (e.g., 4WD Suzuki Jimny vs standard sedan) and why.
    2. **The Route Log (Mile-by-Mile)**: A step-by-step route guide with start and end points, road numbers, tolls, lane configurations, driving times, and road conditions.
    3. **Unmissable Viewpoints & Pull-offs**: Specific viewpoints with coordinate names, scenic setups, parking safety, and how to frame a couples photo.
    4. **Charming Detours & Small Towns**: 2-3 off-the-beaten-path villages or scenic detours along the route.
    5. **Road Trip Practicalities**: Car rental hacks, international driving permits, fuel/charging logistics, toll transponders, and local highway codes (e.g., speed traps, right of way).
    6. **The Cabin Vibe**: Road trip music genres, custom playlist themes, and regional road snacks.
    
    ### Critical Formatting Rule:
    - DO NOT use the names of the content blocks (e.g. "Route Log", "Road Trip Practicalities") as headings. Generate organic, creative, editorial headings (e.g. "Chapman’s Peak: Carving Through the Cape Peninsula Cliffs").
    `;
  }

  if (cat.includes('photo') || cat.includes('camera') || cat.includes('spot')) {
    return `
    ### Category-Specific Structure: Photography Spots (Visual Creator's Guide)
    
    ### Required Content Blocks & Guidelines:
    1. **Visual Love Story**: Describe the destination's unique light, color palette, and visual mood. Establish a cohesive styling theme.
    2. **The Top 4-5 Photography Spots**: For EACH spot, provide:
       - Vibe & visual description.
       - Lighting behavior: golden hour vs. blue hour transition, shadows, sun direction.
       - Recommended couple pose: candid walking, movement, silhouette instructions.
       - Camera settings: aperture (e.g. f/2.8 for bokeh), ISO, focal length (e.g. 24mm wide vs 85mm portrait), lens selection, and tripod setups.
    3. **Gear & Travel Packing**: Lightweight tripods, remote shutter releases, drone rules (licenses, local regulations), and camera bags.
    4. **Crowd-Dodging & Timing**: The exact hour to arrive (e.g., "6:15 AM before the tour buses pull in") and secret side pathways.
    
    ### Critical Formatting Rule:
    - DO NOT use the names of the content blocks (e.g. "Visual Love Story", "Photography Spots") as headings. Generate organic, creative, editorial headings (e.g. "Framing the Blue Domes: Our Guide to Santorini's Best Light").
    `;
  }

  if (cat.includes('honeymoon') || cat.includes('romantic') || cat.includes('getaway')) {
    return `
    ### Category-Specific Structure: Honeymoons & Getaways (Intimate Travel Journal Style)
    
    ### Required Content Blocks & Guidelines:
    1. **The Dreamscape**: A highly immersive, narrative introduction setting the scene of a romantic retreat.
    2. **Why This is the Ultimate Romantic Sanctuary**: Analyze what makes the destination foster intimate connection (isolation, natural beauty, silence).
    3. **Once-in-a-Lifetime Couples Splurges**: 3-4 ultra-exclusive activities (e.g. private sandbank dinners, private yacht charters, stargazing decks with sommeliers). Naming operators and estimate costs.
    4. **Intimate Dining & Candlelit Tables**: Naming specific romantic restaurants, specific table configurations (e.g., "the cliffside corner table at Da Enzo"), sunset views, and menus.
    5. **Luxury Stays for Lovers**: The absolute best romantic villas, resorts, or design inns.
    6. **Newlywed Logistics & Pacing**: Travel pacing (e.g., splitting a 10-day trip between two zones to avoid travel fatigue), luggage hacks, and pre-travel checklists.
    
    ### Critical Formatting Rule:
    - DO NOT use the names of the content blocks (e.g. "The Dreamscape", "Luxury Stays") as headings. Generate organic, creative, editorial headings (e.g. "Sailing Into the Sunset: Fiji's Most Romantic Hidden Anchorages").
    `;
  }

  if (cat.includes('beach') || cat.includes('island') || cat.includes('sea') || cat.includes('ocean')) {
    return `
    ### Category-Specific Structure: Beach & Islands (Coastal Log Style)
    
    ### Required Content Blocks & Guidelines:
    1. **Salt Air & Sunsets**: Sensory description of the ocean, sand quality, and coastal breeze.
    2. **The Secluded Coves (For Two)**: Detail 3-4 beaches. Describe sand texture (powdery white vs volcanic black), water depth, reef proximity, wind directions, and privacy levels.
    3. **Overwater Stays & Beachfront Bungalows**: Describe specific beachfront properties, overwater deck features, outdoor showers, and direct ocean access.
    4. **Ocean Activities & Sailing**: Snorkeling spots (coordinates or names), dive sites, private charters, and sea life encounters.
    5. **Barefoot Beach Dining**: Local seafood shacks, feet-in-the-sand tables, sunset bars, and typical local beach dishes.
    6. **Island Practicalities**: Tides, reef-safe sunscreen rules, local boat transfers, and seasonal winds.
    
    ### Critical Formatting Rule:
    - DO NOT use the names of the content blocks (e.g. "Secluded Coves", "Island Practicalities") as headings. Generate organic, creative, editorial headings (e.g. "Finding Powdery Sand: Our Secret Beach Hideaways in Apo Island").
    `;
  }

  if (cat.includes('city') || cat.includes('urban') || cat.includes('break')) {
    return `
    ### Category-Specific Structure: City Breaks (Urban Flâneur Guide)
    
    ### Required Content Blocks & Guidelines:
    1. **Urban Pulse**: Immersive introduction walking through the streets, describing sights, urban architecture, and energy.
    2. **Romantic Neighborhood Guide**: Break down 2-3 chic, walkable neighborhoods. Mention specific streets, design boutiques, and pocket parks.
    3. **The 48-Hour Urban Itinerary**: A detailed, chronological hourly schedule of spots to visit, cafes to stop in, and afternoon walks.
    4. **Rooftop Bars & Nightlife**: Rooftop cocktail lounges, jazz clubs, or secret speakeasies. Specify signature drinks and best times to arrive for sunset.
    5. **Boutique City Hideaways**: Cozy city hotels with design focus.
    6. **Urban Practicalities**: Transit card optimizations (e.g. Oyster, Navigo), safety, walking shortcuts, and local custom/tipping etiquette.
    
    ### Critical Formatting Rule:
    - DO NOT use the names of the content blocks (e.g. "Urban Itinerary", "Rooftop Bars") as headings. Generate organic, creative, editorial headings (e.g. "48 Hours in Saint-Germain-des-Prés: A Couple's Paris Diary").
    `;
  }

  if (cat.includes('budget') || cat.includes('hack') || cat.includes('cheap') || cat.includes('value')) {
    return `
    ### Category-Specific Structure: Budget Travel & Hacks (Points Strategist Guide)
    
    ### Required Content Blocks & Guidelines:
    1. **Affordable Luxury**: Explain how to experience high-end aesthetics and experiences without paying full price.
    2. **High-Value Accommodation Picks**: 3 budget-friendly or design-forward value stays with price estimates and specific value propositions.
    3. **Affordable Romantic Dining**: Charming local bistros, food stalls, or scenic picnic spots with local ingredients.
    4. **Points, Miles & Travel Hacks**: Specific mileage tips, airline booking tricks, credit card insurance hacks, and avoiding tourist fees.
    5. **Free & Low-Cost Couples Experiences**: Scenic hikes, botanical gardens, historic walks, and sunset viewpoints.
    6. **Budget Practicalities**: Local transport savings, tipping, free days at museums, and avoiding exchange rate traps.
    
    ### Critical Formatting Rule:
    - DO NOT use the names of the content blocks (e.g. "Affordable Luxury", "High-Value Accommodation") as headings. Generate organic, creative, editorial headings (e.g. "Points & Secret Bistros: Cruising Amalfi on a Smart Budget").
    `;
  }

  if (cat.includes('tips') || cat.includes('advice') || cat.includes('pack') || cat.includes('gear')) {
    return `
    ### Category-Specific Structure: Travel Tips & Packing (Gear Editor Guide)
    
    ### Required Content Blocks & Guidelines:
    1. **Stress-Free Planning**: How organized prep enhances couples' romance on the road.
    2. **His & Hers Packing Checklist**: Curated, stylish apparel selections, cosmetics, and flight comfort accessories.
    3. **Baggage-Sharing & Luggage Hacks**: Using compression cubes, split luggage packing, and carry-on restriction hacks.
    4. **Travel Tech & Gear Every Couple Needs**: Dual adapters, portable chargers, tripods, eSIM cards, and luggage trackers.
    5. **Pre-Trip Timeline**: Checklist starting 4 weeks before, covering visas, vaccinations, bank alerts, and home prep.
    6. **Practical Safety & Logistics**: Travel insurance advice, digital document backups, and local emergency contacts.
    
    ### Critical Formatting Rule:
    - DO NOT use the names of the content blocks (e.g. "His & Hers Packing", "Travel Tech") as headings. Generate organic, creative, editorial headings (e.g. "Split Baggage & Power Banks: How We Pack for Long-Haul Escapes").
    `;
  }

  if (cat.includes('weekend') || cat.includes('getaway') || cat.includes('quick')) {
    return `
    ### Category-Specific Structure: Weekend Getaways (Micro-Escape Planner)
    
    ### Required Content Blocks & Guidelines:
    1. **The Micro-Escape**: Setting the stage for a quick recharge.
    2. **The 48-Hour Hourly Schedule**:
       - Friday Evening: Check-in, sunset walk, and welcome dinner.
       - Saturday: Morning sights, cozy cafes, scenic lookouts, and romantic date night.
       - Sunday: Lazy brunch, quiet stroll, and checkout.
    3. **Charming Weekend Hideaways**: Cozy bed & breakfasts, boutique inns, or forest lodges.
    4. **Pacing Tips**: Travel pace recommendations to avoid feeling rushed.
    5. **Micro-Packing List**: Carry-on only packing list.
    6. **Weekend Practicalities**: Transit options and nearby scenic detours.
    
    ### Critical Formatting Rule:
    - DO NOT use the names of the content blocks (e.g. "48-Hour Hourly Schedule", "Charming Weekend Hideaways") as headings. Generate organic, creative, editorial headings (e.g. "Forty-Eight Hours in the Berkshires: Our Perfect Weekend Itinerary").
    `;
  }

  // Default Destination Guides & Others fallback
  return `
  ### General Guidelines: Destination Guides
  
  ### Required Content Blocks & Guidelines:
  1. **Introduction**: Evocative scene-setting, establishing the destination's mood.
  2. **Strategic Context**: Best months to visit, weather patterns, neighborhood guide.
  3. **Curated Accommodations**: Three distinct options (Splurge, Mid-Range, Boutique Value) with price estimates, specific room/suite recommendations.
  4. **Dining Guide**: Split into "Sunset Splurge Dinner," "Local Eats," and "Casual & Quick."
  5. **Handpicked Experiences**: List 4-5 activities with duration, pricing, and couple tips.
  6. **Photography Spots**: 3-4 specific spots for stunning couple photos, with times and posing tips.
  7. **Practicalities**: Quick reference points on transport, currency, language, safety, and stay length.
  
  ### Critical Formatting Rule:
  - DO NOT use the names of the content blocks (e.g. "Strategic Context", "Curated Accommodations") as headings. Generate organic, creative, editorial headings (e.g. "Where to Eat, Sleep, and Shoot: Our Complete Guide to Bali's Hidden Coast").
  `;
}

function getCategorySpecificPersona(categoryLabel) {
  const cat = (categoryLabel || '').toLowerCase();

  if (cat.includes('food') || cat.includes('culinary') || cat.includes('eat')) {
    return "You are a Michelin-caliber food critic and culinary historian. Your tone is sensory, indulgent, and deeply food-literate. You write about flavor, local ingredients, and table settings with passion.";
  }
  if (cat.includes('hotel') || cat.includes('boutique') || cat.includes('luxury') || cat.includes('stay') || cat.includes('accommodation')) {
    return "You are an expert Architectural Inspector and boutique hospitality designer. Your tone is sleek, design-forward, critical, and premium. You notice materials, textures, scents, and privacy layout features.";
  }
  if (cat.includes('road') || cat.includes('trip') || cat.includes('drive')) {
    return "You are an experienced Highway Navigator and adventure co-pilot. Your tone is free-spirited, punchy, and highly practical. You share real driving conditions, road codes, speed trap advice, and navigation details.";
  }
  if (cat.includes('photo') || cat.includes('camera') || cat.includes('spot')) {
    return "You are a professional Travel Photographer and Visual Director. Your tone is artistic, technical, camera-literate, and behind-the-scenes. You specify camera settings, light behavior, and couple posing instructions.";
  }
  if (cat.includes('honeymoon') || cat.includes('romantic') || cat.includes('getaway')) {
    return "You are a high-end Honeymoon Planner and Romance Advisor. Your tone is dreamy, sophisticated, narrative, and intimate. You focus on exclusive experiences and romantic pacing.";
  }
  if (cat.includes('beach') || cat.includes('island') || cat.includes('sea') || cat.includes('ocean')) {
    return "You are a Coastal Insider and Marine Naturalist. Your tone is barefoot, sun-drenched, relaxed, and sea-conscious. You know tides, reefs, local boat operations, and wind directions.";
  }
  if (cat.includes('city') || cat.includes('urban') || cat.includes('break')) {
    return "You are an Urban Flâneur and cosmopolitan trendspotter. Your tone is fast-paced, chic, culturally literate, and sharp. You guide readers through boutique streets, metro maps, and rooftops.";
  }
  if (cat.includes('budget') || cat.includes('hack') || cat.includes('cheap') || cat.includes('value')) {
    return "You are a Savvy Travel Optimizer and award-booking strategist. Your tone is analytical, practical, and empowering. You share credit card travel insurance rules, points/miles optimization, and high-value secret spots.";
  }
  if (cat.includes('tips') || cat.includes('advice') || cat.includes('pack') || cat.includes('gear')) {
    return "You are a veteran Travel Gear Editor and logistics coordinator. Your tone is decisive, highly organized, and checklist-driven. You recommend specific tech, packing methods, and timeline trackers.";
  }
  if (cat.includes('weekend') || cat.includes('getaway') || cat.includes('quick')) {
    return "You are a Micro-Escape Specialist and weekend efficiency planner. Your tone is compact, restorative, and highly time-efficient. You focus on hourly schedules, packing light, and nearby detours.";
  }
  return "You are the lead travel writer and romantic travel planner for Classy Travel Couples. Your voice is chic, highly detailed, and deeply narrative.";
}

// ─── ENDPOINT: GENERATE BLOG ──────────────────────────────────────────────────
app.post('/api/generate', async (req, res) => {
  const apiKey = getGeminiKey(req);
  const model = getGeminiModel(req);
  
  const { topic, category, context, length, tone } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'Gemini API Key is required.' });
  }
  if (!topic) {
    return res.status(400).json({ error: 'Topic is required.' });
  }

  try {
    console.log(`[Generate] Starting content generation for topic: "${topic}"`);

    const lengthGuidelines = length === 'long' 
      ? "Since the length setting is set to 'long', write highly detailed, descriptive, and expansive paragraphs for each section. Include specific historical context, local street/neighborhood names, detailed dining options, and detailed hotel guides. Aim for an immersive and comprehensive article of around 1500-2000 words in rich travel-journal prose."
      : (length === 'brief' || length === 'short' 
        ? "Aim for a concise, punchy post of around 600-800 words."
        : "Aim for a detailed, well-balanced post of around 1000-1200 words.");

    const categoryInstructions = getCategorySpecificInstructions(category);
    const categoryPersona = getCategorySpecificPersona(category);

    const prompt = `You are writing for Classy Travel Couples (classytravelcouples.com). Your readers are sophisticated, style-conscious couples who refuse to settle for ordinary itineraries. They want authentic, highly detailed, and opinionated travel logs written from the perspective of an actual couple sharing first-hand experiences, not dry AI-generated brochures.
    
    Persona: ${categoryPersona}
    Write an incredibly high-quality, comprehensive, and highly engaging blog post about: "${topic}".
    Category: ${category}.
    Tone: ${tone}.
    Length Setting: ${length}.
    User Context/Anecdotes: ${context || 'None provided.'}
    
    ### Length Guidelines:
    ${lengthGuidelines}
    
    ${categoryInstructions}
    
    ### Strict Guidelines to Follow:
    1. **Style & Branding**: 
       - The overall website typography styles headings with the 'Bebas Neue' font (all-caps, bold, modern, premium feel) and the body with 'DM Sans'. 
       - Match this structure: Write in an evocative, immersive, yet practical and opinionated voice.
       - Use clean, elegant HTML (use <h2>, <h3>, <p>, <ul>, <strong>, etc. Do not wrap in markdown syntax like \`\`\`html). Ensure there are H2s for major sections and H3s for subsections.
    2. **Narrative & Tone**:
       - Write in an opinionated, first-hand narrative style (using "we", "my partner and I", "on our last visit"). Never use dry third-person or standard AI listicle voice.
       - Avoid generic placeholders and vague phrases. Provide actual specific names of hotels, restaurants, transit passes, credit cards, or coordinates.
       - Adhere to the category-specific persona and structure exactly.
    3. **Editorial Headings**: 
       - DO NOT use the names of the category-specific sections as headings (e.g. do not write 'Sensory Table-Setting', 'The Route Log', 'Dream Suites', 'Unmissable Viewpoints', or 'Accommodations'). 
       - Instead, invent organic, creative, editorial headings that flow like a Conde Nast Traveler article. If a section is about accommodations, name it something like 'Where to Lay Your Head: Clifftop Splurges & Cozy Barns' or 'Dream Suites: Suite 12 at Anantara Bazaruto'. The headings must relate directly to the destination and content.
    4. **Deep Personal Detail**: 
       - Share vivid personal stories, exact prices/rates in USD or local currency, room numbers, name of private guides, and local secret spots. 
       - Include real-life travel friction (e.g. 'the ferry was late', 'we had to wait in line for 40 minutes, but...'). Never sound like a generic brochure.
    5. **No AI Structural Clichés**: 
       - Avoid all summary, concluding, or 'In conclusion' paragraphs at the end of the post. The post must end on a practical tip or a memorable, natural closing thought, not a summary wrap-up. 
       - Do not use balanced lists of pros/cons; make strong, opinionated recommendations.
    
    Format your entire response as a JSON object with the following exact keys (and nothing else):
    - "title": A catchy, click-worthy blog title.
    - "metaTitle": SEO-friendly meta title.
    - "metaDescription": SEO-friendly meta description (max 160 characters).
    - "excerpt": A short, intriguing summary for the blog grid layout.
    - "keywords": An array of 6-8 focus SEO keywords.
    - "bodyHtml": The main blog content formatted in clean, elegant HTML.
    - "instagram": An array of 3 distinct caption variants. Include visual descriptions, engaging hooks, and matching hashtags.
    - "pinterest": A string containing a compelling description for a Pinterest Pin, complete with keywords and hashtags.
    - "imageDescription": A detailed description of the ideal featured image for this blog post.
    Ensure your output is strictly a valid JSON object, with no markdown tags like \`\`\`json or surrounding text.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error: ${response.statusText} (${errText})`);
    }

    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;
    
    // Clean up potential markdown formatting block wrapper
    text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    
    const output = JSON.parse(text);
    console.log(`[Generate] Successfully generated blog article for topic: "${topic}"`);
    res.json(output);

  } catch (error) {
    console.error('[Generate] Error in blog generation:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to download and upload featured image to WordPress Media Library
async function uploadMediaFromUrl(wpUrl, authHeader, imageUrl, title) {
  if (!imageUrl) return null;
  try {
    console.log(`[WordPress] Downloading image for media upload: ${imageUrl}`);
    const imgResponse = await fetch(imageUrl);
    if (!imgResponse.ok) {
      throw new Error(`Failed to download image: ${imgResponse.statusText}`);
    }
    const buffer = await imgResponse.arrayBuffer();

    // Extract filename from URL path
    let filename = 'featured-image.jpg';
    try {
      const urlPath = new URL(imageUrl).pathname;
      const pathSegments = urlPath.split('/');
      const lastSegment = pathSegments[pathSegments.length - 1];
      if (lastSegment && lastSegment.includes('.')) {
        filename = lastSegment;
      }
    } catch (e) {
      // fallback filename
    }

    const uploadEndpoint = `${wpUrl}/wp-json/wp/v2/media`;
    console.log(`[WordPress] Uploading media to: ${uploadEndpoint} (Filename: ${filename})`);

    const uploadResponse = await fetch(uploadEndpoint, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Type': 'image/jpeg'
      },
      body: Buffer.from(buffer)
    });

    const mediaData = await uploadResponse.json();
    if (!uploadResponse.ok) {
      throw new Error(mediaData.message || `Media upload failed: ${uploadResponse.statusText}`);
    }

    console.log(`[WordPress] Media uploaded successfully! Media ID: ${mediaData.id}`);
    return mediaData.id;
  } catch (err) {
    console.error('[WordPress] Media upload error:', err.message);
    return null; // Return null so the post can still publish even if the image upload fails
  }
}

// ─── ENDPOINT: PUBLISH TO WORDPRESS ───────────────────────────────────────────
app.post('/api/publish', async (req, res) => {
  // Use credentials from environment or fallback to client headers for flexibility
  const wpUrl = req.headers['x-wp-url'] || process.env.WP_URL || '';
  const wpUsername = req.headers['x-wp-username'] || process.env.WP_USERNAME || '';
  const wpPassword = req.headers['x-wp-password'] || process.env.WP_APPLICATION_PASSWORD || '';
  
  const { title, bodyHtml, excerpt, status, featuredImageUrl, categories, categorySlugs, date, metaTitle, metaDescription, keywords } = req.body;

  if (!wpUrl || !wpUsername || !wpPassword) {
    return res.status(400).json({ 
      error: 'WordPress credentials are missing. Set WP_URL, WP_USERNAME, and WP_APPLICATION_PASSWORD in .env or provide headers.' 
    });
  }

  if (!title || !bodyHtml) {
    return res.status(400).json({ error: 'Title and bodyHtml are required to publish.' });
  }

  try {
    const cleanWpUrl = wpUrl.replace(/\/$/, '');
    const apiEndpoint = `${cleanWpUrl}/wp-json/wp/v2/posts`;
    const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
    const authHeader = `Basic ${base64Auth}`;

    // 1. Upload featured image if provided
    let featuredMediaId = null;
    if (featuredImageUrl) {
      featuredMediaId = await uploadMediaFromUrl(cleanWpUrl, authHeader, featuredImageUrl, title);
    }

    // 2. Resolve Category Slugs dynamically from WordPress API
    let resolvedCategoryIds = [];
    if (categorySlugs && Array.isArray(categorySlugs)) {
      try {
        const catEndpoint = `${cleanWpUrl}/wp-json/wp/v2/categories?per_page=100`;
        console.log(`[WordPress] Resolving category slugs from: ${catEndpoint}`);
        const catResponse = await fetch(catEndpoint, {
          headers: { 'Authorization': authHeader }
        });
        if (catResponse.ok) {
          const wpCategories = await catResponse.json();
          categorySlugs.forEach(slug => {
            // Normalize slug (e.g. romantic_getaways -> romantic-getaways)
            const normalizedSlug = slug.toLowerCase().trim().replace(/_/g, '-');
            const matched = wpCategories.find(c => c.slug === normalizedSlug);
            if (matched) {
              resolvedCategoryIds.push(matched.id);
            }
          });
          console.log(`[WordPress] Resolved category slugs [${categorySlugs.join(', ')}] to IDs: [${resolvedCategoryIds.join(', ')}]`);
        } else {
          console.warn(`[WordPress] Category request failed: ${catResponse.statusText}`);
        }
      } catch (catErr) {
        console.warn('[WordPress] Failed to fetch or match categories:', catErr.message);
      }
    }

    // 3. Build the publish payload
    const payload = {
      title: title,
      content: bodyHtml,
      excerpt: excerpt || '',
    };

    // Handle featured media assignment
    if (featuredMediaId) {
      payload.featured_media = featuredMediaId;
    }

    // Combine direct numeric category IDs and resolved slug IDs
    let finalCategoryIds = [];
    if (categories && Array.isArray(categories)) {
      finalCategoryIds = [...categories];
    }
    resolvedCategoryIds.forEach(id => {
      if (!finalCategoryIds.includes(id)) {
        finalCategoryIds.push(id);
      }
    });

    if (finalCategoryIds.length > 0) {
      payload.categories = finalCategoryIds;
    }

    // Handle scheduling date
    if (date) {
      payload.date = date;
      const targetDate = new Date(date);
      const now = new Date();
      if (targetDate > now) {
        payload.status = 'future';
      } else {
        payload.status = status || 'publish';
      }
    } else {
      payload.status = status || 'draft';
    }

    // Handle Yoast / RankMath SEO meta fields
    const meta = {};
    if (metaTitle) {
      meta['_yoast_wpseo_title'] = metaTitle;
      meta['rank_math_title'] = metaTitle;
    }
    if (metaDescription) {
      meta['_yoast_wpseo_metadesc'] = metaDescription;
      meta['rank_math_description'] = metaDescription;
    }
    if (keywords) {
      const focusKeyword = Array.isArray(keywords) ? keywords[0] : keywords;
      meta['_yoast_wpseo_focuskw'] = focusKeyword;
      meta['rank_math_focus_keyword'] = focusKeyword;
    }
    if (Object.keys(meta).length > 0) {
      payload.meta = meta;
    }

    console.log(`[WordPress] Publishing post to: ${apiEndpoint} (Status: ${payload.status})`);

    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `WordPress Error: ${response.statusText}`);
    }

    console.log(`[WordPress] Published successfully! Post ID: ${data.id}, Link: ${data.link}`);
    res.json({
      success: true,
      postId: data.id,
      link: data.link,
      editLink: `${cleanWpUrl}/wp-admin/post.php?post=${data.id}&action=edit`,
      status: data.status
    });

  } catch (error) {
    console.error('[WordPress] Failed to publish post:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── ENDPOINT: SAVE TRENDS TO EXCEL ───────────────────────────
const XLSX = require('xlsx');
app.post('/api/save-excel', (req, res) => {
  const trendsHistory = req.body.trendsHistory || [];
  
  try {
    console.log(`[Excel] Saving ${trendsHistory.length} trends to trends_history.xlsx...`);
    
    // Map items to sheet rows
    const data = trendsHistory.map((item, idx) => {
      const topic = item.topic || '';
      const score = item.score || 0;
      const categories = (item.categories || []).map(c => c.label).join(', ');
      const sources = (item.sources || []).join(', ');
      const date = new Date(item.detectedAt).toLocaleString();
      const categoryLabel = item.categories?.[0]?.label || 'Destination Guides';
      
      // Pre-filled Master Prompt for this specific topic
      const manualPrompt = `You are an expert travel blogger for Classy Travel Couples (classytravelcouples.com).
Write a high-quality blog post about: "${topic}".
Category: ${categoryLabel}.
Tone: romantic.
Length setting: standard.

Please format your entire response as a JSON object with the following exact keys:
- "title": A catchy blog title.
- "metaTitle": SEO friendly meta title.
- "metaDescription": SEO friendly meta description (max 160 chars).
- "excerpt": Short summary for the blog grid.
- "keywords": Array of 5-8 SEO keywords.
- "bodyHtml": The main blog content formatted in nice HTML (use <h2>, <h3>, <p>, <ul>, <strong>, etc. Do not wrap in markdown tags like \`\`\`html).
- "instagram": Array of 3 strings (different caption variants for IG, include hashtags).
- "pinterest": String (a catchy Pinterest pin description with keywords and hashtags).
- "imageDescription": String (a description of the featured image for this blog post).

CRITICAL INSTRUCTION: Output ONLY a valid JSON object. Do not wrap in markdown \`\`\`json blocks. Ensure keys are double-quoted and special characters inside HTML body or descriptions are properly escaped to form a parsing-safe JSON.`;

      return {
        '#': idx + 1,
        'Detected Topic': topic,
        'Signal Score': score,
        'Category Tags': categories,
        'Sources': sources,
        'Scanned Date/Time': date,
        'Manual AI Prompt': manualPrompt
      };
    });

    // Load existing workbook if exists, or create a new one
    const fs = require('fs');
    const filePaths = [
      path.join(__dirname, 'trends_history.xlsx'),
      path.join(__dirname, 'Trending Blog Topics.xlsx')
    ];

    let updatedAny = false;
    filePaths.forEach(filePath => {
      if (fs.existsSync(filePath)) {
        console.log(`[Excel] File exists, loading: ${filePath}`);
        try {
          const workbook = XLSX.readFile(filePath);
          const worksheet = XLSX.utils.json_to_sheet(data);

          // Overwrite Trends History sheet if it exists, otherwise add it
          if (workbook.SheetNames.includes('Trends History')) {
            workbook.Sheets['Trends History'] = worksheet;
          } else {
            workbook.SheetNames.unshift('Trends History');
            workbook.Sheets['Trends History'] = worksheet;
          }
          
          // Set column widths to make it highly readable, especially for the prompt column
          worksheet['!cols'] = [
            { wch: 5 },   // #
            { wch: 35 },  // Topic
            { wch: 12 },  // Score
            { wch: 25 },  // Categories
            { wch: 25 },  // Sources
            { wch: 22 },  // Date
            { wch: 80 }   // Prompt
          ];

          console.log(`[Excel] Saving workbook back to: ${filePath}`);
          XLSX.writeFile(workbook, filePath);
          console.log(`[Excel] Excel file successfully updated: ${filePath}`);
          updatedAny = true;
        } catch (e) {
          console.error(`[Excel] Error writing to ${filePath}:`, e.message);
        }
      }
    });

    if (!updatedAny) {
      const defaultPath = path.join(__dirname, 'trends_history.xlsx');
      console.log(`[Excel] Creating new workbook at default path: ${defaultPath}`);
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(data);
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Trends History');
      
      worksheet['!cols'] = [
        { wch: 5 },   // #
        { wch: 35 },  // Topic
        { wch: 12 },  // Score
        { wch: 25 },  // Categories
        { wch: 25 },  // Sources
        { wch: 22 },  // Date
        { wch: 80 }   // Prompt
      ];
      XLSX.writeFile(workbook, defaultPath);
    }

    res.json({ success: true, filePaths });
    
  } catch (error) {
    console.error('[Excel] Error writing Excel file:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── ENDPOINT: GET FACT CHECK POSTS ──────────────────────────────────────────
app.get('/api/fact-check/posts', async (req, res) => {
  const wpUrl = req.headers['x-wp-url'] || process.env.WP_URL || '';
  const wpUsername = req.headers['x-wp-username'] || process.env.WP_USERNAME || '';
  const wpPassword = req.headers['x-wp-password'] || process.env.WP_APPLICATION_PASSWORD || '';

  if (!wpUrl || !wpUsername || !wpPassword) {
    return res.status(400).json({ error: 'WordPress credentials are missing. Set them in .env or provide headers.' });
  }

  try {
    const cleanWpUrl = wpUrl.replace(/\/$/, '');
    const apiEndpoint = `${cleanWpUrl}/wp-json/wp/v2/posts?per_page=100&status=publish,draft,future,pending`;
    const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
    const authHeader = `Basic ${base64Auth}`;

    console.log(`[FactChecker] Fetching posts from: ${apiEndpoint}`);
    const response = await fetch(apiEndpoint, {
      headers: { 'Authorization': authHeader }
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      throw new Error(data.message || `WordPress Error: ${response.statusText}`);
    }

    const posts = await response.json();
    console.log(`[FactChecker] Successfully fetched ${posts.length} posts.`);

    const simplifiedPosts = posts.map(post => ({
      id: post.id,
      title: post.title.rendered,
      status: post.status,
      link: post.link,
      date: post.date,
      excerpt: post.excerpt.rendered
    }));

    res.json(simplifiedPosts);
  } catch (error) {
    console.error('[FactChecker] Error fetching posts:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── ENDPOINT: RUN FACT CHECK / QA REPORT ─────────────────────────────────────
app.post('/api/fact-check/run', async (req, res) => {
  const apiKey = getGeminiKey(req);
  const model = getGeminiModel(req);
  const wpUrl = req.headers['x-wp-url'] || process.env.WP_URL || '';
  const wpUsername = req.headers['x-wp-username'] || process.env.WP_USERNAME || '';
  const wpPassword = req.headers['x-wp-password'] || process.env.WP_APPLICATION_PASSWORD || '';

  const { id } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'Gemini API Key is required.' });
  }
  if (!id) {
    return res.status(400).json({ error: 'Post ID is required.' });
  }
  if (!wpUrl || !wpUsername || !wpPassword) {
    return res.status(400).json({ error: 'WordPress credentials are missing.' });
  }

  try {
    const cleanWpUrl = wpUrl.replace(/\/$/, '');
    const postEndpoint = `${cleanWpUrl}/wp-json/wp/v2/posts/${id}`;
    const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
    const authHeader = `Basic ${base64Auth}`;

    console.log(`[FactChecker] Fetching post details for ID ${id}...`);
    const postResponse = await fetch(postEndpoint, {
      headers: { 'Authorization': authHeader }
    });

    if (!postResponse.ok) {
      const data = await postResponse.json().catch(() => ({}));
      throw new Error(data.message || `WordPress Error: ${postResponse.statusText}`);
    }

    const post = await postResponse.json();
    console.log(`[FactChecker] Successfully loaded post: "${post.title.rendered}"`);

    const prompt = `You are a professional travel editor and facts auditor for Classy Travel Couples (classytravelcouples.com).
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
    console.log(`[FactChecker] Analyzing post via Gemini API with Google Search grounding...`);
    
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ google_search: {} }]
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error: ${response.statusText} (${errText})`);
    }

    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;
    
    // Clean up potential markdown formatting block wrapper
    text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    
    const output = JSON.parse(text);
    console.log(`[FactChecker] QA completed. Status: ${output.qaStatus}`);

    // If groundingMetadata exists, append to response for visibility of search queries
    if (data.candidates[0].groundingMetadata) {
      output.groundingMetadata = data.candidates[0].groundingMetadata;
    }

    res.json({
      success: true,
      originalPost: {
        id: post.id,
        title: post.title.rendered,
        content: post.content.rendered,
        metaTitle: post.meta?._yoast_wpseo_title || post.meta?.rank_math_title || '',
        metaDescription: post.meta?._yoast_wpseo_metadesc || post.meta?.rank_math_description || ''
      },
      qaReport: output
    });

  } catch (error) {
    console.error('[FactChecker] Error in fact check:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── ENDPOINT: GENERATE REWRITE ───────────────────────────────────────────────
app.post('/api/fact-check/rewrite', async (req, res) => {
  const apiKey = getGeminiKey(req);
  const model = getGeminiModel(req);
  
  const { originalPost, qaReport } = req.body;

  if (!apiKey) {
    return res.status(400).json({ error: 'Gemini API Key is required.' });
  }
  if (!originalPost || !qaReport) {
    return res.status(400).json({ error: 'Original post and QA report are required.' });
  }

  try {
    console.log(`[FactChecker] Generating rewrite draft for post ID: ${originalPost.id}...`);

    const prompt = `You are the lead travel writer for Classy Travel Couples (classytravelcouples.com).
Your task is to rewrite the following blog post HTML to apply the corrections and improvements identified in the QA audit report.

Original Title: "${originalPost.title}"
Original HTML Body:
${originalPost.content}

QA Audit Report:
${JSON.stringify(qaReport, null, 2)}

Strict Guidelines for the Rewrite:
1. Apply all corrections in the 'discrepancies' section (e.g. update hotel prices, correct restaurant names, update opening hours/status, add warning/callout boxes for closures).
2. Follow all 'recommendations' in the report.
3. Brand Guidelines (Crucial!):
   - Maintain the evocative, first-person couples-travel narrative style (using "we", "my partner and I", "on our last visit"). Never use third-person or standard AI listicle voice.
   - Use clean, elegant HTML. Headings must be formatted correctly (H2s for major sections, H3s for subsections).
   - DO NOT use the names of category content blocks as headings (e.g. no headings like 'Strategic Context', 'Accommodations', 'Photography Spot Guide', 'Practicalities'). Use organic, creative, Conde-Nast-style editorial headings (e.g. 'Where to Lay Your Head', 'Frames and Lighting', 'A Couple's Survival Log').
   - Keep the styling cards like '<div class="hotel-card">', '<div class="tip-box">', '<div class="ctc-summary-card">' exactly intact. Just edit the text/prices inside them.
   - Avoid concluding summaries or 'In conclusion' sections. End on a memorable, natural note or practical tip.
4. Output should be formatted as a JSON object with the following exact keys:
   - "title": Revised post title (or original if good).
   - "metaTitle": Revised SEO meta title.
   - "metaDescription": Revised SEO meta description.
   - "bodyHtml": The complete rewritten HTML body content.

Ensure your output is strictly a valid JSON object, with no markdown tags like \`\`\`json or surrounding text.`;

    const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API Error: ${response.statusText} (${errText})`);
    }

    const data = await response.json();
    let text = data.candidates[0].content.parts[0].text;
    
    // Clean up potential markdown formatting block wrapper
    text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
    
    const output = JSON.parse(text);
    console.log(`[FactChecker] Rewrite generated successfully for ID ${originalPost.id}.`);
    res.json(output);

  } catch (error) {
    console.error('[FactChecker] Error generating rewrite:', error);
    res.status(500).json({ error: error.message });
  }
});

// ─── ENDPOINT: APPLY FACT CHECK CHANGES ───────────────────────────────────────
const logPath = path.join(__dirname, 'qa_changes_log.json');

function logBlogChange(postId, title, changesList) {
  if (!changesList || !Array.isArray(changesList) || changesList.length === 0) return;
  try {
    const fs = require('fs');
    let logs = [];
    if (fs.existsSync(logPath)) {
      const fileData = fs.readFileSync(logPath, 'utf8');
      logs = JSON.parse(fileData || '[]');
    }
    
    // Remove any existing entry for this postId to prevent duplicates, then insert fresh at top
    logs = logs.filter(log => log.postId !== postId);
    
    logs.unshift({
      postId: parseInt(postId),
      title: title,
      status: 'updated',
      updatedAt: new Date().toISOString(),
      changes: changesList
    });
    
    // Keep only last 100 entries
    if (logs.length > 100) {
      logs = logs.slice(0, 100);
    }
    
    fs.writeFileSync(logPath, JSON.stringify(logs, null, 2), 'utf8');
    console.log(`[FactChecker] Logged changes for post ID ${postId} successfully.`);
  } catch (err) {
    console.error('[FactChecker] Failed to write changes log:', err.message);
  }
}

app.get('/api/fact-check/log', (req, res) => {
  try {
    const fs = require('fs');
    let logs = [];
    if (fs.existsSync(logPath)) {
      const fileData = fs.readFileSync(logPath, 'utf8');
      logs = JSON.parse(fileData || '[]');
    }
    res.json(logs);
  } catch (error) {
    console.error('[FactChecker] Error reading log file:', error);
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/fact-check/apply', async (req, res) => {
  const wpUrl = req.headers['x-wp-url'] || process.env.WP_URL || '';
  const wpUsername = req.headers['x-wp-username'] || process.env.WP_USERNAME || '';
  const wpPassword = req.headers['x-wp-password'] || process.env.WP_APPLICATION_PASSWORD || '';

  const { id, title, bodyHtml, metaTitle, metaDescription, changes } = req.body;

  if (!wpUrl || !wpUsername || !wpPassword) {
    return res.status(400).json({ error: 'WordPress credentials are missing.' });
  }
  if (!id || !title || !bodyHtml) {
    return res.status(400).json({ error: 'Post ID, title, and bodyHtml are required.' });
  }

  try {
    const cleanWpUrl = wpUrl.replace(/\/$/, '');
    const apiEndpoint = `${cleanWpUrl}/wp-json/wp/v2/posts/${id}`;
    const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
    const authHeader = `Basic ${base64Auth}`;

    const payload = {
      title: title,
      content: bodyHtml,
      meta: {}
    };

    if (metaTitle) {
      payload.meta['_yoast_wpseo_title'] = metaTitle;
      payload.meta['rank_math_title'] = metaTitle;
    }
    if (metaDescription) {
      payload.meta['_yoast_wpseo_metadesc'] = metaDescription;
      payload.meta['rank_math_description'] = metaDescription;
    }

    // Clean up empty meta object if nothing was added
    if (Object.keys(payload.meta).length === 0) {
      delete payload.meta;
    }

    console.log(`[FactChecker] Updating post ID ${id} on WordPress: ${apiEndpoint}`);
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': authHeader
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `WordPress Error: ${response.statusText}`);
    }

    console.log(`[FactChecker] Successfully updated post ID ${id}. Link: ${data.link}`);
    
    // Log changes if provided
    if (changes && Array.isArray(changes)) {
      logBlogChange(id, title, changes);
    }

    res.json({
      success: true,
      postId: data.id,
      link: data.link,
      status: data.status
    });

  } catch (error) {
    console.error('[FactChecker] Error applying post update:', error);
    res.status(500).json({ error: error.message });
  }
});


// ─── ENDPOINT: BATCH FACT CHECK AUDIT ──────────────────────────────────────────
let batchStatus = { active: false, current: 0, total: 0, statusText: 'Idle' };

async function executeQACheck(post, apiKey, model) {
  const prompt = `You are a professional travel editor and facts auditor for Classy Travel Couples (classytravelcouples.com).
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
  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ google_search: {} }]
    })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini QA Error: ${response.statusText} (${errText})`);
  }

  const data = await response.json();
  let text = data.candidates[0].content.parts[0].text;
  text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
  return JSON.parse(text);
}

async function executeRewrite(post, qaReport, apiKey, model) {
  const prompt = `You are the lead travel writer for Classy Travel Couples (classytravelcouples.com).
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

  const apiEndpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini Rewrite Error: ${response.statusText} (${errText})`);
  }

  const data = await response.json();
  let text = data.candidates[0].content.parts[0].text;
  text = text.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim();
  return JSON.parse(text);
}

async function executeApply(id, rewrite, qaReport, cleanWpUrl, authHeader) {
  const apiEndpoint = `${cleanWpUrl}/wp-json/wp/v2/posts/${id}`;
  const payload = {
    title: rewrite.title,
    content: rewrite.bodyHtml,
    meta: {}
  };

  if (rewrite.metaTitle) {
    payload.meta['_yoast_wpseo_title'] = rewrite.metaTitle;
    payload.meta['rank_math_title'] = rewrite.metaTitle;
  }
  if (rewrite.metaDescription) {
    payload.meta['_yoast_wpseo_metadesc'] = rewrite.metaDescription;
    payload.meta['rank_math_description'] = rewrite.metaDescription;
  }

  if (Object.keys(payload.meta).length === 0) {
    delete payload.meta;
  }

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': authHeader
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.message || `WordPress Error: ${response.statusText}`);
  }
  
  // Format changes list for log
  const changes = [];
  if (qaReport.discrepancies && qaReport.discrepancies.length > 0) {
    qaReport.discrepancies.forEach(d => {
      changes.push(`Corrected: "${d.originalText}" ➔ "${d.correctedText}". Reason: ${d.reason}`);
    });
  }
  if (qaReport.recommendations && qaReport.recommendations.length > 0) {
    qaReport.recommendations.forEach(r => {
      changes.push(`Recommendation: ${r}`);
    });
  }
  if (changes.length === 0) {
    changes.push("Performed editorial review and branding compliance updates.");
  }
  
  // Log changes
  logBlogChange(id, rewrite.title, changes);
}

async function runBatchAudit(wpUrl, wpUsername, wpPassword, apiKey, model) {
  if (batchStatus.active) {
    console.log('[BatchAudit] Batch audit already active. Skipping.');
    return;
  }
  
  batchStatus.active = true;
  batchStatus.current = 0;
  batchStatus.total = 0;
  batchStatus.statusText = 'Initializing batch audit...';
  
  try {
    const cleanWpUrl = wpUrl.replace(/\/$/, '');
    const listEndpoint = `${cleanWpUrl}/wp-json/wp/v2/posts?per_page=100&status=publish,draft`;
    const base64Auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
    const authHeader = `Basic ${base64Auth}`;

    console.log(`[BatchAudit] Fetching posts for batch audit...`);
    const listResponse = await fetch(listEndpoint, { headers: { 'Authorization': authHeader } });
    if (!listResponse.ok) {
      throw new Error(`WordPress error: ${listResponse.statusText}`);
    }
    
    const posts = await listResponse.json();
    // Read already completed posts from the log
    const fs = require('fs');
    let completedPostIds = [];
    try {
      if (fs.existsSync(logPath)) {
        const logData = JSON.parse(fs.readFileSync(logPath, 'utf8') || '[]');
        completedPostIds = logData.map(log => log.postId);
      }
    } catch (e) {
      console.error('Error reading logPath:', e.message);
    }
    
    // Filter out already completed posts
    const pendingPosts = posts.filter(post => !completedPostIds.includes(post.id));

    // Slice latest 20 pending posts for auditing
    const targetPosts = pendingPosts.slice(0, 20);
    batchStatus.total = targetPosts.length;
    console.log(`[BatchAudit] Found ${posts.length} posts. Skipped ${completedPostIds.length} completed. Selected latest ${targetPosts.length} pending posts.`);
    
    for (let i = 0; i < targetPosts.length; i++) {
      const post = targetPosts[i];
      batchStatus.current = i + 1;
      batchStatus.statusText = `Auditing blog ${i + 1}/${targetPosts.length}: "${post.title.rendered}"`;
      console.log(`[BatchAudit] [${i + 1}/${targetPosts.length}] Processing ID ${post.id}: "${post.title.rendered}"`);
      
      try {
        // 1. Run QA check
        const qaReport = await executeQACheck(post, apiKey, model);
        
        // 2. Generate Rewrite
        const rewrite = await executeRewrite(post, qaReport, apiKey, model);
        
        // 3. Apply changes to WordPress
        await executeApply(post.id, rewrite, qaReport, cleanWpUrl, authHeader);
        
        console.log(`[BatchAudit] [${i + 1}/${targetPosts.length}] Completed ID ${post.id}.`);
      } catch (postErr) {
        console.error(`[BatchAudit] Failed processing post ID ${post.id}:`, postErr.message);
      }
      
      // Delay to respect API limits (5 seconds)
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
    
    batchStatus.statusText = 'Completed successfully!';
    console.log(`[BatchAudit] Batch audit completed successfully.`);
  } catch (error) {
    batchStatus.statusText = `Error: ${error.message}`;
    console.error('[BatchAudit] Error in batch audit:', error);
  } finally {
    batchStatus.active = false;
  }
}

app.get('/api/fact-check/batch-status', (req, res) => {
  res.json(batchStatus);
});

app.post('/api/fact-check/batch', (req, res) => {
  const apiKey = getGeminiKey(req);
  const model = getGeminiModel(req);
  const wpUrl = req.headers['x-wp-url'] || process.env.WP_URL || '';
  const wpUsername = req.headers['x-wp-username'] || process.env.WP_USERNAME || '';
  const wpPassword = req.headers['x-wp-password'] || process.env.WP_APPLICATION_PASSWORD || '';

  if (!apiKey) {
    return res.status(400).json({ error: 'Gemini API Key is required.' });
  }
  if (!wpUrl || !wpUsername || !wpPassword) {
    return res.status(400).json({ error: 'WordPress credentials are missing.' });
  }

  if (batchStatus.active) {
    return res.status(400).json({ error: 'A batch audit is already running.' });
  }

  // Trigger batch audit asynchronously in background
  runBatchAudit(wpUrl, wpUsername, wpPassword, apiKey, model);
  
  res.json({
    success: true,
    message: 'Batch audit successfully started in background.'
  });
});


// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`=====================================================`);
  console.log(`Classy Travel Couples Engine running on: http://localhost:${PORT}`);
  console.log(`=====================================================`);
});
