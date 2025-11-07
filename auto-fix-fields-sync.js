const fs = require('fs');
const path = require('path');

/**
 * 🔧 AUTOMATYCZNA NAPRAWA SYNCHRONIZACJI PÓL DYNAMICZNYCH
 * 
 * Ten skrypt automatycznie naprawia niezgodności między polami w wines.json
 * a konfiguracją dynamiczną w fields-config.json
 */

async function autoFixFieldsSynchronization() {
    console.log('🔧 AUTOMATYCZNA NAPRAWA SYNCHRONIZACJI PÓL...\n');
    
    try {
        // Wczytaj konfigurację pól dynamicznych
        const fieldsConfigPath = path.join(__dirname, 'data', 'fields-config.json');
        const fieldsConfig = JSON.parse(fs.readFileSync(fieldsConfigPath, 'utf8'));
        const dynamicFields = fieldsConfig.map(field => field.key).sort();
        
        // Wczytaj dane win
        const winesPath = path.join(__dirname, 'data', 'wines.json');
        const winesData = JSON.parse(fs.readFileSync(winesPath, 'utf8'));
        
        if (winesData.length === 0) {
            console.log('⚠️  Brak danych win do naprawy');
            return true;
        }
        
        // Pobierz pola z pierwszego wina (bez pól systemowych)
        const systemFields = ['id', 'createdAt', 'updatedAt'];
        const wineFields = Object.keys(winesData[0])
            .filter(field => !systemFields.includes(field))
            .sort();
        
        console.log('📋 ANALIZA PRZED NAPRAWĄ:');
        console.log(`   Pola w konfiguracji: ${dynamicFields.length}`);
        console.log(`   Pola w JSON: ${wineFields.length}`);
        
        // Znajdź pola do usunięcia (w JSON ale nie w konfiguracji)
        const fieldsToRemove = wineFields.filter(field => !dynamicFields.includes(field));
        // Znajdź pola do dodania (w konfiguracji ale nie w JSON)
        const fieldsToAdd = dynamicFields.filter(field => !wineFields.includes(field));
        
        let changesMade = false;
        
        // 1. USUŃ ZBĘDNE POLA
        if (fieldsToRemove.length > 0) {
            console.log(`\n🗑️  USUWANIE ZBĘDNYCH PÓL: ${fieldsToRemove.join(', ')}`);
            
            // Utwórz kopię zapasową
            const backupPath = winesPath + '.backup-auto-fix-' + Date.now();
            fs.copyFileSync(winesPath, backupPath);
            console.log(`💾 Kopia zapasowa: ${path.basename(backupPath)}`);
            
            // Usuń zbędne pola ze wszystkich win
            const cleanedWines = winesData.map(wine => {
                const cleanedWine = { ...wine };
                fieldsToRemove.forEach(field => {
                    delete cleanedWine[field];
                });
                return cleanedWine;
            });
            
            // Zapisz oczyszczone dane
            fs.writeFileSync(winesPath, JSON.stringify(cleanedWines, null, 2));
            console.log(`✅ Usunięto ${fieldsToRemove.length} zbędnych pól z ${cleanedWines.length} win`);
            changesMade = true;
            
            // Zaktualizuj dane dla kolejnego kroku
            winesData.splice(0, winesData.length, ...cleanedWines);
        }
        
        // 2. DODAJ BRAKUJĄCE POLA
        if (fieldsToAdd.length > 0) {
            console.log(`\n➕ DODAWANIE BRAKUJĄCYCH PÓL: ${fieldsToAdd.join(', ')}`);
            
            // Jeśli nie było kopii zapasowej wcześniej, utwórz teraz
            if (!changesMade) {
                const backupPath = winesPath + '.backup-auto-fix-' + Date.now();
                fs.copyFileSync(winesPath, backupPath);
                console.log(`💾 Kopia zapasowa: ${path.basename(backupPath)}`);
            }
            
            // Dodaj brakujące pola ze wszystkich win
            const updatedWines = winesData.map(wine => {
                const updatedWine = { ...wine };
                
                // Usuń pola systemowe tymczasowo
                const { id, createdAt, updatedAt, ...otherFields } = updatedWine;
                
                // Dodaj brakujące pola z pustymi wartościami
                fieldsToAdd.forEach(field => {
                    otherFields[field] = "";
                });
                
                // Przywróć pola systemowe na końcu
                return {
                    ...otherFields,
                    id,
                    createdAt,
                    updatedAt
                };
            });
            
            // Zapisz zaktualizowane dane
            fs.writeFileSync(winesPath, JSON.stringify(updatedWines, null, 2));
            console.log(`✅ Dodano ${fieldsToAdd.length} brakujących pól do ${updatedWines.length} win`);
            changesMade = true;
        }
        
        // 3. WERYFIKACJA
        if (changesMade) {
            console.log('\n🔍 WERYFIKACJA PO NAPRAWIE...');
            
            // Ponownie wczytaj dane i sprawdź
            const verifyData = JSON.parse(fs.readFileSync(winesPath, 'utf8'));
            const verifyFields = Object.keys(verifyData[0])
                .filter(field => !systemFields.includes(field))
                .sort();
            
            const stillMissing = dynamicFields.filter(field => !verifyFields.includes(field));
            const stillExtra = verifyFields.filter(field => !dynamicFields.includes(field));
            
            if (stillMissing.length === 0 && stillExtra.length === 0) {
                console.log('✅ NAPRAWA ZAKOŃCZONA SUKCESEM!');
                console.log(`   Wszystkie ${dynamicFields.length} pól zsynchronizowanych`);
                
                // Pokaż aktualną strukturę
                console.log('\n📝 AKTUALNA STRUKTURA PÓL:');
                verifyFields.forEach(field => {
                    const fieldConfig = fieldsConfig.find(f => f.key === field);
                    console.log(`   - ${field}: "${fieldConfig?.label || 'Brak etykiety'}" (${fieldConfig?.type || 'unknown'})`);
                });
                
                return true;
            } else {
                console.log('❌ NAPRAWA NIEUDANA!');
                if (stillMissing.length > 0) {
                    console.log(`   Nadal brakuje: ${stillMissing.join(', ')}`);
                }
                if (stillExtra.length > 0) {
                    console.log(`   Nadal zbędne: ${stillExtra.join(', ')}`);
                }
                return false;
            }
        } else {
            console.log('\n✅ BRAK ZMIAN DO WYKONANIA - POLA JUŻ ZSYNCHRONIZOWANE!');
            return true;
        }
        
    } catch (error) {
        console.error('❌ BŁĄD podczas automatycznej naprawy:', error.message);
        return false;
    }
}

// Uruchom naprawę
if (require.main === module) {
    autoFixFieldsSynchronization().then(success => {
        console.log('\n' + '='.repeat(60));
        console.log(success ? '✅ STATUS: NAPRAWA ZAKOŃCZONA' : '❌ STATUS: NAPRAWA NIEUDANA');
        console.log('='.repeat(60));
        
        process.exit(success ? 0 : 1);
    });
}

module.exports = { autoFixFieldsSynchronization };