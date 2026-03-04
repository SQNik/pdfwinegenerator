import { Request, Response, NextFunction } from 'express';
import { DataStore } from '../services/dataStore';
import { importSchema } from '../validators/schemas';
import { generateId } from '../utils/helpers';
import { Wine, ApiResponse, ImportResult, ValidationError } from '../types';
import logger from '../utils/logger';
import csvParser from 'csv-parser';
import fetch from 'node-fetch';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

export class ImportController {
  constructor(private dataStore: DataStore) {}

  /**
   * � Walidacja pól importu względem konfiguracji dynamicznej
   */
  private validateImportFields(importColumns: string[]): {
    valid: boolean;
    errors: string[];
    mappedFields: Record<string, string>;
    unmappedColumns: string[];
  } {
    const fieldsConfig = this.dataStore.getFieldsConfig();
    const availableFields = fieldsConfig.map(field => field.key);
    
    // Standard field mapping (column name -> field key)
    const fieldMapping: Record<string, string> = {
      'name': 'name',
      'region': 'region', 
      'type': 'type',
      'alcohol': 'alcohol',
      'description': 'description',
      'category': 'category',
      'szczepy': 'szczepy',
      'variety': 'szczepy',  // Alternative name
      'vol': 'poj',
      'volume': 'poj',       // Alternative name
      'poj': 'poj',
      'catalogNumber': 'catalogNumber',
      'catalog': 'catalogNumber',  // Alternative name
      'image': 'image',
      'price1': 'price1',
      'price2': 'price2'
    };

    const errors: string[] = [];
    const mappedFields: Record<string, string> = {};
    const unmappedColumns: string[] = [];

    // Check each import column
    for (const column of importColumns) {
      const normalizedColumn = column.toLowerCase().trim();
      
      // Try to find mapping
      let mappedField: string | undefined;
      
      // 1. Direct mapping from fieldMapping
      for (const [key, value] of Object.entries(fieldMapping)) {
        if (key.toLowerCase() === normalizedColumn) {
          mappedField = value;
          break;
        }
      }
      
      // 2. Direct match with available fields (case-insensitive)
      if (!mappedField) {
        mappedField = availableFields.find(field => 
          field.toLowerCase() === normalizedColumn
        );
      }
      
      if (mappedField) {
        // Verify the mapped field exists in configuration
        if (availableFields.includes(mappedField)) {
          mappedFields[column] = mappedField;
        } else {
          errors.push(`Kolumna "${column}" mapuje się na nieistniejące pole "${mappedField}"`);
          unmappedColumns.push(column);
        }
      } else {
        // Column cannot be mapped
        unmappedColumns.push(column);
        errors.push(`Nieznana kolumna: "${column}"`);
      }
    }

    // Show available fields for reference
    if (unmappedColumns.length > 0) {
      errors.push(`Dostępne pola dynamiczne: ${availableFields.join(', ')}`);
    }

    return {
      valid: errors.length === 0,
      errors,
      mappedFields,
      unmappedColumns
    };
  }

  /**
   * �🔄 Automatyczne sprawdzanie synchronizacji pól dynamicznych
   */
  private async checkFieldsSynchronization(): Promise<boolean> {
    try {
      logger.info('🔍 Sprawdzanie synchronizacji pól dynamicznych...');
      
      const { stdout, stderr } = await execAsync('node check-fields-sync.js', {
        cwd: process.cwd()
      });

      if (stderr) {
        logger.warn('Ostrzeżenia podczas sprawdzania pól:', stderr);
      }

      // Sprawdź czy skrypt zwrócił sukces (brak "❌" w outputcie)
      const isSync = !stdout.includes('❌') && !stdout.includes('WYMAGA NAPRAWY');
      
      if (isSync) {
        logger.info('✅ Pola są zsynchronizowane');
      } else {
        logger.error('❌ Pola nie są zsynchronizowane!');
        logger.error('Output:', stdout);
      }

      return isSync;
    } catch (error) {
      logger.error('Błąd podczas sprawdzania synchronizacji pól:', error);
      return false;
    }
  }

  importFromGoogleSheets = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { error, value } = importSchema.validate(req.body);

