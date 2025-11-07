const fs = require('fs');
const path = require('path');

console.log('🧹 Usuwanie pola "variety" z wines.json...');

try {
    // Wczytaj dane
    const winesPath = path.join(__dirname, 'data', 'wines.json');
    const winesData = JSON.parse(fs.readFileSync(winesPath, 'utf8'));
    
    console.log(`📊 Znaleziono ${winesData.length} win`);
    
    // Sprawdź ile win ma niepuste pole variety
    const winesWithVariety = winesData.filter(wine => wine.variety && wine.variety.trim() !== '');
    console.log(`⚠️  Win z wypełnionym polem variety: ${winesWithVariety.length}`);
    
    if (winesWithVariety.length > 0) {
        console.log('🚨 UWAGA: Niektóre wina mają wypełnione pole variety:');
        winesWithVariety.forEach(wine => {
            console.log(`   - ${wine.catalogNumber}: "${wine.variety}"`);
        });
        console.log('❌ Przerwano - sprawdź dane przed kontynuowaniem');
        process.exit(1);
    }
    
    // Utwórz kopię zapasową
    const backupPath = winesPath + '.backup-before-variety-cleanup';
    fs.copyFileSync(winesPath, backupPath);
    console.log(`💾 Utworzono kopię zapasową: ${backupPath}`);
    
    // Usuń pole variety ze wszystkich win
    const cleanedWines = winesData.map(wine => {
        const { variety, ...wineWithoutVariety } = wine;
        return wineWithoutVariety;
    });
    
    // Zapisz oczyszczone dane
    fs.writeFileSync(winesPath, JSON.stringify(cleanedWines, null, 2));
    
    console.log('✅ Pomyślnie usunięto pole "variety" ze wszystkich win');
    console.log(`📝 Zaktualizowano ${cleanedWines.length} rekordów win`);
    
    // Weryfikacja
    const updatedData = JSON.parse(fs.readFileSync(winesPath, 'utf8'));
    const firstWine = updatedData[0];
    const hasVariety = firstWine.hasOwnProperty('variety');
    
    if (hasVariety) {
        console.log('❌ BŁĄD: Pole variety nadal istnieje!');
        process.exit(1);
    } else {
        console.log('✅ Weryfikacja: Pole variety zostało pomyślnie usunięte');
        
        // Pokaż aktualną strukturę pierwszego wina
        console.log('📋 Aktualna struktura pól:');
        const fields = Object.keys(firstWine).filter(key => !['id', 'createdAt', 'updatedAt'].includes(key));
        fields.forEach(field => console.log(`   - ${field}`));
    }
    
} catch (error) {
    console.error('❌ Błąd podczas usuwania pola variety:', error.message);
    process.exit(1);
}