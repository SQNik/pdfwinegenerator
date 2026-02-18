import { Router } from 'express';
import { CollectionController } from '../controllers/collectionController';
import { DataStore } from '../services/dataStore';
import * as fs from 'fs/promises';
import * as path from 'path';

export const createCollectionRoutes = (dataStore: DataStore): Router => {
  const router = Router();
  const collectionController = new CollectionController(dataStore);

  // Collections CRUD
  router.get('/', collectionController.getCollections);
  router.get('/:id', collectionController.getCollection);
  router.post('/', collectionController.createCollection);
  router.put('/:id', collectionController.updateCollection);
  router.delete('/:id', collectionController.deleteCollection);

  // Wine management in collections
  router.post('/:id/wines/:wineId', collectionController.addWineToCollection);
  router.delete('/:id/wines/:wineId', collectionController.removeWineFromCollection);

  // Export functionality
  router.get('/export/merged', collectionController.getCollectionsWithFullWineData);
  router.get('/:id/export', collectionController.exportCollectionWithWines);

  // Helper endpoint - list cover images
  router.get('/helpers/cover-images', async (req, res) => {
    try {
      const coversDir = path.join(process.cwd(), 'public', 'images', 'okladki');
      const files = await fs.readdir(coversDir);
      
      // Filter only image files
      const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp'].includes(ext);
      });

      // Return as paths relative to public folder
      const imagePaths = imageFiles.map(file => `/images/okladki/${file}`);

      res.json({
        success: true,
        data: imagePaths
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        error: error instanceof Error ? error.message : 'Błąd wczytywania plików okładek'
      });
    }
  });

  return router;
};