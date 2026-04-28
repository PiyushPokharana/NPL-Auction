const http = require('http');

function makeRequest(method, path, body = null) {
    return new Promise((resolve) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: path,
            method: method,
            headers: { 'Content-Type': 'application/json' }
        };

        const req = http.request(options, (res) => {
            let data = '';
            res.on('data', d => data += d);
            res.on('end', () => {
                console.log(`[${method}] ${path}: ${res.statusCode}`);
                if (data) {
                    try {
                        console.log(`Response: ${JSON.stringify(JSON.parse(data), null, 2).substring(0, 300)}`);
                    } catch (e) {
                        console.log(`Response: ${data.substring(0, 200)}`);
                    }
                }
                console.log('---');
                resolve();
            });
        });

        req.on('error', (e) => {
            console.log(`Error: ${e.message}`);
            resolve();
        });

        if (body) req.write(JSON.stringify(body));
        req.end();
    });
}

(async () => {
    console.log('Testing Phase 3 APIs...\n');

    console.log('=== PLAYER ENDPOINTS ===');
    await makeRequest('GET', '/api/players');
    await makeRequest('GET', '/api/players/available');

    console.log('=== TEAM ENDPOINTS ===');
    await makeRequest('GET', '/api/teams');

    console.log('=== AUCTION ENDPOINTS (will fail without DB) ===');
    await makeRequest('POST', '/api/auction/start', { playerId: '507f1f77bcf86cd799439011' });

    console.log('\nAll tests completed.');
    process.exit(0);
})();
