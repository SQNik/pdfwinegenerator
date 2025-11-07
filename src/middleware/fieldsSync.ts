import { Request, Response, NextFunction } from 'express';
import { exec } from 'child_process';
import { promisify } from 'util';
import logger from '../utils/logger';

const execAsync = promisify(exec);

/**
 * 🔄 MIDDLEWARE AUTOMATYCZNEGO SPRAWDZANIA SYNCHRONIZACJI PÓL
 * 
 * Automatycznie sprawdza synchronizację pól dynamicznych przed operacjami
 * związanymi z danymi win (import, CRUD operations)
 */

export interface FieldsSyncRequest extends Request {
  fieldsSyncChecked?: boolean;
  fieldsSyncStatus?: boolean;
}

/**
 * Middleware sprawdzający synchronizację pól przed operacjami na winach
 */
export const checkFieldsSync = async (
  req: FieldsSyncRequest, 
  res: Response, 
  next: NextFunction
): Promise<void> => {
  try {
    // Sprawdź czy już wykonano sprawdzenie w tym request cycle
    if (req.fieldsSyncChecked) {
      if (!req.fieldsSyncStatus) {
        res.status(400).json({
          success: false,
          error: 'Pola dynamiczne nie są zsynchronizowane. Uruchom "npm run sync-fields" aby naprawić.',
        });
        return;
      }
      next();
      return;
    }

    logger.info('🔍 Middleware: Sprawdzanie synchronizacji pól dynamicznych...');
    
    const { stdout, stderr } = await execAsync('node check-fields-sync.js', {
      cwd: process.cwd(),
      timeout: 10000 // 10 sekund timeout
    });

    if (stderr && !stderr.includes('Warning')) {
      logger.warn('Ostrzeżenia podczas sprawdzania pól:', stderr);
    }

    // Sprawdź czy skrypt zwrócił sukces
    const isSync = !stdout.includes('❌') && !stdout.includes('WYMAGA NAPRAWY');
    
    // Zapisz wynik w request object
    req.fieldsSyncChecked = true;
    req.fieldsSyncStatus = isSync;

    if (isSync) {
      logger.info('✅ Middleware: Pola są zsynchronizowane');
      next();
    } else {
      logger.error('❌ Middleware: Pola nie są zsynchronizowane!');
      res.status(400).json({
        success: false,
        error: 'Pola dynamiczne nie są zsynchronizowane. Uruchom "npm run sync-fields" aby naprawić automatycznie.',
        details: 'Sprawdź logi lub uruchom "npm run check-fields" aby zobaczyć szczegóły.',
      });
    }
    
  } catch (error) {
    logger.error('❌ Błąd w middleware sprawdzania pól:', error);
    
    // W przypadku błędu, pozwól kontynuować ale zloguj ostrzeżenie
    logger.warn('⚠️  Kontynuowanie bez sprawdzenia synchronizacji z powodu błędu');
    req.fieldsSyncChecked = true;
    req.fieldsSyncStatus = true; // Assumuj OK w przypadku błędu sprawdzania
    next();
  }
};

/**
 * Szybka wersja middleware - tylko dla operacji krytycznych
 */
export const quickFieldsCheck = async (
  req: FieldsSyncRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Szybkie sprawdzenie - tylko sprawdź czy pliki istnieją
    const fs = require('fs');
    const path = require('path');
    
    const fieldsConfigPath = path.join(process.cwd(), 'data', 'fields-config.json');
    const winesPath = path.join(process.cwd(), 'data', 'wines.json');
    
    if (!fs.existsSync(fieldsConfigPath) || !fs.existsSync(winesPath)) {
      res.status(500).json({
        success: false,
        error: 'Brakuje plików konfiguracji lub danych win.',
      });
      return;
    }
    
    logger.info('✅ Quick check: Pliki konfiguracji istnieją');
    next();
    
  } catch (error) {
    logger.error('❌ Błąd w quick fields check:', error);
    next(); // Kontynuuj mimo błędu
  }
};

/**
 * Pomocnicza funkcja do manualnego sprawdzenia synchronizacji
 */
export const manualFieldsCheck = async (): Promise<{
  isSync: boolean;
  details: string;
}> => {
  try {
    const { stdout } = await execAsync('node check-fields-sync.js', {
      cwd: process.cwd(),
      timeout: 10000
    });

    const isSync = !stdout.includes('❌') && !stdout.includes('WYMAGA NAPRAWY');
    
    return {
      isSync,
      details: stdout
    };
    
  } catch (error) {
    return {
      isSync: false,
      details: `Błąd podczas sprawdzania: ${error instanceof Error ? error.message : 'Nieznany błąd'}`
    };
  }
};