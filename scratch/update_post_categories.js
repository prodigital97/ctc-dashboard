require('dotenv').config();
const fs = require('fs');
const path = require('path');
const styleHelper = require('../style_helper');

const poolPath = path.join(__dirname, '..', 'renders_pool.json');
const pool = JSON.parse(fs.readFileSync(poolPath, 'utf8'));

const wpUrl = process.env.WP_URL.replace(/\/$/, '');
const authHeader = `Basic ${Buffer.from(`${process.env.WP_USERNAME}:${process.env.WP_APPLICATION_PASSWORD}`).toString('base64')}`;

const XLSX = require('xlsx');
const excelPath = path.join(__dirname, '..', 'Trending Blog Topics.xlsx');
const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets['Trends History'];
const excelData = XLSX.utils.sheet_to_json(sheet);

const topicToCategoriesMap = {};
excelData.forEach(row => {
    const topicKey = (row['Topic'] || row['Detected Topic'] || '').trim().toLowerCase();
    const rowKey = row['#'];
    const tagsStr = row['Category Tags'] || row['Category'] || '';
    const tags = tagsStr.split(',').map(t => t.trim()).filter(Boolean);
    
    if (topicKey) topicToCategoriesMap[topicKey] = tags;
    if (rowKey !== undefined) topicToCategoriesMap[`row-${rowKey}`] = tags;
});

async function runUpdate() {
    console.log('Fetching WP categories...');
    const catRes = await fetch(`${wpUrl}/wp-json/wp/v2/categories?per_page=100`, {
        headers: { 'Authorization': authHeader }
    });
    const wpCategories = await catRes.json();
    
    console.log('Fetching all scheduled posts...');
    const postsRes = await fetch(`${wpUrl}/wp-json/wp/v2/posts?status=future&per_page=100`, {
        headers: { 'Authorization': authHeader }
    });
    const posts = await postsRes.json();
    console.log(`Found ${posts.length} scheduled posts.`);
    
    for (const post of posts) {
        // use rendered instead of raw
        const postTitle = post.title.rendered || post.title.raw || '';
        const titleLower = postTitle.replace(/&#8211;/g, '-').replace(/&#8217;/g, "'").replace(/&amp;/g, '&').trim().toLowerCase();
        
        // Find matching item in pool by trying to match title
        let poolItem = pool.find(p => p.title.toLowerCase().trim() === titleLower);
        if (!poolItem) {
            // Also try to match by topic if title matching fails
            poolItem = pool.find(p => p.topic.toLowerCase().trim() === titleLower);
        }
        
        if (!poolItem) {
            console.log(`Could not find pool item for post: ${postTitle}`);
            continue;
        }
        
        let tags = [];
        const topicKey = (poolItem.topic || '').trim().toLowerCase();
        if (topicToCategoriesMap[topicKey]) {
            tags = topicToCategoriesMap[topicKey];
        } else if (topicToCategoriesMap[`row-${poolItem.row}`]) {
            tags = topicToCategoriesMap[`row-${poolItem.row}`];
        }
        
        if (tags.length === 0) tags = ['Destination Guides'];
        
        let categoryIds = [];
        tags.forEach(tag => {
            const slug = tag.toLowerCase()
                .replace(/&/g, ' ')
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/-+/g, '-')
                .replace(/^-|-$/g, '');
            const matched = wpCategories.find(c => c.slug === slug || c.name.toLowerCase() === tag.toLowerCase());
            if (matched) {
                categoryIds.push(matched.id);
            }
        });
        
        // Generate clean HTML
        const cleanHtml = styleHelper.convertHtmlToCleanTemplate(poolItem);
        
        console.log(`Updating post: ${postTitle} with ${categoryIds.length} categories.`);
        
        const updateRes = await fetch(`${wpUrl}/wp-json/wp/v2/posts/${post.id}`, {
            method: 'POST',
            headers: {
                'Authorization': authHeader,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                categories: categoryIds.length > 0 ? categoryIds : undefined,
                content: cleanHtml
            })
        });
        
        if (updateRes.ok) {
            console.log(`-> Successfully updated: ${post.id}`);
        } else {
            console.error(`-> Failed to update ${post.id}:`, await updateRes.text());
        }
    }
    console.log('Done updating posts.');
}

runUpdate();
