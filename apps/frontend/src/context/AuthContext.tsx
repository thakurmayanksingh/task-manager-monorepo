import { createContext, useState, type ReactNode } from 'react';
import { api } from '../services/api';

// Define the shape of our User data
interface User {
    id: string;
    name: string;
    email: string;
    accessToken: string;
}

// Define the shape of the Context
interface AuthContextType {
    user: User | null;
    login: (data: User) => void;
    logout: () => Promise<void>;
    isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);

    // Call this when the user successfully logs in or signs up
    const login = (userData: User) => {
        setUser(userData);
        // Attach the short-lived access token to all future Axios requests
        api.defaults.headers.common['Authorization'] = `Bearer ${userData.accessToken}`;
    };

    // Call this to clear state and tell the backend to delete the secure cookie
    const logout = async () => {
        try {
            await api.post('/auth/logout');
        } catch (error) {
            console.error('Logout failed', error);
        } finally {
            setUser(null);
            delete api.defaults.headers.common['Authorization'];
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};