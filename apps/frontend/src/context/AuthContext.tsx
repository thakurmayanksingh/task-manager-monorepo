import { createContext, useState, type ReactNode } from 'react';
import { api } from '../services/api';

// Define the shape of our User data
interface User {
    id: string;
    name: string;
    email: string;
    accessToken: string;
}

interface AuthContextType {
    user: User | null;
    login: (data: User) => void;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    // 1. Initialize state from localStorage so it survives refreshes!
    const [user, setUser] = useState<User | null>(() => {
        const savedUser = localStorage.getItem('task_manager_user');
        if (savedUser) {
            const parsedUser = JSON.parse(savedUser);
            // Re-attach the token to Axios immediately on page load
            api.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.accessToken}`;
            return parsedUser;
        }
        return null;
    });

    // 2. Save to localStorage on login
    const login = (userData: User) => {
        setUser(userData);
        localStorage.setItem('task_manager_user', JSON.stringify(userData));
        api.defaults.headers.common['Authorization'] = `Bearer ${userData.accessToken}`;
    };

    // 3. Clear from localStorage on logout
    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            setUser(null);
            localStorage.removeItem('task_manager_user'); // Wipe memory
            delete api.defaults.headers.common['Authorization'];
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};