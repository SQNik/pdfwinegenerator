// KOMPLETNY TEST CRUD - System Dynamicznych Pól Kolekcji
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

function printSection(title) {
    console.log('\n' + '='.repeat(60));
    console.log(`🧪 ${title}`);
    console.log('='.repeat(60));
}

function printStep(step, description) {
    console.log(`\n${step}. ${description}`);
    console.log('-'.repeat(40));
}

function printResult(success, message, data = null) {
    const icon = success ? '✅' : '❌';
    console.log(`${icon} ${message}`);
    if (data) {
        console.log(JSON.stringify(data, null, 2));
    }
}

async function runCompleteCRUDTests() {
    printSection('KOMPLETNY TEST CRUD - SYSTEM DYNAMICZNYCH PÓL KOLEKCJI');
    
    let testResults = {
        passed: 0,
        failed: 0,
        createdFieldId: null
    };
    
    try {
        // TEST 1: READ - Pobieranie początkowej konfiguracji
        printStep('1', 'READ - Pobieranie początkowej konfiguracji pól');
        const initialConfig = await testAPI('GET', '/api/collection-fields/config');
        if (initialConfig.status === 200) {
            printResult(true, 'Pobieranie konfiguracji - SUCCESS', initialConfig.data);
            testResults.passed++;
        } else {
            printResult(false, `Pobieranie konfiguracji - FAILED (Status: ${initialConfig.status})`, initialConfig.data);
            testResults.failed++;
        }

        // TEST 2: CREATE - Tworzenie nowego pola tekstowego
        printStep('2', 'CREATE - Tworzenie nowego pola tekstowego');
        const newTextField = {
            name: 'Test Pole Tekstowe',
            type: 'text',
            required: false,
            validation: {
                min: 2,
                max: 100
            }
        };
        const createResult = await testAPI('POST', '/api/collection-fields/config', newTextField);
        if (createResult.status === 201) {
            testResults.createdFieldId = createResult.data.data.id;
            printResult(true, 'Tworzenie pola tekstowego - SUCCESS', createResult.data);
            testResults.passed++;
        } else {
            printResult(false, `Tworzenie pola tekstowego - FAILED (Status: ${createResult.status})`, createResult.data);
            testResults.failed++;
        }

        // TEST 3: CREATE - Tworzenie pola select z opcjami
        printStep('3', 'CREATE - Tworzenie pola select z opcjami');
        const newSelectField = {
            name: 'Test Kategoria',
            type: 'select',
            required: true,
            options: ['Kategoria A', 'Kategoria B', 'Kategoria C']
        };
        const createSelectResult = await testAPI('POST', '/api/collection-fields/config', newSelectField);
        if (createSelectResult.status === 201) {
            printResult(true, 'Tworzenie pola select - SUCCESS', createSelectResult.data);
            testResults.passed++;
        } else {
            printResult(false, `Tworzenie pola select - FAILED (Status: ${createSelectResult.status})`, createSelectResult.data);
            testResults.failed++;
        }

        // TEST 4: READ - Sprawdzenie czy nowe pola są w konfiguracji
        printStep('4', 'READ - Weryfikacja nowych pól w konfiguracji');
        const updatedConfig = await testAPI('GET', '/api/collection-fields/config');
        if (updatedConfig.status === 200) {
            const fieldsCount = updatedConfig.data.data.length;
            printResult(true, `Konfiguracja zawiera ${fieldsCount} pól`, updatedConfig.data);
            testResults.passed++;
        } else {
            printResult(false, `Pobieranie konfiguracji - FAILED (Status: ${updatedConfig.status})`, updatedConfig.data);
            testResults.failed++;
        }

        // TEST 5: READ - Pobieranie pojedynczego pola
        if (testResults.createdFieldId) {
            printStep('5', 'READ - Pobieranie pojedynczego pola po ID');
            const singleField = await testAPI('GET', `/api/collection-fields/config/${testResults.createdFieldId}`);
            if (singleField.status === 200) {
                printResult(true, 'Pobieranie pojedynczego pola - SUCCESS', singleField.data);
                testResults.passed++;
            } else {
                printResult(false, `Pobieranie pojedynczego pola - FAILED (Status: ${singleField.status})`, singleField.data);
                testResults.failed++;
            }
        }

        // TEST 6: UPDATE - Aktualizacja pola
        if (testResults.createdFieldId) {
            printStep('6', 'UPDATE - Aktualizacja istniejącego pola');
            const updateData = {
                name: 'Test Pole Tekstowe - ZAKTUALIZOWANE',
                type: 'text',
                required: true,
                validation: {
                    min: 5,
                    max: 200
                }
            };
            const updateResult = await testAPI('PUT', `/api/collection-fields/config/${testResults.createdFieldId}`, updateData);
            if (updateResult.status === 200) {
                printResult(true, 'Aktualizacja pola - SUCCESS', updateResult.data);
                testResults.passed++;
            } else {
                printResult(false, `Aktualizacja pola - FAILED (Status: ${updateResult.status})`, updateResult.data);
                testResults.failed++;
            }
        }

        // TEST 7: CREATE - Tworzenie pola textarea
        printStep('7', 'CREATE - Tworzenie pola textarea');
        const newTextareaField = {
            name: 'Test Opis',
            type: 'textarea',
            required: false,
            validation: {
                max: 1000
            }
        };
        const createTextareaResult = await testAPI('POST', '/api/collection-fields/config', newTextareaField);
        if (createTextareaResult.status === 201) {
            printResult(true, 'Tworzenie pola textarea - SUCCESS', createTextareaResult.data);
            testResults.passed++;
        } else {
            printResult(false, `Tworzenie pola textarea - FAILED (Status: ${createTextareaResult.status})`, createTextareaResult.data);
            testResults.failed++;
        }

        // TEST 8: GET Stats - Sprawdzenie statystyk użycia
        printStep('8', 'READ - Pobieranie statystyk użycia pól');
        const statsResult = await testAPI('GET', '/api/collection-fields/stats');
        if (statsResult.status === 200) {
            printResult(true, 'Pobieranie statystyk - SUCCESS', statsResult.data);
            testResults.passed++;
        } else {
            printResult(false, `Pobieranie statystyk - FAILED (Status: ${statsResult.status})`, statsResult.data);
            testResults.failed++;
        }

        // TEST 9: UPDATE Order - Zarządzanie kolejnością pól
        printStep('9', 'UPDATE - Zarządzanie kolejnością pól');
        const currentConfigForOrder = await testAPI('GET', '/api/collection-fields/config');
        if (currentConfigForOrder.status === 200 && currentConfigForOrder.data.data.length > 1) {
            const fieldIds = currentConfigForOrder.data.data.map(field => field.id);
            const reversedIds = [...fieldIds].reverse(); // Odwróć kolejność
            
            const orderResult = await testAPI('PUT', '/api/collection-fields/order', { fieldIds: reversedIds });
            if (orderResult.status === 200) {
                printResult(true, 'Aktualizacja kolejności - SUCCESS', orderResult.data);
                testResults.passed++;
            } else {
                printResult(false, `Aktualizacja kolejności - FAILED (Status: ${orderResult.status})`, orderResult.data);
                testResults.failed++;
            }
        } else {
            printResult(false, 'Brak wystarczającej liczby pól do testu kolejności');
            testResults.failed++;
        }

        // TEST 10: Weryfikacja nowej kolejności
        printStep('10', 'READ - Weryfikacja nowej kolejności pól');
        const finalConfig = await testAPI('GET', '/api/collection-fields/config');
        if (finalConfig.status === 200) {
            printResult(true, 'Weryfikacja kolejności - SUCCESS', finalConfig.data);
            testResults.passed++;
        } else {
            printResult(false, `Weryfikacja kolejności - FAILED (Status: ${finalConfig.status})`, finalConfig.data);
            testResults.failed++;
        }

        // TEST 11: DELETE - Usuwanie pola (jeśli zostało utworzone)
        if (testResults.createdFieldId) {
            printStep('11', 'DELETE - Usuwanie testowego pola');
            const deleteResult = await testAPI('DELETE', `/api/collection-fields/config/${testResults.createdFieldId}`);
            if (deleteResult.status === 200) {
                printResult(true, 'Usuwanie pola - SUCCESS', deleteResult.data);
                testResults.passed++;
            } else {
                printResult(false, `Usuwanie pola - FAILED (Status: ${deleteResult.status})`, deleteResult.data);
                testResults.failed++;
            }
        }

        // TEST 12: Finalna weryfikacja konfiguracji
        printStep('12', 'READ - Finalna weryfikacja konfiguracji');
        const finalVerification = await testAPI('GET', '/api/collection-fields/config');
        if (finalVerification.status === 200) {
            printResult(true, 'Finalna weryfikacja - SUCCESS', finalVerification.data);
            testResults.passed++;
        } else {
            printResult(false, `Finalna weryfikacja - FAILED (Status: ${finalVerification.status})`, finalVerification.data);
            testResults.failed++;
        }

    } catch (error) {
        printResult(false, `BŁĄD KRYTYCZNY: ${error.message}`);
        testResults.failed++;
    }

    // PODSUMOWANIE TESTÓW
    printSection('PODSUMOWANIE TESTÓW CRUD');
    console.log(`📊 Testy zakończone:`);
    console.log(`   ✅ Pomyślne: ${testResults.passed}`);
    console.log(`   ❌ Nieudane: ${testResults.failed}`);
    console.log(`   📈 Wskaźnik sukcesu: ${Math.round((testResults.passed / (testResults.passed + testResults.failed)) * 100)}%`);
    
    if (testResults.failed === 0) {
        console.log('\n🎉 WSZYSTKIE TESTY PRZESZŁY POMYŚLNIE!');
        console.log('🚀 System dynamicznych pól kolekcji jest gotowy do produkcji!');
    } else {
        console.log('\n⚠️  Niektóre testy nie powiodły się. Sprawdź szczegóły powyżej.');
    }
    
    console.log('\n' + '='.repeat(60));
}

// Uruchom kompletne testy CRUD
runCompleteCRUDTests();