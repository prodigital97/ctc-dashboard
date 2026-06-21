require('dotenv').config();

async function testWPConnection() {
    try {
        console.log('Testing WP connection...');
        console.log(`URL: ${process.env.WP_URL}`);
        console.log(`User: ${process.env.WP_USERNAME}`);
        
        const auth = Buffer.from(`${process.env.WP_USERNAME}:${process.env.WP_APPLICATION_PASSWORD}`).toString('base64');
        
        const response = await fetch(`${process.env.WP_URL}/wp-json/wp/v2/users/me`, {
            headers: {
                'Authorization': `Basic ${auth}`
            }
        });
        
        const data = await response.json();
        
        if (!response.ok) {
            console.error(`Status: ${response.status}`);
            console.error('Data:', data);
            return;
        }
        
        console.log('Connection successful!');
        console.log(`Authenticated as: ${data.name} (${data.slug})`);
        console.log('Capabilities:', Object.keys(data.capabilities || {}).filter(k => data.capabilities[k]));
    } catch (error) {
        console.error('Connection failed.');
        console.error('Error:', error.message);
    }
}

testWPConnection();
