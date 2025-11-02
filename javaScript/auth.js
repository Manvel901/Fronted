// Общие функции для управления авторизацией на всех страницах
class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        document.addEventListener('DOMContentLoaded', () => {
            this.updateNavigation();
            this.setupEventListeners();
        });
    }

    // Обновление навигации на всех страницах
    updateNavigation() {
        const token = localStorage.getItem('authToken');
        const currentUser = localStorage.getItem('currentUser');
        const registerNav = document.getElementById('registerNav');
        const authItem = document.getElementById('authItem');

        if (token && currentUser) {
            // Пользователь авторизован
            if (registerNav) registerNav.classList.add('hidden');
            
            const user = JSON.parse(currentUser);
            if (authItem) {
                authItem.innerHTML = `
                    <span id="userWelcome">Добро пожаловать, ${user.fullName}!</span>
                    <button onclick="authManager.logout()">Выйти</button>
                `;
            }
        } else {
            // Пользователь не авторизован
            if (registerNav) registerNav.classList.remove('hidden');
            if (authItem) {
                authItem.innerHTML = '<button onclick="authManager.authorize()">Авторизация</button>';
            }
        }
    }

    // Настройка обработчиков событий
    setupEventListeners() {
        // Слушаем изменения в localStorage для синхронизации между вкладками
        window.addEventListener('storage', (e) => {
            if (e.key === 'authToken' || e.key === 'currentUser') {
                this.updateNavigation();
            }
        });
    }

    // Функция авторизации
    async authorize() {
        const existingToken = localStorage.getItem('authToken');
        
        if (existingToken) {
            try {
                const response = await fetch('http://localhost:5236/User/Me', {
                    headers: {
                        'Authorization': `Bearer ${existingToken}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (response.ok) {
                    const user = await response.json();
                    localStorage.setItem('currentUser', JSON.stringify(user));
                    this.updateNavigation();
                    alert(`Добро пожаловать, ${user.fullName}!`);
                } else {
                    const token = prompt('Введите ваш токен:');
                    if (!token) return;
                    await this.validateToken(token);
                }
            } catch (err) {
                console.error('Ошибка авторизации:', err);
                const token = prompt('Введите ваш токен:');
                if (!token) return;
                await this.validateToken(token);
            }
        } else {
            const token = prompt('Введите ваш токен:');
            if (!token) return;
            await this.validateToken(token);
        }
    }

    // Валидация токена
    async validateToken(token) {
        try {
            const response = await fetch('http://localhost:5236/User/Me', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const user = await response.json();
                localStorage.setItem('authToken', token);
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.updateNavigation();
                alert(`Добро пожаловать, ${user.fullName}!`);
            } else {
                alert('Неверный токен!');
            }
        } catch (err) {
            console.error('Ошибка авторизации:', err);
            alert('Ошибка авторизации: ' + err.message);
        }
    }

    // Выход из системы
    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        this.updateNavigation();
        alert('Вы вышли из системы');
    }
}

// Создаем глобальный экземпляр менеджера авторизации
const authManager = new AuthManager();