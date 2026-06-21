require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const apiKey = process.env.GEMINI_API_KEY;
const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

if (!apiKey) {
  console.error('Error: Gemini API Key is missing in .env!');
  process.exit(1);
}

async function testGeminiSearch() {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  const payload = {
    contents: [
      {
        parts: [
          {
            text: "What is the current standard ticket price for the Eiffel Tower in 2026? Please verify with Google Search."
          }
        ]
      }
    ],
    tools: [
      {
        google_search: {}
      }
    ]
  };

  console.log(`Calling Gemini API (${model}) with Google Search tool enabled...`);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`HTTP Error ${response.status}: ${errText}`);
    }

    const data = await response.json();
    console.log('API Response received successfully!');
    
    const candidate = data.candidates?.[0];
    const text = candidate?.content?.parts?.[0]?.text;
    console.log('\n--- Model Response ---');
    console.log(text);
    console.log('----------------------');
    
    if (candidate?.groundingMetadata) {
      console.log('\nGrounding Metadata found:');
      console.log(JSON.stringify(candidate.groundingMetadata, null, 2));
    } else {
      console.log('\nNo grounding metadata found in response.');
    }
  } catch (error) {
    console.error('Gemini API call failed:', error.message);
  }
}

testGeminiSearch();
