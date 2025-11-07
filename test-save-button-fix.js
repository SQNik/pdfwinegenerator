const http = require('http');

// Test nowego formatu z wszystkimi polami
async function testCreateCustomFormatWithDescription() {
    return new Promise((resolve, reject) => {
        const newFormat = {
            name: "Test Format z Opisem",
            description: "To jest testowy format stworzony z pełnym opisem",
            width: 200,
            height: 300,
            unit: "mm",
            orientation: "portrait",
            margins: {
                top: 15,
                right: 15,
                bottom: 15,
                left: 15
            },
            isActive: true
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

async function runSaveButtonTest() {
    console.log('🔧 Testing Custom PDF Formats Save Button Fix');
    console.log('='.repeat(60));

    try {
        console.log('📋 Test: Creating custom format with description field');
        const result = await testCreateCustomFormatWithDescription();
        
        console.log(`✅ Status: ${result.statusCode}`);
        
        if (result.statusCode === 201) {
            console.log('🎉 SUCCESS: Format created successfully!');
            console.log('📄 Created format:', JSON.stringify(result.data.data, null, 2));
            
            // Sprawdź czy wszystkie pola zostały zapisane
            const format = result.data.data;
            const requiredFields = ['name', 'description', 'width', 'height', 'unit', 'orientation', 'margins', 'isActive'];
            let allFieldsPresent = true;
            
            for (const field of requiredFields) {
                if (!(field in format)) {
                    console.log(`❌ Missing field: ${field}`);
                    allFieldsPresent = false;
                }
            }
            
            if (allFieldsPresent) {
                console.log('✅ All required fields are present in the response');
                
                // Sprawdź specyficzne wartości
                if (format.description === "To jest testowy format stworzony z pełnym opisem") {
                    console.log('✅ Description field saved correctly');
                } else {
                    console.log('❌ Description field not saved correctly');
                }
                
                if (format.margins.top === 15 && format.margins.right === 15) {
                    console.log('✅ Margins saved correctly');
                } else {
                    console.log('❌ Margins not saved correctly');
                }
            }
            
        } else {
            console.log('❌ FAILED: Unexpected status code');
            console.log('📄 Response:', JSON.stringify(result.data, null, 2));
        }

    } catch (error) {
        console.error('❌ Test failed:', error.message);
        process.exit(1);
    }
}

// Wait for server to be ready
setTimeout(runSaveButtonTest, 1000);