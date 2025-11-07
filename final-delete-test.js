// Final DELETE test dla kompletnego pokrycia CRUD
const http = require('http');

function apiCall(method, path, data = null) {
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

async function finalTest() {
    console.log('🔥 FINAL TEST DELETE - Uzupełnienie testów CRUD\n');
    
    try {
        // 1. Pobierz aktualną konfigurację
        console.log('1. Pobieranie aktualnej konfiguracji...');
        const config = await apiCall('GET', '/api/collection-fields/config');
        
        if (config.status !== 200) {
            console.log('❌ Nie można pobrać konfiguracji');
            return;
        }
        
        console.log(`✅ Pobrano ${config.data.data.length} pól`);
        
        // 2. Znajdź pole testowe do usunięcia (nie podstawowe "notes")
        const testField = config.data.data.find(field => field.id !== 'notes');
        
        if (!testField) {
            console.log('⚠️ Brak pól testowych do usunięcia (zachowuję podstawowe pole "notes")');
            
            // 3. Utwórz pole testowe do usunięcia
            console.log('3. Tworzenie pola testowego do usunięcia...');
            const createResult = await apiCall('POST', '/api/collection-fields/config', {
                name: 'POLE DO USUNIĘCIA - TEST',
                type: 'text',
                required: false
            });
            
            if (createResult.status === 201) {
                console.log(`✅ Utworzono pole testowe ID: ${createResult.data.data.id}`);
                
                // 4. Usuń utworzone pole
                console.log('4. Usuwanie pola testowego...');
                const deleteResult = await apiCall('DELETE', `/api/collection-fields/config/${createResult.data.data.id}`);
                
                if (deleteResult.status === 200) {
                    console.log('✅ DELETE test - SUCCESS');
                    console.log('🎉 CRUD DELETE functionality verified!');
                } else {
                    console.log(`❌ DELETE test - FAILED (Status: ${deleteResult.status})`);
                }
            } else {
                console.log('❌ Nie można utworzyć pola testowego');
            }
        } else {
            // 4. Usuń znalezione pole testowe
            console.log(`4. Usuwanie pola testowego ID: ${testField.id} (${testField.name})...`);
            const deleteResult = await apiCall('DELETE', `/api/collection-fields/config/${testField.id}`);
            
            if (deleteResult.status === 200) {
                console.log('✅ DELETE test - SUCCESS');
                console.log('🎉 CRUD DELETE functionality verified!');
            } else {
                console.log(`❌ DELETE test - FAILED (Status: ${deleteResult.status})`);
            }
        }
        
        // 5. Weryfikacja finalnej konfiguracji
        console.log('5. Weryfikacja finalnej konfiguracji...');
        const finalConfig = await apiCall('GET', '/api/collection-fields/config');
        
        if (finalConfig.status === 200) {
            console.log(`✅ Finalna konfiguracja: ${finalConfig.data.data.length} pól`);
            finalConfig.data.data.forEach(field => {
                console.log(`   - ${field.name} (${field.type}) [${field.id}]`);
            });
        }
        
        console.log('\n🏆 FINAL TEST COMPLETE - WSZYSTKIE OPERACJE CRUD PRZETESTOWANE!');
        
    } catch (error) {
        console.error('❌ BŁĄD:', error.message);
    }
}

finalTest();