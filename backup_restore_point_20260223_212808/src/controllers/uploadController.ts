/**
 * Upload Controller - Handle file uploads (cover images, etc.)
 */

import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import logger from '../utils/logger';

// Configure multer storage for cover images
const coverStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.cwd(), 'public', 'images', 'okladki');
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename: cover-{timestamp}-{random}.{ext}
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    const ext = path.extname(file.originalname);
    const filename = `cover-${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

// File filter - only images
const imageFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Nieprawidłowy typ pliku. Dozwolone: JPG, PNG, GIF, WebP'));
  }
};

// Multer upload middleware for cover images
export const uploadCoverImage = multer({
  storage: coverStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB max
  }
}).single('coverImage');

/**
 * Handle cover image upload
 * POST /api/upload/cover
 */
export const handleCoverUpload = (req: Request, res: Response): void => {
  uploadCoverImage(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      logger.error('Multer error during cover upload:', err);
      
      if (err.code === 'LIMIT_FILE_SIZE') {
        res.status(400).json({
          success: false,
          error: 'Plik jest za duży. Maksymalny rozmiar to 5 MB.'
        });
        return;
      }
      
      res.status(400).json({
        success: false,
        error: `Błąd uploadu: ${err.message}`
      });
      return;
    } else if (err) {
      logger.error('Error during cover upload:', err);
      res.status(400).json({
        success: false,
        error: err.message
      });
      return;
    }
    
    if (!req.file) {
      res.status(400).json({
        success: false,
        error: 'Nie przesłano pliku'
      });
      return;
    }
    
    // Return relative URL path (for frontend use)
    const relativePath = `/images/okladki/${req.file.filename}`;
    
    logger.info('Cover image uploaded successfully:', {
      filename: req.file.filename,
      size: req.file.size,
      path: relativePath
    });
    
    res.json({
      success: true,
      data: {
        filename: req.file.filename,
        path: relativePath,
        size: req.file.size,
        mimetype: req.file.mimetype
      }
    });
  });
};

/**
 * Delete cover image
 * DELETE /api/upload/cover/:filename
 */
export const deleteCoverImage = (req: Request, res: Response): void => {
  try {
    const { filename } = req.params;
    
    if (!filename) {
      res.status(400).json({
        success: false,
        error: 'Brak nazwy pliku'
      });
      return;
    }
    
    // Security: only allow deleting files from okladki folder with 'cover-' prefix
    if (!filename.startsWith('cover-')) {
      res.status(403).json({
        success: false,
        error: 'Odmowa dostępu'
      });
      return;
    }
    
    const filePath = path.join(process.cwd(), 'public', 'images', 'okladki', filename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      res.status(404).json({
        success: false,
        error: 'Plik nie istnieje'
      });
      return;
    }
    
    // Delete file
    fs.unlinkSync(filePath);
    
    logger.info('Cover image deleted successfully:', { filename });
    
    res.json({
      success: true,
      message: 'Plik usunięty pomyślnie'
    });
  } catch (error: any) {
    logger.error('Error deleting cover image:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

/**
 * List all cover images
 * GET /api/upload/covers
 */
export const listCoverImages = (req: Request, res: Response): void => {
  try {
    const coversDir = path.join(process.cwd(), 'public', 'images', 'okladki');
    
    // Check if directory exists
    if (!fs.existsSync(coversDir)) {
      res.json({
        success: true,
        data: []
      });
      return;
    }
    
    // Read directory
    const files = fs.readdirSync(coversDir);
    
    // Filter image files and get file stats
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const coverImages = files
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
      })
      .map(file => {
        const filePath = path.join(coversDir, file);
        const stats = fs.statSync(filePath);
        
        return {
          filename: file,
          path: `/images/okladki/${file}`,
          size: stats.size,
          createdAt: stats.birthtime,
          modifiedAt: stats.mtime
        };
      })
      // Sort by creation date (newest first)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    logger.info(`Listed ${coverImages.length} cover images`);
    
    res.json({
      success: true,
      data: coverImages
    });
  } catch (error: any) {
    logger.error('Error listing cover images:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};
