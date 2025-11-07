const fs = require('fs');
const path = require('path');

/**
 * 🔄 SYSTEM MONITOROWANIA SYNCHRONIZACJI PÓL DYNAMICZNYCH
 * 
 * Sprawdza czy pola w wines.json są zsynchronizowane z fields-config.json
 * Ten skrypt powinien być uruchamiany po każdej zmianie w polach dynamicznych
 */

function checkFieldsSynchronization() {
    console.log('🔍 SPRAWDZANIE SYNCHRONIZACJI PÓL DYNAMICZNYCH...\n');
    
    try {
        // Wczytaj konfigurację pól dynamicznych
        const fieldsConfigPath = path.join(__dirname, 'data', 'fields-config.json');
        const fieldsConfig = JSON.parse(fs.readFileSync(fieldsConfigPath, 'utf8'));
        const dynamicFields = fieldsConfig.map(field => field.key).sort();
        
        // Wczytaj dane win
        const winesPath = path.join(__dirname, 'data', 'wines.json');
        const winesData = JSON.parse(fs.readFileSync(winesPath, 'utf8'));
        
        if (winesData.length === 0) {
            console.log('⚠️  Brak danych win do sprawdzenia');
            return true;
        }
        
        // Pobierz pola z pierwszego wina (bez pól systemowych)
        const systemFields = ['id', 'createdAt', 'updatedAt'];
        const wineFields = Object.keys(winesData[0])
            .filter(field => !systemFields.includes(field))
            .sort();
        
        console.log('📋 ANALIZA PÓL:');
        console.log(`   Pola w konfiguracji dynamicznej: ${dynamicFields.length}`);
        console.log(`   Pola w danych JSON: ${wineFields.length}`);
        console.log(`   Liczba win w bazie: ${winesData.length}\n`);
        
        // Sprawdź pola w JSON ale nie w konfiguracji
        const missingInConfig = wineFields.filter(field => !dynamicFields.includes(field));
        if (missingInConfig.length > 0) {
            console.log('❌ POLA W JSON ALE NIE W KONFIGURACJI DYNAMICZNEJ:');
            missingInConfig.forEach(field => console.log(`   - ${field}`));
            console.log('   ⚠️  Te pola nie będą zarządzane przez system dynamiczny!\n');
        }
        
        // Sprawdź pola w konfiguracji ale nie w JSON
        const missingInJson = dynamicFields.filter(field => !wineFields.includes(field));
        if (missingInJson.length > 0) {
            console.log('❌ POLA W KONFIGURACJI ALE NIE W JSON:');
            missingInJson.forEach(field => console.log(`   - ${field}`));
            console.log('   ⚠️  Te pola nie będą wyświetlane w formularzach!\n');
        }
        
        // Wynik
        const isSynchronized = missingInConfig.length === 0 && missingInJson.length === 0;
        
        if (isSynchronized) {
            console.log('✅ SYNCHRONIZACJA KOMPLETNA!');
            console.log('   Wszystkie pola są prawidłowo zsynchronizowane');
            console.log('   System dynamicznych pól działa poprawnie\n');
            
            // Pokaż wszystkie pola
            console.log('📝 AKTUALNE POLA DYNAMICZNE:');
            dynamicFields.forEach(field => {
                const fieldConfig = fieldsConfig.find(f => f.key === field);
                console.log(`   - ${field}: "${fieldConfig.label}" (${fieldConfig.type})`);
            });
        } else {
            console.log('❌ BRAK SYNCHRONIZACJI!');
            console.log('   System wymaga naprawy przed użyciem');
        }
        
        return isSynchronized;
        
    } catch (error) {
        console.error('❌ BŁĄD podczas sprawdzania synchronizacji:', error.message);
        return false;
    }
}

/**
 * Funkcja pomocnicza do automatycznej naprawy synchronizacji
 */
function autoFixSynchronization() {
    console.log('\n🔧 AUTOMATYCZNA NAPRAWA SYNCHRONIZACJI...');
    console.log('   (Ta funkcja mogłaby automatycznie dodawać/usuwać pola)');
    console.log('   Obecnie wymaga ręcznej interwencji');
}

// Uruchom sprawdzenie
if (require.main === module) {
    const isSync = checkFieldsSynchronization();
    
    console.log('\n' + '='.repeat(60));
    console.log(isSync ? '✅ STATUS: ZSYNCHRONIZOWANY' : '❌ STATUS: WYMAGA NAPRAWY');
    console.log('='.repeat(60));
    
    if (!isSync) {
        autoFixSynchronization();
        process.exit(1);
    }
}

module.exports = { checkFieldsSynchronization };