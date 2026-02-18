/**
 * Users Settings Component
 * Zarządza użytkownikami systemu
 */

class UsersSettings {
    constructor() {
        this.api = new UsersAPI();
        this.users = [];
    }

    async load() {
        const response = await this.api.getSettings();
        this.users = response.data.users || [];
    }

    render() {
        return `
            <div class="settings-section">
                <div class="settings-header">
                    <h1><i class="bi bi-people"></i> Zarządzanie Użytkownikami</h1>
                    <p class="text-muted">Dodawaj, edytuj i usuwaj użytkowników</p>
                </div>

                <div class="settings-body">
                    <div class="ds-card">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--ds-space-4);">
                            <h3>Lista użytkowników</h3>
                            <button class="ds-btn ds-btn-primary" id="addUserBtn">
                                <i class="bi bi-plus-lg"></i> Dodaj użytkownika
                            </button>
                        </div>

                        ${this.users.length > 0 ? `
                            <table class="users-table">
                                <thead>
                                    <tr>
                                        <th>Login</th>
                                        <th>Email</th>
                                        <th>Rola</th>
                                        <th>Uprawnienia</th>
                                        <th>Aktywny</th>
                                        <th>Akcje</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${this.users.map(user => this.renderUserRow(user)).join('')}
                                </tbody>
                            </table>
                        ` : `
                            <div class="empty-state">
                                <i class="bi bi-person-x"></i>
                                <p>Brak użytkowników</p>
                            </div>
                        `}
                    </div>
                </div>
            </div>

            <!-- Modal: Add/Edit User -->
            <div id="userModal" class="modal" style="display:none;">
                <div class="modal-content">
                    <h2 id="modalTitle">Dodaj użytkownika</h2>
                    <form id="userForm">
                        <input type="hidden" id="userId">
                        <div class="form-group">
                            <label for="username">Login *</label>
                            <input type="text" id="username" class="ds-input" required>
                        </div>
                        <div class="form-group">
                            <label for="email">Email *</label>
                            <input type="email" id="email" class="ds-input" required>
                        </div>
                        <div class="form-group">
                            <label for="password">Hasło *</label>
                            <input type="password" id="password" class="ds-input">
                        </div>
                        <div class="form-group">
                            <label for="role">Rola</label>
                            <select id="role" class="ds-input">
                                <option value="viewer">Przeglądający</option>
                                <option value="editor">Edytor</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Uprawnienia</label>
                            <div class="toggle-group">
                                <label class="toggle-label">
                                    <input type="checkbox" id="permView">
                                    <span>Przeglądanie</span>
                                </label>
                            </div>
                            <div class="toggle-group">
                                <label class="toggle-label">
                                    <input type="checkbox" id="permEdit">
                                    <span>Edycja</span>
                                </label>
                            </div>
                            <div class="toggle-group">
                                <label class="toggle-label">
                                    <input type="checkbox" id="permDelete">
                                    <span>Usuwanie</span>
                                </label>
                            </div>
                            <div class="toggle-group">
                                <label class="toggle-label">
                                    <input type="checkbox" id="permManageUsers">
                                    <span>Zarządzanie użytkownikami</span>
                                </label>
                            </div>
                        </div>
                        <div class="toggle-group">
                            <label class="toggle-label">
                                <input type="checkbox" id="active" checked>
                                <span>Konto aktywne</span>
                            </label>
                        </div>
                        <div class="modal-actions">
                            <button type="submit" class="ds-btn ds-btn-primary">Zapisz</button>
                            <button type="button" class="ds-btn ds-btn-ghost" id="cancelModal">Anuluj</button>
                        </div>
                    </form>
                </div>
            </div>
        `;
    }

    renderUserRow(user) {
        const permissions = user.permissions || {};
        const permList = Object.entries(permissions)
            .filter(([, val]) => val)
            .map(([key]) => key)
            .join(', ') || 'brak';

        return `
            <tr>
                <td>${user.username}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td><small>${permList}</small></td>
                <td>${user.active ? '✅' : '❌'}</td>
                <td>
                    <button class="ds-btn ds-btn-sm ds-btn-ghost edit-user" data-id="${user.id}">
                        <i class="bi bi-pencil"></i>
                    </button>
                    <button class="ds-btn ds-btn-sm ds-btn-ghost delete-user" data-id="${user.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }

    async init() {
        document.getElementById('addUserBtn')?.addEventListener('click', () => this.showModal());
        document.getElementById('cancelModal')?.addEventListener('click', () => this.hideModal());
        document.getElementById('userForm')?.addEventListener('submit', (e) => this.saveUser(e));

        document.querySelectorAll('.edit-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.currentTarget.dataset.id;
                this.editUser(userId);
            });
        });

        document.querySelectorAll('.delete-user').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const userId = e.currentTarget.dataset.id;
                this.deleteUser(userId);
            });
        });
    }

    showModal(user = null) {
        const modal = document.getElementById('userModal');
        const title = document.getElementById('modalTitle');
        const form = document.getElementById('userForm');
        
        if (user) {
            title.textContent = 'Edytuj użytkownika';
            document.getElementById('userId').value = user.id;
            document.getElementById('username').value = user.username;
            document.getElementById('email').value = user.email;
            document.getElementById('password').value = '';
            document.getElementById('password').placeholder = 'Zostaw puste, aby nie zmieniać';
            document.getElementById('role').value = user.role;
            document.getElementById('permView').checked = user.permissions?.view || false;
            document.getElementById('permEdit').checked = user.permissions?.edit || false;
            document.getElementById('permDelete').checked = user.permissions?.delete || false;
            document.getElementById('permManageUsers').checked = user.permissions?.manageUsers || false;
            document.getElementById('active').checked = user.active;
        } else {
            title.textContent = 'Dodaj użytkownika';
            form.reset();
            document.getElementById('userId').value = '';
        }
        
        modal.style.display = 'flex';
    }

    hideModal() {
        document.getElementById('userModal').style.display = 'none';
    }

    editUser(userId) {
        const user = this.users.find(u => u.id === userId);
        if (user) this.showModal(user);
    }

    async saveUser(e) {
        e.preventDefault();
        
        const userId = document.getElementById('userId').value;
        const userData = {
            username: document.getElementById('username').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value,
            role: document.getElementById('role').value,
            permissions: {
                view: document.getElementById('permView').checked,
                edit: document.getElementById('permEdit').checked,
                delete: document.getElementById('permDelete').checked,
                manageUsers: document.getElementById('permManageUsers').checked
            },
            active: document.getElementById('active').checked
        };

        try {
            if (userId) {
                await this.api.updateUser(userId, userData);
            } else {
                await this.api.addUser(userData);
            }
            alert('✅ Użytkownik zapisany');
            this.hideModal();
            await window.settingsApp.loadSection('users');
        } catch (error) {
            alert('❌ Błąd: ' + error.message);
        }
    }

    async deleteUser(userId) {
        if (confirm('Czy na pewno chcesz usunąć tego użytkownika?')) {
            try {
                await this.api.deleteUser(userId);
                alert('✅ Użytkownik usunięty');
                await window.settingsApp.loadSection('users');
            } catch (error) {
                alert('❌ Błąd: ' + error.message);
            }
        }
    }
}
