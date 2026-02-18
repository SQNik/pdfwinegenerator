/**
 * Settings API Client
 * Obsługuje komunikację z backend API dla modułu Settings
 */

class SettingsAPI {
    constructor(section) {
        this.baseUrl = `/api/settings/${section}`;
    }

    async getSettings() {
        try {
            const response = await fetch(this.baseUrl);
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to load settings');
            }
            
            return data;
        } catch (error) {
            console.error(`Error loading ${this.baseUrl}:`, error);
            throw error;
        }
    }

    async updateSettings(settings) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to update settings');
            }
            
            return data;
        } catch (error) {
            console.error(`Error updating ${this.baseUrl}:`, error);
            throw error;
        }
    }

    async reset() {
        try {
            const response = await fetch(`${this.baseUrl}/reset`, {
                method: 'POST'
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to reset settings');
            }
            
            return data;
        } catch (error) {
            console.error(`Error resetting ${this.baseUrl}:`, error);
            throw error;
        }
    }

    async uploadLogo(formData) {
        try {
            const response = await fetch(`${this.baseUrl}/upload-logo`, {
                method: 'POST',
                body: formData
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to upload logo');
            }
            
            return data;
        } catch (error) {
            console.error('Error uploading logo:', error);
            throw error;
        }
    }

    async deleteLogo() {
        try {
            const response = await fetch(`${this.baseUrl}/logo`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to delete logo');
            }
            
            return data;
        } catch (error) {
            console.error('Error deleting logo:', error);
            throw error;
        }
    }
}

// Users API - rozszerzona funkcjonalność
class UsersAPI extends SettingsAPI {
    constructor() {
        super('users');
    }

    async addUser(user) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(user)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to add user');
            }
            
            return data;
        } catch (error) {
            console.error('Error adding user:', error);
            throw error;
        }
    }

    async updateUser(userId, updates) {
        try {
            const response = await fetch(`${this.baseUrl}/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updates)
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to update user');
            }
            
            return data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }

    async deleteUser(userId) {
        try {
            const response = await fetch(`${this.baseUrl}/${userId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (!data.success) {
                throw new Error(data.message || 'Failed to delete user');
            }
            
            return data;
        } catch (error) {
            console.error('Error deleting user:', error);
            throw error;
        }
    }
}
