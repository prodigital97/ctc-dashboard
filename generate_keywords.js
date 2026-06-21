const fs = require('fs');
const path = require('path');

// ─── DATA SOURCES FOR FORMULAS ──────────────────────────────
const destinations = [
  'Crete', 'Maldives', 'Santorini', 'Amalfi Coast', 'Kyoto', 'Maui', 'Bali', 'Tuscany', 
  'Swiss Alps', 'Reykjavik', 'Bora Bora', 'Dubrovnik', 'Queenstown', 'Saint Lucia', 'Cape Town', 
  'Mallorca', 'Saint-Tropez', 'Seychelles', 'Tulum', 'Venice', 'Florence', 'Lake Como', 
  'Lisbon', 'Barcelona', 'Vienna', 'Salzburg', 'Banff', 'Aspen', 'Whistler', 'Sedona', 
  'Napa Valley', 'Kauai', 'Oahu', 'Tahiti', 'Fiji', 'Phuket', 'Krabi', 'Koh Samui', 
  'Siem Reap', 'Chiang Mai', 'Cappadocia', 'Marrakech'
];

const budgetDestinations = [
  'Bali', 'Thailand', 'Vietnam', 'Portugal', 'Greece', 'Morocco', 'Croatia', 'Costa Rica',
  'Mexico', 'Colombia', 'Turkey', 'Hungary', 'Poland', 'Spain', 'South Africa', 'Georgia',
  'Romania', 'Philippines', 'Albania', 'Montenegro', 'Bulgaria', 'Malaysia', 'Ecuador'
];

const years = ['2026', '2027'];

const activities = [
  'beach', 'adventure', 'history', 'foodie', 'hiking', 'relaxation', 'shopping', 'culture', 
  'nightlife', 'diving', 'spa', 'wine tasting', 'skiing', 'wildlife', 'sailing', 'road trips', 
  'yoga', 'museums', 'photography', 'wellness'
];

const popularSpots = [
  'Amalfi Coast', 'Santorini', 'Paris', 'Maldives', 'Bali', 'Kyoto', 'Rome', 'Barcelona', 
  'Venice', 'Maui', 'Bora Bora', 'Tuscany', 'London', 'New York City', 'Phuket', 'Dubrovnik', 
  'Seychelles', 'Lake Como', 'Ibiza', 'Mykonos'
];

const regions = [
  'New England', 'Pacific Northwest', 'Napa Valley', 'Hudson Valley', 'Texas Hill Country', 
  'Blue Ridge Mountains', 'Outer Banks', 'Florida Keys', 'Midwest', 'Southern California', 
  'Great Lakes', 'Finger Lakes', 'Catskills', 'Berkshire Mountains', 'Cape Cod', 'Door County', 
  'Willamette Valley', 'Columbia River Gorge', 'Outer Hebrides', 'Scottish Highlands', 'Cornwall', 
  'Cotswolds', 'Lake District', 'Bavaria', 'Provence', 'Loire Valley', 'Alsace', 'Algarve', 'Andalusia'
];

const luxuryExperiences = [
  'overwater bungalows', 'private pool villas', 'first class flights', 'business class flights', 
  '5-star resorts', 'private yacht charters', 'helicopter tours', 'Michelin star dining', 
  'hot air balloon rides', 'private safaris', 'thermal spa resorts', 'castle stays', 
  'luxury train travel', 'private beach dinners', 'VIP airport lounges', 'private island resorts',
  'penthouse suites', 'private butler services'
];

// ─── GENERATE ROWS ──────────────────────────────────────────
const rows = [];

// Helper to escape CSV values
function escapeCsv(value) {
  if (value === null || value === undefined) return '';
  let str = value.toString();
  str = str.replace(/"/g, '""');
  if (str.search(/("|,|\n|\r)/g) >= 0) {
    str = '"' + str + '"';
  }
  return str;
}

// 1. High-End Romance: [Destination] luxury guide for couples [Year]
destinations.forEach(dest => {
  years.forEach(year => {
    const keyword = `${dest} luxury guide for couples ${year}`;
    rows.push({
      category: 'High-End Romance',
      formula: '[Destination] luxury guide for couples [Year]',
      keyword: keyword,
      target: dest,
      intent: 'Commercial / Transactional (Premium planning)'
    });
  });
});

// 2. Compromise Trips: couples trips for [Activity 1] and [Activity 2] lovers
// Generate unique combinations of activities
for (let i = 0; i < activities.length; i++) {
  for (let j = i + 1; j < activities.length; j++) {
    // Limit activity combos to keep list balanced and highly relevant
    if (i < 10 && j < 10) {
      const act1 = activities[i];
      const act2 = activities[j];
      const keyword = `couples trips for ${act1} and ${act2} lovers`;
      rows.push({
        category: 'Compromise Trips',
        formula: 'couples trips for [Activity 1] and [Activity 2] lovers',
        keyword: keyword,
        target: `${act1} + ${act2}`,
        intent: 'Informational (Inspirational routing)'
      });
    }
  }
}

// 3. Alternative Gems: alternatives to [Popular Spot] for couples
popularSpots.forEach(spot => {
  const keyword = `alternatives to ${spot} for couples`;
  rows.push({
    category: 'Alternative Gems',
    formula: 'alternatives to [Popular Spot] for couples',
    keyword: keyword,
    target: spot,
    intent: 'Informational / Commercial (Under-the-radar alternatives)'
  });
});

// 4. Budget-Luxury: affordable luxury destinations for couples [Year]
budgetDestinations.forEach(dest => {
  years.forEach(year => {
    const keyword = `affordable luxury destinations for couples in ${dest} ${year}`;
    rows.push({
      category: 'Budget-Luxury',
      formula: 'affordable luxury destinations for couples in [Country/Region] [Year]',
      keyword: keyword,
      target: dest,
      intent: 'Commercial (Value luxury travel)'
    });
  });
});

// 5. Short Getaways: romantic weekend getaways in [Region/State]
regions.forEach(region => {
  const keyword = `romantic weekend getaways in ${region}`;
  rows.push({
    category: 'Short Getaways',
    formula: 'romantic weekend getaways in [Region/State]',
    keyword: region,
    target: region,
    intent: 'Transactional (Short-haul escape planning)'
  });
});

// 6. Actionable Hacks: how to book [Luxury Experience] cheap couples
luxuryExperiences.forEach(exp => {
  const keyword = `how to book ${exp} cheap couples`;
  rows.push({
    category: 'Actionable Hacks',
    formula: 'how to book [Luxury Experience] cheap couples',
    keyword: keyword,
    target: exp,
    intent: 'Transactional / Informational (Budget hacking)'
  });
});

// ─── BUILD CSV CONTENT ──────────────────────────────────────
const headers = ['Category', 'Keyword Formula', 'Generated Keyword', 'Core Concept / Destination', 'Search Intent Type'];
const csvLines = [headers.map(escapeCsv).join(',')];

rows.forEach(r => {
  const line = [r.category, r.formula, r.keyword, r.target, r.intent];
  csvLines.push(line.map(escapeCsv).join(','));
});

// Write CSV with UTF-8 BOM for proper opening in Excel
const bom = '\ufeff';
const csvContent = bom + csvLines.join('\r\n');
const outputPath = path.join(__dirname, 'keyword_expansion_framework.csv');

fs.writeFileSync(outputPath, csvContent, 'utf8');
console.log(`Successfully generated ${rows.length} high-intent keywords inside ${outputPath}`);
