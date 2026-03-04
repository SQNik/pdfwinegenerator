// Settings Module Types

export interface AppearanceSettings {
  theme: 'light' | 'dark' | 'wine' | 'custom';
  primaryColor: string;
  accentColor: string;
  heroGradientStart: string;
  heroGradientEnd: string;
  borderRadius: string;
  shadowIntensity: string;
  spacing: string;
  fontSize: string;
  customCSS?: string;
  appName: string;
  appLogoUrl?: string | null;
  appIcon: string;
}

export interface SecuritySettings {
  sessionTimeout: number; // minutes
  requireStrongPassword: boolean;
  twoFactorEnabled: boolean;
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireLowercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSpecialChars: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  allowedIPs?: string[];
}

export interface UserSettings {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  active: boolean;
  createdAt: string;
  lastLogin?: string;
  permissions: {
    wines: { read: boolean; write: boolean; delete: boolean };
    collections: { read: boolean; write: boolean; delete: boolean };
    templates: { read: boolean; write: boolean; delete: boolean };
    settings: { read: boolean; write: boolean; delete: boolean };
  };
}

export interface SystemSettings {
  backupEnabled: boolean;
  backupSchedule: 'daily' | 'weekly' | 'monthly';
  backupRetentionDays: number;
  backupLocation: string;
  maintenanceMode: boolean;
  debugMode: boolean;
  logLevel: 'error' | 'warn' | 'info' | 'debug';
  maxFileSize: number; // MB
  allowedFileTypes: string[];
  apiRateLimit: number; // requests per minute
  databaseOptimization: boolean;
  cacheEnabled: boolean;
  cacheTTL: number; // seconds
}

export interface SettingsModuleData {
  appearance: AppearanceSettings;
  security: SecuritySettings;
  users: UserSettings[];
  system: SystemSettings;
}
