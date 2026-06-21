const fs = require('fs');
const path = require('path');

const poolPath = path.join(__dirname, 'renders_pool.json');

if (!fs.existsSync(poolPath)) {
  console.error('Error: renders_pool.json not found!');
  process.exit(1);
}

const pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));

const IMAGE_PROMPTS = {
  18: {
    v1: "An aerial drone photograph of Anantara Medjumbe Island Resort, showcasing the pristine white sand spit extending into the turquoise lagoon, surrounded by luxury beachfront thatched-roof villas and lush green palms under a clear blue sky. Professional photography, Hasselblad H6D-100c, 24mm lens, realistic lighting, photorealistic, ultra-detailed, no text, no watermark, no logo, no illustration.",
    v2: "A realistic photograph of @image1 Male character and @image 2 female character walking hand-in-hand along the sandy shore of a secluded private island in Mozambique, with a luxury thatched villa in the background. Sunset lighting, warm glow, shallow depth of field, realistic skin texture, photorealistic, 50mm portrait lens, no text, no watermark.",
    v3: "A triptych collage of three naturally blended scenes: 1) a wide shot of a private sandy beach with clear blue water, 2) a close-up of a seafood dinner plate with grilled lobster and lime on a candlelit table, 3) a cozy interior of a luxury beach villa with ocean views. High realism, photorealistic, editorial style, no text, no border."
  },
  39: {
    v1: "Wide angle photograph of overwater wooden cottages built along a crescent-shaped beach on a lush private island in Raja Ampat, surrounded by a shallow neon-turquoise coral reef fading into deep indigo ocean. Professional travel photography, 35mm lens, natural daylight, photorealistic, ultra-detailed, no text, no watermark.",
    v2: "A realistic photograph of @image1 Male character and @image 2 female character sitting on the edge of an overwater wooden villa deck, feet dangling over crystal clear turquoise water filled with fish. Natural morning light, crisp details, photorealistic, high realism, no text, no watermark.",
    v3: "A naturally mixed diptych collage: on the left, an aerial shot of emerald karst islands in a blue lagoon; on the right, a detailed macro shot of vibrant coral reefs under shallow clear ocean water. High realism, national geographic style, photorealistic, no text, no border."
  },
  49: {
    v1: "Twilight view of the outdoor terrace of Hotel Cipriani in Venice, showing white linen tables lit by candles along the lagoon, with a vintage wooden taxi boat docked at the pier and the distant lights of St. Mark's campanile glowing across the dark blue water. Leica SL2, 50mm lens, soft dusk light, photorealistic, high realism, no text, no watermark.",
    v2: "A realistic photo of @image1 Male character and @image 2 female character having custom cocktails at the New York Bar of Park Hyatt Tokyo next to floor-to-ceiling glass windows, with the neon Tokyo skyline reflecting in the glass. Night mood, soft ambient lighting, cinematic, photorealistic, no text, no watermark.",
    v3: "A naturally mixed triptych collage of three scenes: 1) the historic mosaic archways at Villa d'Este, 2) a luxurious bedroom interior with soft silk sheets, 3) a detail of a sparkling champagne glass. High realism, editorial luxury style, photorealistic, no text, no border."
  },
  440: {
    v1: "A breathtaking evening scene at Villa d'Este on Lake Como, showcasing a wedding reception dinner set up with long imperial tables decorated with white roses and tall candles under the historic stone mosaic arches lit by warm ambient lighting, overlooking the calm lake. Phase One XF, 35mm lens, realistic luxury, photorealistic, no text, no watermark.",
    v2: "A realistic photo of @image1 Male character and @image 2 female character standing together on a vintage mahogany Riva speedboat on Lake Como, with a historic Italian villa in the background. Golden hour sunset, wind in hair, high realism, photorealistic, no text, no watermark.",
    v3: "A triptych collage of three naturally blended scenes: 1) a glass-bottom wedding aisle over a turquoise Maldivian lagoon, 2) close-up of a white wedding bouquet, 3) long table reception under warm lights. High realism, wedding editorial style, photorealistic, no text, no border."
  },
  465: {
    v1: "A romantic twilight scene at Amangiri in Utah, showing a wedding reception lounge set up with minimalist low wooden tables, large cream pillows, and a roaring fire pit, with the giant illuminated sandstone cliff towering over the glowing resort pool. Hasselblad, ultra-realistic, photorealistic, no text, no watermark.",
    v2: "A realistic photo of @image1 Male character and @image 2 female character walking barefoot along Nihiwatu beach in Indonesia, with wild horses running in the distant surf at low tide. Warm golden hour light, highly detailed textures, photorealistic, no text, no watermark.",
    v3: "A triptych collage of naturally blended images: 1) a French château lit by thousands of candles in the gardens at night, 2) a close-up of a wedding rings on a rustic stone surface, 3) a modernist desert resort pool. High realism, photorealistic, no text, no border."
  },
  76: {
    v1: "An aerial shot of a luxury overwater bungalow resort in Bora Bora, showing the circular wooden docks extending over the brilliant turquoise lagoon, with Mount Otemanu rising dramatically in the background under white trade wind clouds. DJI Mavic 3 Pro, high resolution, realistic, photorealistic, no text, no watermark.",
    v2: "A realistic photo of @image1 Male character and @image 2 female character having a private canoe breakfast delivered to their overwater bungalow deck in Bora Bora, with Mount Otemanu in the background. Bright morning sun, fresh tropical fruits, photorealistic, no text, no watermark.",
    v3: "A naturally mixed collage of three scenes: 1) a couple snorkeling with reef sharks, 2) a close-up of a tropical flower lei on a wooden deck, 3) a sunset over a calm turquoise lagoon. Realistic travel editorial, photorealistic, no text, no border."
  },
  436: {
    v1: "An aerial drone view of a luxury thatched villa at Azura Benguerra Island, showing the private infinity pool blending with the white sand beach and the turquoise waters of the Bazaruto Archipelago. Warm daylight, crisp details, photorealistic, no text, no watermark.",
    v2: "A realistic photo of @image1 Male character and @image 2 female character riding horses on the ridge of a massive white sand dune in Mozambique, looking out over tidal channels. Late afternoon sun, cinematic realism, photorealistic, no text, no watermark.",
    v3: "A collage of naturally blended scenes: 1) a private sandbank picnic setup with champagne, 2) a close-up of a sea turtle swimming in shallow water, 3) the organic architecture of a luxury villa. Ultra-realistic, photorealistic, no text, no border."
  },
  26: {
    v1: "A spectacular beachfront wedding setup at Cheval Blanc in St. Barts, showcasing a simple driftwood arch decorated with orchids and white roses on the sand of Flamands Beach at sunset, with the turquoise sea calm in the background. Canon EOS R5, 24-70mm lens, natural light, photorealistic, no text, no watermark.",
    v2: "A realistic photo of @image1 Male character and @image 2 female character exchanging vows on a private sandbank in the Maldives, surrounded only by shallow turquoise waters. Soft beach sunset, high detail realism, photorealistic, no text, no watermark.",
    v3: "A triptych collage of three naturally blended scenes: 1) a wooden boardwalk leading to an overwater wedding pavilion, 2) a close-up of two champagne flutes, 3) a pristine white sand beach. High realism, photorealistic, no text, no border."
  },
  42: {
    v1: "A stunning wide shot of the pristine white sand spit of One Foot Island in Aitutaki, surrounded by a shallow, glowing neon-turquoise lagoon under a warm South Pacific sky. Sony a7R V, 16-35mm lens, vibrant natural lighting, photorealistic, no text, no watermark.",
    v2: "A realistic photo of @image1 Male character and @image 2 female character snorkeling in the crystal clear emerald water of Sancho Bay in Fernando de Noronha, Brazil, with sea turtles swimming nearby. Underwater realistic shot, sunbeams in water, photorealistic, no text, no watermark.",
    v3: "A collage of naturally blended scenes: 1) a hammock suspended in shallow water, 2) a close-up of a fresh coconut with a straw, 3) a volcanic rock formation on a wild beach. Realistic travel editorial, photorealistic, no text, no border."
  },
  82: {
    v1: "A beautiful twilight view of a hillside pool suite at Hermitage Bay in Antigua, showing the private plunge pool reflecting the orange sunset sky, with a double daybed set up on the wooden wrap-around deck overlooking the calm ocean bay. Fujifilm GFX 100S, warm dusk light, photorealistic, no text, no watermark.",
    v2: "A realistic photo of @image1 Male character and @image 2 female character enjoying a private forest picnic at Twin Farms in Vermont, surrounded by colorful autumn foliage. Warm golden hour light, detailed textures, photorealistic, no text, no watermark.",
    v3: "A collage of three naturally blended scenes: 1) a private yacht cruising a Caribbean bay, 2) close-up of a cheese board and wine glass, 3) a luxurious rustic cabin fireplace. High realism, photorealistic, no text, no border."
  }
};

const updatedPool = pool.map(item => {
  const prompts = IMAGE_PROMPTS[item.row];
  if (prompts) {
    return {
      ...item,
      imagePromptV1: prompts.v1,
      imagePromptV2: prompts.v2,
      imagePromptV3: prompts.v3
    };
  }
  return item;
});

fs.writeFileSync(poolPath, JSON.stringify(updatedPool, null, 2), 'utf8');
console.log('Successfully updated renders_pool.json with image prompts!');
