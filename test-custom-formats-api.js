const http = require('http');

function testAPIEndpoint() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/custom-formats',
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: jsonData
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: data
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.end();
    });
}

async function testCreateCustomFormat() {
    return new Promise((resolve, reject) => {
        const newFormat = {
            name: "Test Format",
            description: "Format do testów",
            width: 150,
            height: 200,
            unit: "mm",
            orientation: "portrait",
            margins: {
                top: 10,
                right: 10,
                bottom: 10,
                left: 10
            }
        };

        const postData = JSON.stringify(newFormat);

        const options = {
            hostname: 'localhost',
            port: 3001,
            path: '/api/custom-formats',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData)
            }
        };

        const req = http.request(options, (res) => {
            let data = '';

            res.on('data', (chunk) => {
                data += chunk;
            });

            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(data);
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: jsonData
                    });
                } catch (error) {
                    resolve({
                        statusCode: res.statusCode,
                        headers: res.headers,
                        data: data
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(postData);
        req.end();
    });
}

async function runTests() {
    console.log('🚀 Starting Custom PDF Formats API Tests');
    console.log('='.repeat(50));

    try {
        // Test 1: GET all custom formats
        console.log('📋 Test 1: GET /api/custom-formats');
        const getResult = await testAPIEndpoint();
        console.log(`✅ Status: ${getResult.statusCode}`);
        console.log(`📄 Response:`, JSON.stringify(getResult.data, null, 2));
        console.log('');

        // Test 2: POST new custom format
        console.log('📋 Test 2: POST /api/custom-formats');
        const postResult = await testCreateCustomFormat();
        console.log(`✅ Status: ${postResult.statusCode}`);
        console.log(`📄 Response:`, JSON.stringify(postResult.data, null, 2));
        console.log('');

        // Test 3: GET all custom formats again (should show new format)
        console.log('📋 Test 3: GET /api/custom-formats (after POST)');
        const getResult2 = await testAPIEndpoint();
        console.log(`✅ Status: ${getResult2.statusCode}`);
        console.log(`📄 Response:`, JSON.stringify(getResult2.data, null, 2));
        console.log('');

        console.log('🎉 All tests completed!');

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Delay to ensure server is running
setTimeout(runTests, 1000);