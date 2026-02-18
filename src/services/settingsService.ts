import fs from 'fs/promises';
import path from 'path';
import logger from '../utils/logger';
import { 
  AppearanceSettings, 
  SecuritySettings, 
  UserSettings, 
  SystemSettings 
} from '../types/settings';

const SETTINGS_DIR = path.join(__dirname, '../../data/settings');

export class SettingsService {
  
  // ==================== APPEARANCE SETTINGS ====================
  
  async getAppearanceSettings(): Promise<AppearanceSettings> {
    return this.loadSettings<AppearanceSettings>('appearance.json', this.getDefaultAppearance());
  }

  async updateAppearanceSettings(settings: Partial<AppearanceSettings>): Promise<AppearanceSettings> {
    const current = await this.getAppearanceSettings();
    const updated = { ...current, ...settings, updatedAt: new Date().toISOString() };
    await this.saveSettings('appearance.json', updated);
    return updated;
  }

  async resetAppearanceSettings(): Promise<AppearanceSettings> {
    const defaults = this.getDefaultAppearance();
    await this.saveSettings('appearance.json', defaults);
    return defaults;
  }

  private getDefaultAppearance(): AppearanceSettings {
    return {
      theme: 'wine',
      primaryColor: '#10b981',
      accentColor: '#3b82f6',
      heroGradientStart: '#10b981',
      heroGradientEnd: '#059669',
      borderRadius: '8px',
      shadowIntensity: 'medium',
      spacing: 'normal',
      fontSize: 'medium',
      customCSS: '',
      appName: 'Katalog Win',
      appLogoUrl: null,
      appIcon: 'bi-wine'
    };
  }

  // ==================== SECURITY SETTINGS ====================
  
  async getSecuritySettings(): Promise<SecuritySettings> {
    return this.loadSettings<SecuritySettings>('security.json', this.getDefaultSecurity());
  }

  async updateSecuritySettings(settings: Partial<SecuritySettings>): Promise<SecuritySettings> {
    const current = await this.getSecuritySettings();
    const updated = { ...current, ...settings, updatedAt: new Date().toISOString() };
    await this.saveSettings('security.json', updated);
    return updated;
  }

  async resetSecuritySettings(): Promise<SecuritySettings> {
    const defaults = this.getDefaultSecurity();
    await this.saveSettings('security.json', defaults);
    return defaults;
  }

  private getDefaultSecurity(): SecuritySettings {
    return {
      sessionTimeout: 30,
      requireStrongPassword: true,
      twoFactorEnabled: false,
      passwordMinLength: 8,
      passwordRequireUppercase: true,
      passwordRequireLowercase: true,
      passwordRequireNumbers: true,
      passwordRequireSpecialChars: false,
      maxLoginAttempts: 5,
      lockoutDuration: 15,
      allowedIPs: []
    };
  }

  // ==================== USER SETTINGS ====================
  
  async getUserSettings(): Promise<UserSettings[]> {
    return this.loadSettings<UserSettings[]>('users.json', this.getDefaultUsers());
  }

  async updateUserSettings(users: UserSettings[]): Promise<UserSettings[]> {
    await this.saveSettings('users.json', users);
    return users;
  }

  async addUser(user: UserSettings): Promise<UserSettings[]> {
    const users = await this.getUserSettings();
    users.push(user);
    await this.saveSettings('users.json', users);
    return users;
  }

  async removeUser(userId: string): Promise<UserSettings[]> {
    const users = await this.getUserSettings();
    const filtered = users.filter(u => u.id !== userId);
    await this.saveSettings('users.json', filtered);
    return filtered;
  }

  async updateUser(userId: string, updates: Partial<UserSettings>): Promise<UserSettings[]> {
    const users = await this.getUserSettings();
    const index = users.findIndex(u => u.id === userId);
    
    if (index === -1) {
      throw new Error(`User with ID ${userId} not found`);
    }

    users[index] = { ...users[index], ...updates } as UserSettings;
    await this.saveSettings('users.json', users);
    return users;
  }

  private getDefaultUsers(): UserSettings[] {
    return [
      {
        id: 'admin-001',
        username: 'admin',
        email: 'admin@wineapp.local',
        role: 'admin',
        active: true,
        createdAt: new Date().toISOString(),
        permissions: {
          wines: { read: true, write: true, delete: true },
          collections: { read: true, write: true, delete: true },
          templates: { read: true, write: true, delete: true },
          settings: { read: true, write: true, delete: true }
        }
      }
    ];
  }

  // ==================== SYSTEM SETTINGS ====================
  
  async getSystemSettings(): Promise<SystemSettings> {
    return this.loadSettings<SystemSettings>('system.json', this.getDefaultSystem());
  }

  async updateSystemSettings(settings: Partial<SystemSettings>): Promise<SystemSettings> {
    const current = await this.getSystemSettings();
    const updated = { ...current, ...settings, updatedAt: new Date().toISOString() };
    await this.saveSettings('system.json', updated);
    return updated;
  }

  async resetSystemSettings(): Promise<SystemSettings> {
    const defaults = this.getDefaultSystem();
    await this.saveSettings('system.json', defaults);
    return defaults;
  }

  private getDefaultSystem(): SystemSettings {
    return {
      backupEnabled: true,
      backupSchedule: 'daily',
      backupRetentionDays: 30,
      backupLocation: './backups',
      maintenanceMode: false,
      debugMode: false,
      logLevel: 'info',
      maxFileSize: 10,
      allowedFileTypes: ['.json', '.csv', '.xlsx', '.png', '.jpg', '.svg'],
      apiRateLimit: 100,
      databaseOptimization: true,
      cacheEnabled: true,
      cacheTTL: 3600
    };
  }

  // ==================== HELPER METHODS ====================
  
  private async loadSettings<T>(filename: string, defaultValue: T): Promise<T> {
    try {
      const filepath = path.join(SETTINGS_DIR, filename);
      const data = await fs.readFile(filepath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
        await this.saveSettings(filename, defaultValue);
        return defaultValue;
      }
      logger.error(`Error loading settings from ${filename}:`, error);
      throw error;
    }
  }

  private async saveSettings<T>(filename: string, data: T): Promise<void> {
    try {
      await fs.mkdir(SETTINGS_DIR, { recursive: true });
      const filepath = path.join(SETTINGS_DIR, filename);
      await fs.writeFile(filepath, JSON.stringify(data, null, 2), 'utf-8');
      logger.info(`Settings saved to ${filename}`);
    } catch (error) {
      logger.error(`Error saving settings to ${filename}:`, error);
      throw error;
    }
  }
}
