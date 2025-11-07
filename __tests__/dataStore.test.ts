import { DataStore } from '../src/services/dataStore';
import { Wine } from '../src/types';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('DataStore', () => {
  let dataStore: DataStore;
  const testDataDir = path.join(__dirname, 'test-data');

  beforeEach(async () => {
    // Create test data directory
    try {
      await fs.mkdir(testDataDir, { recursive: true });
    } catch (error) {
      // Directory already exists
    }

    dataStore = new DataStore(testDataDir);
    await dataStore.initialize();
  });

  afterEach(async () => {
    // Clean up test data
    try {
      await fs.rm(testDataDir, { recursive: true, force: true });
    } catch (error) {
      // Directory doesn't exist
    }
  });

  describe('Wine operations', () => {
    it('should create a new wine', async () => {
      const wineData = {
        catalogNumber: 'TEST-001',
        name: 'Test Wine',
        szczepy: 'Merlot',
        region: 'Tuscany',
        category: 'czerwone',
        type: 'wytrawne',
        alcohol: '13.5%',
        price1: '50.00',
      };

      const wine = await dataStore.createWine(wineData);

      expect(wine).toBeDefined();
      expect(wine.id).toBeDefined();
      expect(wine.catalogNumber).toBe(wineData.catalogNumber);
      expect(wine.name).toBe(wineData.name);
      expect((wine as any).szczepy).toBe(wineData.szczepy);
      expect(wine.createdAt).toBeDefined();
      expect(wine.updatedAt).toBeDefined();
    });

    it('should get a wine by id', async () => {
      const wineData = {
        catalogNumber: 'TEST-002',
        name: 'Test Wine',
        szczepy: 'Pinot Noir',
        region: 'Burgundy',
      };

      const createdWine = await dataStore.createWine(wineData);
      const retrievedWine = dataStore.getWine(createdWine.id);

      expect(retrievedWine).toBeDefined();
      expect(retrievedWine?.id).toBe(createdWine.id);
      expect(retrievedWine?.name).toBe(wineData.name);
    });

    it('should update a wine', async () => {
      const wineData = {
        catalogNumber: 'TEST-003',
        name: 'Test Wine',
        szczepy: 'Cabernet Sauvignon',
      };

      const createdWine = await dataStore.createWine(wineData);
      const updateData = { name: 'Updated Wine Name' };
      const updatedWine = await dataStore.updateWine(createdWine.id, updateData);

      expect(updatedWine).toBeDefined();
      expect(updatedWine?.name).toBe('Updated Wine Name');
      expect((updatedWine as any)?.szczepy).toBe(wineData.szczepy);
    });

    it('should delete a wine', async () => {
      const wineData = {
        catalogNumber: 'TEST-004',
        name: 'Test Wine',
        producer: 'Test Producer',
      };

      const createdWine = await dataStore.createWine(wineData);
      const deleted = await dataStore.deleteWine(createdWine.id);

      expect(deleted).toBe(true);
      expect(dataStore.getWine(createdWine.id)).toBeUndefined();
    });

    it('should check if wine exists', async () => {
      const wineData = {
        catalogNumber: 'TEST-005',
        name: 'Test Wine',
        producer: 'Test Producer',
      };

      const createdWine = await dataStore.createWine(wineData);
      
      expect(dataStore.wineExists(createdWine.id)).toBe(true);
      expect(dataStore.wineExists('non-existent-id')).toBe(false);
    });
  });
});