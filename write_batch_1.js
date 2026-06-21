const fs = require('fs');
const path = require('path');

const poolPath = path.join(__dirname, 'renders_pool.json');

const batch1 = [
  {
    "row": 231,
    "topic": "Drone Travel Photography",
    "title": "Drone Travel Photography: The Ultimate Guide to Capturing Secluded Luxury",
    "metaTitle": "Drone Travel Photography: A Guide for Luxury Couples",
    "metaDescription": "Elevate your travel memories. Learn the best drone photography spots, technical flight tips, and luxury storytelling angles for couples.",
    "excerpt": "A bird's-eye view of paradise. Master drone photography techniques to capture empty private beaches, overwater villas, and dramatic island geometry.",
    "keywords": [
      "drone travel photography",
      "drone photography spots",
      "luxury travel couples photography",
      "aerial island photography",
      "travel drone tips",
      "creative couple photography"
    ],
    "bodyHtml": "<h2>A New Perspective: The Art of Aerial Storytelling</h2><p>For the modern luxury traveler, the traditional camera angle is no longer enough to capture the sheer scale of the world's most beautiful destinations. Some landscapes—like the circular coral reefs of Bora Bora, the shifting sand channels of Mozambique, or the Renaissance gardens of Lake Como—can only be fully appreciated from the air. Drone photography has evolved from a niche hobby into an essential tool for luxury travel storytelling, allowing couples to capture their journeys in a cinematic, grand format that feels straight out of an editorial spread.</p><p>But capturing a truly premium drone photograph is about more than just flying high and pressing the shutter button. It requires an understanding of visual geometry, light angles, local flight regulations, and how to compose a scene where you and your partner fit naturally into the vast landscape below. Here is our couple's guide to mastering drone travel photography.</p><h2>Strategic Context: Light, Angles & Composition</h2><h3>The Golden Hour Rule</h3><p>Just like ground photography, the best time to fly your drone is during the <strong>golden hour</strong> (the hour after sunrise and the hour before sunset). At this time, the low sun creates long, dramatic shadows that add depth and texture to architectural structures, palm trees, and sand dunes. The light is warm and soft, preventing harsh reflections off the water. Midday sun, while tempting for highlighting clear turquoise water, creates flat, uninspiring shadows and intense glare.</p><h3>Geometric Composition</h3><p>When flying, look for natural leading lines and geometric symmetry. Frame your shots using coastlines, wooden overwater boardwalks, winding mountain roads, or rows of loungers on a beach. A top-down '90-degree look' directly over a subject (like a couple floating in a pool or walking on a sandspit) creates a striking graphic image with clean lines.</p><h2>Handpicked Aerial Photography Spots</h2><ul><li><strong>The Southern Sandspit at Low Tide (Mozambique)</strong>: At low tide, a long, curving spit of pure white sand emerges from the ocean. Walk out to the very tip and use a drone or a wide-angle lens to capture the contrasting deep blue of the channel against the white sand and turquoise shallows. <em>Optimal time: Mid-afternoon during spring low tides.</em></li><li><strong>Love Lagoon (Telaga Bintang, Indonesia)</strong>: Near Pianemo, Telaga Bintang is a star-shaped lagoon framed by steep karst cliffs. Climbing to the rocky peak offers a romantic view of this unique geological formation.</li><li><strong>The Overwater Swing (Maldives)</strong>: Capture a candid photo of your partner on the wooden swing suspended over the shallow lagoon, with the crystal-clear water reflecting the bright blue sky.</li></ul><h2>Practicalities & Safe Flying Guidelines</h2><ul><li><strong>Local Regulations & Permits</strong>: Always research the drone laws of your destination country before packing. Many luxury reserves (like the Bazaruto Archipelago or private Maldivian islands) require prior permission from resort management to fly, ensuring guest privacy. Some countries ban drones entirely without military permits.</li><li><strong>Battery Safety in Air Travel</strong>: Drone batteries (LiPo) must always be packed in your carry-on luggage, never in checked bags. Store them in fireproof battery safety bags to comply with international aviation security guidelines.</li><li><strong>Wind & Signal Hazards</strong>: Ocean trade winds can be incredibly strong, particularly around cliffs and over open water. Always check wind speeds using apps like 'UAV Forecast' before launching, and ensure you have a clear line-of-sight to prevent signal loss.</li></ul>",
    "instagram": [
      "Taking our romance to new heights. 🚁✨ A bird's-eye view of our private island oasis. There's nothing quite like seeing the world's blue channels from above. Read our full guide to drone travel photography in bio! 🗺️📸 #DronePhotography #TravelCouples #AerialPhotos #LuxuryResorts #TravelTogether #ClassyTravelCouples",
      "Golden hour shadows and turquoise lagoons. 🌅 Capturing the geometry of paradise from 100 feet in the air. Add these aerial photography spots to your travel bucket list. 🌴💫 #DJIMavic #AerialLandscapes #LuxuryTravelCouples #BeautifulDestinations",
      "Floating in the middle of a private ocean playground. A top-down shot of absolute peace. 💦 Pack your drone and start capturing your love story from the sky. 🗺️✨ #DroneTravel #PrivateIsland #MaldivesFromAbove #TravelBloggers"
    ],
    "pinterest": "The ultimate couples guide to drone travel photography. Discover the best aerial photography spots, camera settings, geometry composition tips, and safety flight guidelines for capturing luxury travel from above. #DronePhotography #AerialViews #TravelCouples #PhotographyTips #HoneymoonInspiration",
    "imageDescription": "A spectacular top-down aerial drone photograph of a luxury wooden boardwalk winding through a neon-turquoise tropical lagoon, with a couple walking hand-in-hand and casting long shadows on the water under clear daylight.",
    "imagePromptV1": "A top-down aerial drone photograph of a luxury wooden boardwalk winding through a neon-turquoise tropical lagoon, with clear shallow water showing coral reefs below, under warm natural sunlight. Professional photography, Hasselblad H6D-100c, high detail, no text, no watermark, no border.",
    "imagePromptV2": "A top-down aerial drone photograph of @image1 Male character and @image 2 female character walking hand-in-hand along a luxury wooden boardwalk winding through a neon-turquoise tropical lagoon. Natural golden hour lighting, long dramatic shadows cast on the water, high realism, photorealistic, no text.",
    "imagePromptV3": "A diptych collage of two naturally blended aerial scenes: on the left, a wide-angle drone shot of a curving white sand spit in a blue ocean; on the right, a top-down shot of a private infinity pool blending with the beach. High realism, editorial layout, photorealistic, no text, no borders.",
    "renderedAt": "26/5/2026, 6:00:00 am"
  },
  {
    "row": 234,
    "topic": "A Local Foodie's Guide to Cape Town's Culinary Delights",
    "title": "A Local Foodie's Guide to Cape Town's Culinary Delights: Sea-to-Table Luxury",
    "metaTitle": "Cape Town's Culinary Guide: A Local Foodie's Luxury Review",
    "metaDescription": "Uncover Cape Town's most romantic and luxurious dining spots. From fine dining at FYN to beachfront seafood, read our local foodie guide.",
    "excerpt": "Framed by Table Mountain and two oceans, Cape Town is a global gastronomy capital. Discover the city's most exquisite romantic restaurants and local flavors.",
    "keywords": [
      "Cape Town culinary guide",
      "luxury dining Cape Town",
      "FYN Restaurant Cape Town",
      "seafood restaurants Camps Bay",
      "romantic Cape Town dining",
      "South Africa food travel"
    ],
    "bodyHtml": "<h2>The Convergence of Continents: Cape Town's Gastronomy Scene</h2><p>Perched at the southern tip of the African continent, Cape Town is a sensory playground where dramatic ocean cliffs meet lush vineyards, all under the watchful gaze of Table Mountain. This unique geography has fostered a world-class culinary scene that is as diverse as the city itself. Here, local Cape Malay spices, fresh Atlantic and Indian Ocean catches, and premium wines from the nearby Constantia valley converge in the hands of visionary chefs.</p><p>For travel couples who plan their journeys around their palates, Cape Town offers an extraordinary range of dining experiences. Whether you are seeking a highly sophisticated, multi-course fine dining tasting menu or a relaxed, feet-in-the-sand seafood feast overlooking the Atlantic surf, the Mother City delivers romance and flavor in equal measure.</p><h2>Accommodations: Where Luxury Meets Gastronomy</h2><ul><li><strong>The Splurge: One&Only Cape Town</strong><br>A stunning luxury resort located in the heart of the V&A Waterfront, featuring private canal islands. It is home to Nobu Cape Town, the only Nobu on the African continent, serving world-class Japanese-Peruvian fusion with local South African seafood twists. Best room: Marina Grand Suite. Price range: $900 - $1,500 per night.</li><li><strong>The Romantic Sweet Spot: Tintswalo Atlantic</strong><br>A boutique lodge nestled at the base of Chapman's Peak, right on the water's edge. The lodge’s restaurant offers a daily changing sea-to-table menu, allowing couples to dine on the outdoor deck as the Atlantic waves crash against the rocks below. Best room: Luxury Island Suite. Price range: $600 - $900 per night.</li></ul><h2>Gastronomy: Cape Town's Premium Dining Gems</h2><h3>The Unmissable Splurge: FYN Restaurant</h3><p>FYN is an urban culinary sanctuary that blends South African ingredients with Japanese techniques. Sitting on the top floor of a historic building, the dining room features a striking hanging wooden ceiling installation designed by architect Jane Vlok. The multi-course kaiseki-style menu highlights local abalone, Cape botanicals, and Karoo wild game. Paired with rare local vintage wines, it is a theatrical, romantic dining experience.</p><h3>The Splurge: The Test Kitchen Carbon</h3><p>Located in the trendy Old Biscuit Mill in Salt River, this exclusive venue by Chef Luke Dale Roberts is a dramatic theater of flavor. The menu focuses on intense, wood-fired flavors and intricate plating, accompanied by a curated wine pairing that showcases the best of South Africa's boutique vineyards.</p><h3>Local Food: Codfather Seafood & Sushi</h3><p>A legendary institution in the beachfront suburb of Camps Bay. The restaurant has no written menu; instead, a local host guides you to a massive ice counter piled high with Cape rock lobster, butterfish, kingklip, and yellowtail. You select your exact catches, which are then grilled to perfection and served alongside fresh sushi. The atmosphere is bustling, authentic, and perfect for a relaxed date night.</p><h2>Handpicked Couple Culinary Experiences</h2><ul><li><strong>Constantia Valley Private Wine Safari (6 Hours)</strong><br>Take a private chauffeur-driven tour of the historic Constantia wine valley, the oldest wine-producing region in the southern hemisphere. You will enjoy a private tasting of award-winning Sauvignon Blancs and sweet Vin de Constance at Klein Constantia and Buitenverwachting, concluding with a gourmet three-course lunch in the vineyards. <em>Cost: Approx. $250 USD per couple.</em></li><li><strong>Champagne Sunset Cruise from the Waterfront (2 Hours)</strong><br>Board a luxury catamaran from the V&A Waterfront and sail into Table Bay at dusk. Enjoy local Cape oysters and chilled Cap Classique sparkling wine as the sun drops behind the horizon, bathing Table Mountain in a soft pink glow. <em>Cost: Approx. $120 USD per couple.</em></li></ul>",
    "instagram": [
      "Sea-to-table luxury in Cape Town. 🌊🦞 Dining at the base of Chapman's Peak at Tintswalo Atlantic, with the ocean crashing below. Tap the link in bio for our ultimate foodie guide to the Mother City! 🇿🇦✨ #CapeTownFoodie #TintswaloAtlantic #LuxuryDining #CapeTownTravel #ClassyTravelCouples",
      "Fusing South African terroir with Japanese kaiseki. FYN Restaurant is a culinary masterpiece 10 stories above the city center. Add this romantic dining spot to your Cape Town itinerary. 🍷🍽️ #FYNRestaurant #SouthAfricaTravel #FineDiningCouples #GastronomyCapital",
      "A date night in Camps Bay with no written menu. 🍣 Codfather Seafood is a Cape Town legend where you select your fresh catches straight from the counter. Cold Cap Classique and fresh sushi under the palms. 🥂🌴 #CampsBay #CapeTownSushi #DateNightOut #TravelTogether"
    ],
    "pinterest": "The ultimate local foodie guide to Cape Town's culinary scene. Discover luxury fine dining at FYN, beachfront seafood in Camps Bay, Constantia private wine tastings, and romantic sunset cruises. #CapeTown #SouthAfrica #FoodTravel #FineDining #WineTasting #TravelCouples",
    "imageDescription": "A romantic candlelit dinner table set up on the outdoor wooden deck of Tintswalo Atlantic, with fresh oysters and sparkling wine glasses, overlooking the dramatic waves of Hout Bay crashing against dark rocks at sunset.",
    "imagePromptV1": "A beautiful twilight view of a luxury dinner table set with fresh oysters and two glasses of sparkling wine on a wooden deck right next to the ocean, with Chapman's Peak cliffs in the background under a colorful sunset sky. Professional photography, Leica SL2, high realism, no text, no watermark.",
    "imagePromptV2": "A realistic photo of @image1 Male character and @image 2 female character clinking glasses of white wine at a luxury outdoor restaurant table in Cape Town, with Table Mountain lit by the golden hour sun in the background. Highly detailed skin textures, warm sunset lighting, no text.",
    "imagePromptV3": "A triptych collage of three naturally blended scenes: 1) a gourmet plating of seared tuna with Cape botanicals, 2) an aerial view of green vineyards in the Constantia valley, 3) a cozy interior of a fine dining restaurant with a hanging wooden art piece. High realism, editorial food photography, no text.",
    "renderedAt": "26/5/2026, 6:05:00 am"
  },
  {
    "row": 236,
    "topic": "Luxury Wine Experiences in Bordeaux, France",
    "title": "Luxury Wine Experiences in Bordeaux: The Ultimate Couple's Vineyard Guide",
    "metaTitle": "Bordeaux Wine Experiences: A Luxury Couple's Guide",
    "metaDescription": "Discover the most exclusive and romantic wine tours in Bordeaux, France. Explore Grand Cru Classé estates, luxury spa riads, and Michelin dining.",
    "excerpt": "Grand Cru Classé châteaux, private barrel tastings, and world-class spa riads. Unveil the absolute peak of luxury wine tourism in Bordeaux for couples.",
    "keywords": [
      "Bordeaux luxury wine tours",
      "Saint-Emilion chateaux",
      "Les Sources de Caudalie",
      "Grand Cru Classe tasting",
      "Bordeaux Michelin restaurants",
      "romantic France honeymoon"
    ],
    "bodyHtml": "<h2>The Terroir of Romance: Bordeaux's Vineyard Estates</h2><p>Bordeaux is a legendary name that evokes images of grand stone gates, centuries-old towers, and some of the most sought-after bottles of wine in the world. Tucked along the Garonne and Dordogne rivers in southwestern France, this historic wine capital is a perfect sanctuary for travel couples. Bordeaux is a place where slow living is elevated to an art form, where mornings are spent strolling through medieval stone villages and afternoons are dedicated to private barrel tastings inside historic cellars.</p><p>For couples who value heritage and gastronomy, a journey through Bordeaux is an immersive sensory experience. By combining private estate visits on the Left and Right banks with world-class vineyard spas and Michelin-starred dining, you will discover the absolute peak of French luxury wine tourism.</p><h2>Accommodations: Vineyard Spas & Historic Châteaux</h2><ul><li><strong>The Splurge: Les Sources de Caudalie</strong><br>A stunning luxury hotel set inside the vineyards of Château Smith Haut Lafitte. Famous for its Vinothérapie Spa, which utilizes hot spring water combined with grape extracts for unique couple treatments. Best room: L'Île aux Oiseaux (Birds' Island) Suite, built on stilts over a calm lake. Price range: $700 - $1,200 USD per night.</li><li><strong>The Romantic Sweet Spot: Château Grand Barrail</strong><br>A fairytale 19th-century château hotel located just outside the medieval town of Saint-Émilion. Surrounded by a lush park and rolling vineyards, the hotel features ornate stained-glass windows and a luxurious wellness center. Best room: Château Suite. Price range: $400 - $700 USD per night.</li></ul><h2>Gastronomy: Michelin Stars & Vineyard Grills</h2><h3>The Unmissable Splurge: Le Pressoir d'Argent Gordon Ramsay</h3><p>Located inside the InterContinental Bordeaux Le Grand Hôtel, this double-Michelin-starred restaurant is a masterpiece of fine dining. The restaurant is named after its rare solid silver Christofle lobster press (one of only a few in the world). The menu celebrates Aquitaine terroir, featuring blue lobster and local lamb, paired with a massive collection of Grand Cru Classé Bordeaux wines.</p><h3>The Splurge: La Table du Lavoir at Caudalie</h3><p>A beautiful rustic-chic dining pavilion built with 19th-century timber. Sit next to the grand stone fireplace and enjoy seasonal market-fresh dishes, such as wood-fired duck breast and farm cheeses, paired with wines produced on-site at Château Smith Haut Lafitte.</p><h2>Handpicked Couple Vineyard Experiences</h2><ul><li><strong>Private Helicopter Château Tour (3 Hours)</strong><br>Fly above the winding Garonne river and capture the dramatic layout of the Médoc and Saint-Émilion châteaux from the air. The tour concludes with a private landing at a Grand Cru Classé estate for a guided barrel tasting and lunch. <em>Cost: Approx. $900 USD per couple.</em></li><li><strong>Saint-Émilion Historic Village Walk & Tasting (4 Hours)</strong><br>Explore the UNESCO-listed medieval village of Saint-Émilion with a private guide. Navigate the steep cobblestone streets, climb the monolithic church tower, and enjoy a private cellar tasting of Merlot-dominant blends. <em>Cost: Approx. $200 USD per couple.</em></li></ul>",
    "instagram": [
      "Waking up in the vineyards of Bordeaux. 🍇🍷 Staying in the stilts suite at Les Sources de Caudalie, surrounded by old-growth vines and morning mist. Read our ultimate luxury couple's guide to Bordeaux in the bio! 🇫🇷✨ #BordeauxWine #SourcesdeCaudalie #LuxuryTravelFrance #VineyardSpa #ClassyTravelCouples",
      "A fairytale château escape in Saint-Émilion. Château Grand Barrail is the definition of classic French romance, nestled among rolling hills. Add this to your wine tasting bucket list. 🏰🥂 #SaintEmilion #ChateauGrandBarrail #FrenchHoneymoon #WineLovers",
      "Dine by the vintage lobster press. 🦞 Gordon Ramsay's Le Pressoir d'Argent in Bordeaux is a double-Michelin-starred sanctuary of fine dining. Paired with Grand Cru Classé, of course. 🍷✨ #BordeauxGastronomy #LeGrandHotel #MichelinStars #TravelTogether"
    ],
    "pinterest": "The ultimate romantic guide to luxury wine experiences in Bordeaux, France. Explore vineyard spas at Les Sources de Caudalie, fairytale châteaux, private Saint-Émilion tours, and Michelin-starred dining. #Bordeaux #France #WineTourism #Chateau #HoneymoonGuide #TravelCouples",
    "imageDescription": "A peaceful morning view of the L'Île aux Oiseaux suite at Les Sources de Caudalie, showing the luxury wooden cabin built on stilts over a reflective lake, surrounded by green vines and weeping willows under soft morning light.",
    "imagePromptV1": "A beautiful morning photograph of a luxury wooden suite built on stilts over a calm, reflective lake, surrounded by green weeping willows and rows of grapes in a Bordeaux vineyard under a soft, misty morning sky. Professional photography, Phase One XF, realistic, no text, no watermark.",
    "imagePromptV2": "A realistic photo of @image1 Male character and @image 2 female character walking hand-in-hand through rows of grapevines at a historic French estate in Bordeaux. Warm late-afternoon sun filtering through the leaves, highly detailed skin textures, no text.",
    "imagePromptV3": "A triptych collage of three naturally blended scenes: 1) a close-up of dark red wine being poured into a crystal glass, 2) the grand facade of a historic stone château in France, 3) a cozy cellar interior with rows of oak wine barrels. High realism, editorial luxury style, photorealistic, no text, no border.",
    "renderedAt": "26/5/2026, 6:10:00 am"
  }
];

let pool = [];
if (fs.existsSync(poolPath)) {
  try {
    pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));
  } catch (e) {
    console.warn('Could not parse renders_pool.json, resetting.');
  }
}

batch1.forEach(newBlog => {
  const index = pool.findIndex(item => item.row === newBlog.row);
  if (index !== -1) {
    pool[index] = newBlog;
    console.log(`Updated Row ${newBlog.row}: "${newBlog.topic}"`);
  } else {
    pool.push(newBlog);
    console.log(`Added Row ${newBlog.row}: "${newBlog.topic}"`);
  }
});

fs.writeFileSync(poolPath, JSON.stringify(pool, null, 2), 'utf8');
console.log('Saved Batch 1 to renders_pool.json!');
