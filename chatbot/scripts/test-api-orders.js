const https = require('http');

// Configuration
const BASE_URL = 'http://localhost:3000';
const ROUTES = [
    {
        name: 'Odm_vidwa',
        path: '/api/v1/vidwa/orders',
        key: process.env.API_KEY_VIDWA || 'odm_vidwa_secret_key_2026'
    },
    {
        name: 'SVC',
        path: '/api/v1/svc/orders',
        key: process.env.API_KEY_SVC || 'svc_secret_key_456'
    }
];

function testApi(route, params = '') {
    const url = `${BASE_URL}${route.path}${params}`;
    const options = {
        headers: {
            'x-api-key': route.key,
        },
    };

    console.log(`\nTesting ${route.name} Route: GET ${url}...`);

    const req = https.get(url, options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            console.log(`[${route.name}] Status Code: ${res.statusCode}`);
            try {
                const json = JSON.parse(data);
                if (json.orders) {
                    console.log(`[${route.name}] Success! Found ${json.count} orders.`);
                } else {
                    console.log(`[${route.name}] Response:`, JSON.stringify(json, null, 2));
                }
            } catch (e) {
                console.log(`[${route.name}] Error parsing JSON:`, data);
            }
        });
    });

    req.on('error', (e) => {
        console.error(`[${route.name}] Request Error: ${e.message}`);
    });
}

console.log("Ensure 'npm run dev' is running!");

// Run tests
ROUTES.forEach((route, index) => {
    setTimeout(() => {
        testApi(route);
    }, index * 2000); // Stagger tests
});