      if (error) {
        const validationErrors: ValidationError[] = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context?.value,
        }));

        const response: ApiResponse = {
          success: false,
          error: 'Validation failed',
          validationErrors,
        };

        res.status(400).json(response);
        return;
      }

      const { url, clearBefore = false, validateFields = true } = value;
      
      // 🔄 AUTOMATYCZNE SPRAWDZENIE SYNCHRONIZACJI PRZED IMPORTEM
      logger.info('🚀 Rozpoczynanie importu z Google Sheets...');
      const isFieldsSync = await this.checkFieldsSynchronization();
      
      if (!isFieldsSync) {
        const response: ApiResponse = {
          success: false,
          error: 'Pola dynamiczne nie są zsynchronizowane! Uruchom "npm run check-fields" i napraw problemy przed importem.',
        };
        res.status(400).json(response);
        return;
      }

      const results: Record<string, unknown>[] = [];

      // Clear existing wines if requested
      if (clearBefore) {
        await this.dataStore.clearAllWines();
        logger.info('Cleared all existing wines before Google Sheets import');
      }

      // Fetch CSV from Google Sheets
      logger.info(`Fetching CSV from URL: ${url}`);
      const response = await fetch(url);
      
      if (!response.ok) {
        const error = `Failed to fetch CSV file: ${response.status} ${response.statusText}`;
        logger.error(error);
        throw new Error(error);
      }

      if (!response.body) {
        const error = 'Response body is null';
        logger.error(error);
        throw new Error(error);
      }

      logger.info('CSV fetch successful, parsing content...');
      
      await new Promise<void>((resolve, reject) => {
        response.body!
          .pipe(csvParser())
          .on('data', (row: Record<string, unknown>) => {
            results.push(row);
          })
          .on('end', () => {
            logger.info(`CSV parsing completed, ${results.length} rows parsed`);
            resolve();
          })
          .on('error', (error: Error) => {
            logger.error('CSV parsing error:', error);
            reject(error);
          });
      });

      // 🔍 WALIDACJA PÓL PRZED IMPORTEM Z GOOGLE SHEETS
      if (results.length > 0 && results[0]) {
        const headers = Object.keys(results[0]);
        logger.info(`🔍 Sprawdzanie kompatybilności pól Google Sheets z konfiguracją dynamiczną...`);
        logger.info(`📋 Znalezione kolumny Google Sheets: ${headers.join(', ')}`);
        
        const fieldValidation = this.validateImportFields(headers);
        
        if (!fieldValidation.valid) {
          logger.error('❌ Błędy walidacji pól Google Sheets:');
          fieldValidation.errors.forEach(error => logger.error(`   - ${error}`));
          
          const apiResponse: ApiResponse = {
            success: false,
            error: 'Nieprawidłowe pola Google Sheets',
            validationErrors: fieldValidation.errors.map((error, index) => ({
              field: fieldValidation.unmappedColumns[index] || 'unknown',
              message: error,
              value: ''
            }))
          };
          
          res.status(400).json(apiResponse);
          return;
        }
        
        logger.info(`✅ Wszystkie pola Google Sheets są kompatybilne z konfiguracją dynamiczną`);
        logger.info(`🗺️ Mapowanie pól:`, fieldValidation.mappedFields);
      }

      // Process and validate wines
      let imported = 0;
      const errors: Array<{ row: Record<string, unknown>; error: string }> = [];

      // 🔄 DYNAMICZNA KONFIGURACJA PÓL - Wczytaj pola z konfiguracji
      const fs = require('fs');
      const path = require('path');
      const fieldsConfigPath = path.join(process.cwd(), 'data', 'fields-config.json');
      const fieldsConfig = JSON.parse(fs.readFileSync(fieldsConfigPath, 'utf8'));
      const dynamicFields = fieldsConfig.map((field: any) => field.key);
      
      logger.info(`🔄 Używam dynamicznej konfiguracji pól: ${dynamicFields.join(', ')}`);

      for (const row of results) {
        try {
          // 🚀 TWORZENIE OBIEKTU WINA BAZUJĄC NA DYNAMICZNEJ KONFIGURACJI
          const wineData: Partial<Wine> = {
            id: (row.id as string) || generateId('wine'),
            createdAt: (row.createdAt as string) || new Date().toISOString(),
            updatedAt: (row.updatedAt as string) || new Date().toISOString(),
          };

          // Dodaj wszystkie pola z dynamicznej konfiguracji
          dynamicFields.forEach((fieldKey: string) => {
            let csvValue = '';
            
            // Specjalne mapowania dla różnych nazw kolumn w CSV vs konfiguracji
            if (fieldKey === 'catalogNumber') {
              csvValue = (row.catalogNumber as string) || (row.nr_kat as string) || '';
            } else if (fieldKey === 'szczepy') {
              // Szczepy mogą być w CSV jako 'variety', 'szczepy', 'grape', etc.
              csvValue = (row.szczepy as string) || (row.variety as string) || (row.grape as string) || '';
            } else if (fieldKey === 'poj') {
              // Pojemność może być jako 'poj', 'vol', 'volume', 'pojemnosc'
              csvValue = (row.poj as string) || (row.vol as string) || (row.volume as string) || (row.pojemnosc as string) || '';
            } else {
              // Dla pozostałych pól - użyj wartości z CSV
              csvValue = (row[fieldKey] as string) || '';
            }
            
            (wineData as any)[fieldKey] = csvValue;
          });

          // 🔍 LOGOWANIE MAPOWANIA PÓL DLA DEBUGOWANIA
          if (imported < 3) { // Loguj pierwsze 3 wina
            logger.info(`🔄 Mapowanie pól dla wina ${imported + 1}:`);
            dynamicFields.forEach((fieldKey: string) => {
              const csvValue = row[fieldKey];
              const mappedValue = (wineData as any)[fieldKey];
              if (csvValue) {
                logger.info(`   ${fieldKey}: "${csvValue}" -> "${mappedValue}"`);
              }
            });
          }

          // Basic validation
          if (!wineData.name || wineData.name.length < 1) {
            throw new Error('Wine name is required');
          }

          // Use createWine to ensure catalogNumber uniqueness validation
          const { id, createdAt, updatedAt, ...wineDataForCreate } = wineData;
          const createdWine = await this.dataStore.createWine(wineDataForCreate as Omit<Wine, 'id' | 'createdAt' | 'updatedAt'>);
          imported++;
        } catch (err) {
          errors.push({
            row,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }

      const importResult: ImportResult = {
        imported,
        errors,
      };

      const apiResponse: ApiResponse<ImportResult> = {
        success: true,
        data: importResult,
      };

      logger.info(`Import completed: ${imported} wines imported, ${errors.length} errors`);
      
      // 🔄 AUTOMATYCZNE SPRAWDZENIE SYNCHRONIZACJI PO IMPORCIE
      logger.info('🔍 Weryfikacja synchronizacji pól po imporcie...');
      const isFieldsSyncAfter = await this.checkFieldsSynchronization();
      
      if (!isFieldsSyncAfter) {
        logger.warn('⚠️  Wykryto problemy z synchronizacją pól po imporcie!');
        // Dodaj ostrzeżenie do odpowiedzi, ale nie blokuj
        importResult.warnings = importResult.warnings || [];
        importResult.warnings.push('Wykryto niezgodność pól dynamicznych po imporcie. Sprawdź konfigurację.');
      }

      res.json(apiResponse);
    } catch (error) {
      next(error);
    }
  };

  importFromCSV = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { csvData, clearBefore = false, validateFields = true } = req.body;

      if (!csvData || typeof csvData !== 'string') {
        const response: ApiResponse = {
          success: false,
          error: 'CSV data is required',
        };
        res.status(400).json(response);
        return;
      }

      // Clear existing wines if requested
      if (clearBefore) {
        await this.dataStore.clearAllWines();
        logger.info('Cleared all existing wines before import');
      }

      // Parse CSV data
      const lines = csvData.trim().split('\n');
      if (lines.length < 2) {
        const response: ApiResponse = {
          success: false,
          error: 'CSV must contain at least a header row and one data row',
        };
        res.status(400).json(response);
        return;
      }

      // Better CSV parsing for quoted values
      const parseCSVLine = (line: string): string[] => {
        const result: string[] = [];
        let current = '';
        let inQuotes = false;
        
        for (let i = 0; i < line.length; i++) {
          const char = line[i];
          
          if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
              // Escaped quote
              current += '"';
              i++; // Skip next quote
            } else {
              // Toggle quote state
              inQuotes = !inQuotes;
            }
          } else if (char === ',' && !inQuotes) {
            // Field separator outside quotes
            result.push(current.trim());
            current = '';
          } else {
            current += char;
          }
        }
        
        result.push(current.trim());
        return result;
      };

      const headers = parseCSVLine(lines[0] || '');
      
      // 🔍 WALIDACJA PÓL PRZED IMPORTEM
      logger.info(`🔍 Sprawdzanie kompatybilności pól CSV z konfiguracją dynamiczną...`);
      logger.info(`📋 Znalezione kolumny CSV: ${headers.join(', ')}`);
      
      const fieldValidation = this.validateImportFields(headers);
      
      if (!fieldValidation.valid) {
        logger.error('❌ Błędy walidacji pól CSV:');
        fieldValidation.errors.forEach(error => logger.error(`   - ${error}`));
        
        const response: ApiResponse = {
          success: false,
          error: 'Nieprawidłowe pola CSV',
          validationErrors: fieldValidation.errors.map((error, index) => ({
            field: fieldValidation.unmappedColumns[index] || 'unknown',
            message: error,
            value: ''
          }))
        };
        
        res.status(400).json(response);
        return;
      }
      
      logger.info(`✅ Wszystkie pola CSV są kompatybilne z konfiguracją dynamiczną`);
      logger.info(`🗺️ Mapowanie pól:`, fieldValidation.mappedFields);
      
      const rows: Record<string, unknown>[] = [];

      // Parse CSV rows
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i] || '');
        const row: Record<string, unknown> = {};
        
        headers.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        
        if (Object.values(row).some(v => v !== '')) {
          rows.push(row);
        }
      }

      // Get field configuration for validation
      let fieldsConfig: any[] = [];
      if (validateFields) {
        fieldsConfig = this.dataStore.getFieldsConfig();
      }

      // Process and validate wines
      let imported = 0;
      const errors: Array<{ row: Record<string, unknown>; error: string }> = [];

        for (const row of rows) {
        try {
          logger.info(`🔄 Przetwarzanie wiersza CSV: ${JSON.stringify(row)}`);
          
          const wineData: Partial<Wine> = {
            id: (row.id as string) || generateId('wine'),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          // 🚀 DYNAMICZNE MAPOWANIE PÓL UŻYWAJĄC TEJ SAMEJ LOGIKI CO GOOGLE SHEETS
          fieldsConfig.forEach((field: any) => {
            let csvValue = '';
            
            // Specjalne mapowania dla różnych nazw kolumn w CSV vs konfiguracji
            if (field.key === 'catalogNumber') {
              csvValue = (row.catalogNumber as string) || (row.nr_kat as string) || '';
            } else if (field.key === 'szczepy') {
              // Szczepy mogą być w CSV jako 'variety', 'szczepy', 'grape', etc.
              csvValue = (row.szczepy as string) || (row.variety as string) || (row.grape as string) || '';
            } else if (field.key === 'poj') {
              // Pojemność może być jako 'poj', 'vol', 'volume', 'pojemnosc'
              csvValue = (row.poj as string) || (row.vol as string) || (row.volume as string) || (row.pojemnosc as string) || '';
            } else {
              // Dla pozostałych pól - użyj wartości z CSV
              csvValue = (row[field.key] as string) || '';
            }
            
            (wineData as any)[field.key] = csvValue;
            
            if (csvValue) {
              logger.info(`   ${field.key}: "${csvValue}"`);
            }
          });

          logger.info(`🎯 Wino do utworzenia: ${JSON.stringify(wineData, null, 2)}`);

          // Basic validation - check if name field exists after mapping
          if (!wineData.name || wineData.name.length < 1) {
            throw new Error('Wine name is required');
          }          // Field validation if enabled
          if (validateFields) {
            for (const field of fieldsConfig) {
              const value = (wineData as any)[field.key];
              
              const selectOptions = field.options || field.validation?.options;
              console.log(`Validating field ${field.key} (${field.label}): value="${value}", required=${field.required}, options=${JSON.stringify(selectOptions)}`);
              
              if (field.required && (!value || value === '')) {
                throw new Error(`Field '${field.label}' is required`);
              }

              if (field.validation?.min && typeof value === 'string' && value.length < field.validation.min) {
                throw new Error(`Field '${field.label}' must be at least ${field.validation.min} characters`);
              }

              if (field.validation?.max && typeof value === 'string' && value.length > field.validation.max) {
                throw new Error(`Field '${field.label}' must be at most ${field.validation.max} characters`);
              }
              if (selectOptions && selectOptions.length > 0 && value) {
                // Case-insensitive validation for select options
                const normalizedValue = typeof value === 'string' ? value.trim() : value;
                const normalizedOptions = selectOptions.map((opt: string) => opt.toLowerCase());
                const valueToCheck = typeof normalizedValue === 'string' ? normalizedValue.toLowerCase() : normalizedValue;
                
                console.log(`Option validation: value="${normalizedValue}" -> "${valueToCheck}", options=[${normalizedOptions.join(', ')}]`);
                
                if (!normalizedOptions.includes(valueToCheck)) {
                  throw new Error(`Field '${field.label}' must be one of: ${selectOptions.join(', ')}`);
                }
                
                // Update the value to match the exact case from configuration
                if (typeof normalizedValue === 'string') {
                  const matchingOption = selectOptions.find((opt: string) => 
                    opt.toLowerCase() === normalizedValue.toLowerCase()
                  );
                  if (matchingOption) {
                    (wineData as any)[field.key] = matchingOption;
                    console.log(`Updated value from "${normalizedValue}" to "${matchingOption}"`);
                  }
                }
              }
            }
          }

          await this.dataStore.addWine(wineData as Wine);
          imported++;
        } catch (err) {
          errors.push({
            row,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      }

      const importResult: ImportResult = {
        imported,
        errors,
      };

      const apiResponse: ApiResponse<ImportResult> = {
        success: true,
        data: importResult,
      };

      logger.info(`CSV Import completed: ${imported} wines imported, ${errors.length} errors`);
      res.json(apiResponse);
    } catch (error) {
      next(error);
    }
  };
}