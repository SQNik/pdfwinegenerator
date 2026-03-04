/**
 * Upload Routes - File upload endpoints
 */

import express from 'express';
import { handleCoverUpload, deleteCoverImage, listCoverImages } from '../controllers/uploadController';

const router = express.Router();

export function createUploadRoutes() {
  // GET /api/upload/covers - List all cover images
  router.get('/covers', listCoverImages);
  
  // POST /api/upload/cover - Upload cover image
  router.post('/cover', handleCoverUpload);

  // DELETE /api/upload/cover/:filename - Delete cover image
  router.delete('/cover/:filename', deleteCoverImage);

  return router;
}
