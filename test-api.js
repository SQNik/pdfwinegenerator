// Prosty test API endpoints dla collection fields
const http = require('http');

function testAPI(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 3001,
            path: path,
            method: method,
            headers: {
                'Content-Type': 'application/json',
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const parsedData = JSON.parse(responseData);
                    resolve({
                        status: res.statusCode,
                        data: parsedData
                    });
                } catch (e) {
                    resolve({
                        status: res.statusCode,
                        data: responseData
                    });
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function runTests() {
    console.log('🔍 Testowanie API Collection Fields...\n');
    
    try {
        // Test 1: GET configuration
        console.log('1. GET /api/collection-fields/config');
        const getConfig = await testAPI('GET', '/api/collection-fields/config');
        console.log('Status:', getConfig.status);
        console.log('Response:', JSON.stringify(getConfig.data, null, 2));
        console.log('---\n');
        
        // Test 2: POST nowe pole
        console.log('2. POST /api/collection-fields');
        const newField = {
            id: 'test-field-' + Date.now(),
            name: 'Testowe Pole',
            type: 'text',
            required: false,
            options: []
        };
        const postField = await testAPI('POST', '/api/collection-fields', newField);
        console.log('Status:', postField.status);
        console.log('Response:', JSON.stringify(postField.data, null, 2));
        console.log('---\n');
        
        // Test 3: GET configuration ponownie (powinno pokazać nowe pole)
        console.log('3. GET /api/collection-fields/config (po dodaniu)');
        const getConfigAfter = await testAPI('GET', '/api/collection-fields/config');
        console.log('Status:', getConfigAfter.status);
        console.log('Response:', JSON.stringify(getConfigAfter.data, null, 2));
        console.log('---\n');
        
        console.log('✅ Testy zakończone pomyślnie!');
        
    } catch (error) {
        console.error('❌ Błąd podczas testowania:', error.message);
    }
}

// Uruchom testy
runTests();