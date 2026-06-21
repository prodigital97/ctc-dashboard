const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../index.html');
let content = fs.readFileSync(filePath, 'utf8');

const startStr = "function getCategorySpecificInstructions(categoryLabel) {";
const endStr = "// ─── BLOG GENERATION ────────────────────────────────────────";

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr);

if (startIndex === -1 || endIndex === -1) {
  console.error("Could not find start or end marker in index.html");
  process.exit(1);
}

const newFunction = `function getCategorySpecificInstructions(categoryLabel) {
  const cat = (categoryLabel || '').toLowerCase();

  if (cat.includes('food') || cat.includes('culinary') || cat.includes('eat')) {
    return \`
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
    \`;
  }

  if (cat.includes('hotel') || cat.includes('boutique') || cat.includes('luxury') || cat.includes('stay') || cat.includes('accommodation')) {
    return \`
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
    \`;
  }

  if (cat.includes('road') || cat.includes('trip') || cat.includes('drive')) {
    return \`
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
    \`;
  }

  if (cat.includes('photo') || cat.includes('camera') || cat.includes('spot')) {
    return \`
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
    \`;
  }

  if (cat.includes('honeymoon') || cat.includes('romantic') || cat.includes('getaway')) {
    return \`
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
    \`;
  }

  if (cat.includes('beach') || cat.includes('island') || cat.includes('sea') || cat.includes('ocean')) {
    return \`
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
    \`;
  }

  if (cat.includes('city') || cat.includes('urban') || cat.includes('break')) {
    return \`
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
    \`;
  }

  if (cat.includes('budget') || cat.includes('hack') || cat.includes('cheap') || cat.includes('value')) {
    return \`
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
    \`;
  }

  if (cat.includes('tips') || cat.includes('advice') || cat.includes('pack') || cat.includes('gear')) {
    return \`
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
    \`;
  }

  if (cat.includes('weekend') || cat.includes('getaway') || cat.includes('quick')) {
    return \`
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
    \`;
  }

  // Default Destination Guides & Others fallback
  return \`
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
  \`;
}
`;

const patchedContent = content.substring(0, startIndex) + newFunction + content.substring(endIndex);
fs.writeFileSync(filePath, patchedContent, 'utf8');
console.log("Successfully patched index.html!");
