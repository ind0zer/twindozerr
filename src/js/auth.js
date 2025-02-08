import { API } from './api.js';

export const Auth = {
    currentUser: null,

    async login(username, password) {
        try {
            const user = await API.login(username, password);
            if (user) {
                this.currentUser = user;
                localStorage.setItem('user', JSON.stringify(user));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Login failed:', error);
            return false;
        }
    },

    async register(username, password, email) {
        try {
            const user = await API.register({ 
                username, 
                password, 
                email,
                avatarUrl: "https://placehold.jp/ffffff/ffffff/150x150.png"
            });
            this.currentUser = user;
            localStorage.setItem('user', JSON.stringify(user));
            return true;
        } catch (error) {
            throw error;
        }
    },

    logout() {
        this.currentUser = null;
        localStorage.removeItem('user');
        window.location.href = '/login';
    },


    isAuthenticated() {
        return !!this.currentUser;
    },

    getCurrentUser() {
        return this.currentUser;
    },

    async checkAuth() {
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
            try {
                const user = JSON.parse(savedUser);
                const freshUser = await API.getUser(user.id);
                if (freshUser) {
                    this.currentUser = freshUser;
                    localStorage.setItem('user', JSON.stringify(freshUser));
                    return true;
                }
            } catch (error) {
                console.error('Auth check error:', error);
                this.logout();
            }
        }
        return false;
    },
};