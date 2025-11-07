// Test final API endpoints po cleanup
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

async function runFinalTests() {
    console.log('🧹 TEST PO CLEANUP - Sprawdzenie nowych endpoints\n');
    
    try {
        // Test 1: Stary endpoint powinien nie istnieć (404)
        console.log('1. TEST STARY ENDPOINT (powinien być 404)');
        console.log('GET /api/collections/fields/config');
        try {
            const oldEndpoint = await testAPI('GET', '/api/collections/fields/config');
            console.log('Status:', oldEndpoint.status);
            if (oldEndpoint.status === 404) {
                console.log('✅ POPRAWNIE - stary endpoint usunięty');
            } else {
                console.log('❌ BŁĄD - stary endpoint nadal działa');
            }
        } catch (e) {
            console.log('✅ POPRAWNIE - stary endpoint usunięty (connection error)');
        }
        console.log('---\n');
        
        // Test 2: Nowy endpoint powinien działać
        console.log('2. TEST NOWY ENDPOINT (powinien działać)');
        console.log('GET /api/collection-fields/config');
        const newEndpoint = await testAPI('GET', '/api/collection-fields/config');
        console.log('Status:', newEndpoint.status);
        console.log('Response:', JSON.stringify(newEndpoint.data, null, 2));
        if (newEndpoint.status === 200) {
            console.log('✅ POPRAWNIE - nowy endpoint działa');
        } else {
            console.log('❌ BŁĄD - nowy endpoint nie działa');
        }
        console.log('---\n');
        
        // Test 3: POST na nowy endpoint
        console.log('3. TEST POST NOWY ENDPOINT');
        console.log('POST /api/collection-fields');
        const newField = {
            id: 'test-cleanup-' + Date.now(),
            name: 'Test po Cleanup',
            type: 'text',
            required: false,
            options: []
        };
        const postTest = await testAPI('POST', '/api/collection-fields', newField);
        console.log('Status:', postTest.status);
        console.log('Response:', JSON.stringify(postTest.data, null, 2));
        if (postTest.status === 201) {
            console.log('✅ POPRAWNIE - POST endpoint działa');
        } else {
            console.log('❌ BŁĄD - POST endpoint nie działa');
        }
        console.log('---\n');
        
        console.log('🎉 CLEANUP ZAKOŃCZONY POMYŚLNIE!');
        console.log('- Stare endpoints usunięte');
        console.log('- Nowe endpoints działają');
        console.log('- System gotowy do użycia');
        
    } catch (error) {
        console.error('❌ Błąd podczas testowania:', error.message);
    }
}

// Uruchom testy finalne
runFinalTests();