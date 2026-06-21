require('dotenv').config();
const fs = require('fs');
const path = require('path');

const categories = [
  "Scenic Road Trips",
  "Romantic Getaways",
  "Destination Guides",
  "Photography Spots",
  "Beach & Islands",
  "Tips & Packing",
  "Weekend Getaways",
  "Food & Culinary",
  "Luxury & Boutique",
  "City Breaks",
  "Boutique Hotels",
  "Budget Travel & Hacks",
  "Honeymoon Guides",
  "Photography",
  "Honeymoon",
  "Luxury Travel"
];

async function createCategories() {
    const wpUrl = process.env.WP_URL;
    const wpUsername = process.env.WP_USERNAME;
    const wpPassword = process.env.WP_APPLICATION_PASSWORD;
    const auth = Buffer.from(`${wpUsername}:${wpPassword}`).toString('base64');
    const authHeader = `Basic ${auth}`;
    
    console.log('Fetching existing categories...');
    const existingRes = await fetch(`${wpUrl}/wp-json/wp/v2/categories?per_page=100`, {
        headers: { 'Authorization': authHeader }
    });
    
    if (!existingRes.ok) {
        console.error('Failed to fetch categories:', await existingRes.text());
        return;
    }
    
    const existingCats = await existingRes.json();
    const existingNames = existingCats.map(c => c.name.toLowerCase());
    
    for (const cat of categories) {
        if (existingNames.includes(cat.toLowerCase())) {
            console.log(`Category already exists: ${cat}`);
            continue;
        }
        
        console.log(`Creating category: ${cat}`);
        const res = await fetch(`${wpUrl}/wp-json/wp/v2/categories`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: cat })
        });
        
        if (res.ok) {
            console.log(`-> Successfully created: ${cat}`);
        } else {
            console.error(`-> Failed to create ${cat}:`, await res.text());
        }
    }
    console.log('Done creating categories.');
}

createCategories();
