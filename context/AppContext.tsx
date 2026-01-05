import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import {
    LoginCredentials,
    SignupCredentials,
    User,
    NotificationType
} from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import * as api from '../services/api';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';


interface AppContextType {
    // Auth
    isAuthenticated: boolean;
    currentUser: User | null;
    loading: boolean; 
    login: (credentials: LoginCredentials) => Promise<void>;
    loginWithGoogle: () => Promise<void>;
    signup: (credentials: SignupCredentials) => Promise<void>;
    logout: () => void;
    verifyEmail: (token: string) => Promise<void>;
    requestPasswordReset: (email: string) => Promise<void>;
    resetPassword: (token: string, newPassword: string) => Promise<void>;
    updateUserName: (name: string) => Promise<void>;


    // UI State
    theme: 'dark' | 'light';
    toggleTheme: () => void;

    notifications: Notification[];
    addNotification: (message: string, type?: NotificationType) => void;
    removeNotification: (id: number) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [userToken, setUserToken] = useLocalStorage<string | null>('authToken', null);
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [theme, setTheme] = useLocalStorage<'dark' | 'light'>('theme', 'dark');

    const isAuthenticated = !!userToken && !!currentUser;

    // Theme effect
    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    // Notifications
    const addNotification = useCallback((message: string, type: NotificationType = 'error') => {
        const newNotification = { id: Date.now(), message, type };
        setNotifications(prev => [...prev, newNotification]);
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== newNotification.id));
        }, 5000);
    }, []);

    const removeNotification = useCallback((id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const updateUserName = async (name: string) => {
        if (!currentUser) return;
        try {
            const updatedUser = await api.updateProfile({ name });
            setCurrentUser(updatedUser);
            addNotification("Username updated!", "success");
        } catch (error: any) {
            addNotification(error.message || "Failed to update username");
        }
    };

    const updateUserAvatar = async (avatar: string) => {
        if (!currentUser) return;
        setCurrentUser({ ...currentUser, avatar });
        try {
            await api.updateProfile({ avatar });
            addNotification("Avatar updated!", "success");
        } catch (e: any) {
            addNotification("Failed to save avatar", "error");
        }
    };


    // --- LOGOUT ---
    const logout = useCallback(() => {
        setUserToken(null);
        setCurrentUser(null);
        api.setAuthToken(null);
    }, [setUserToken]);

    useEffect(() => {
        const initAuth = async () => {
            setLoading(true);
            if (userToken) {
                api.setAuthToken(userToken);
                try {
                    const user = await api.getProfile();
                    setCurrentUser(user);
                } 
                catch (error) {
                    console.error("Profile check failed", error);
                    logout();
                }
            }
            setLoading(false);
        };

        initAuth();
    }, []); // Run once on mount


    // Auth Functions
    const login = async (credentials: LoginCredentials) => {
        try {
            const data = await api.login(credentials);
            setUserToken(data.token);
            setCurrentUser({
                _id: data._id,
                name: data.name,
                email: data.email,
                avatar: data.avatar,
                xp: data.xp,
                level: data.level,
                currentStreak: data.currentStreak,
                todos: data.todos || []
            });
            api.setAuthToken(data.token);
        } catch (error: any) {
            addNotification(error.message || 'Login failed.');
            throw error;
        }
    };

    const signup = async (credentials: SignupCredentials) => {
        try {
            await api.signup(credentials);
            addNotification('Sign up successful! Please check your email for the verification code.', 'success');
        } catch (error: any) {
            addNotification(error.message || 'Sign up failed.');
            throw error;
        }
    };

    const handleSocialLoginSuccess = async (data: any, providerName: string) => {
        setUserToken(data.token);
        setCurrentUser({
            _id: data._id,
            name: data.name,
            email: data.email,
            avatar: data.avatar,
            xp: data.xp,
            level: data.level,
            currentStreak: data.currentStreak
        });
        api.setAuthToken(data.token);
        addNotification(`Logged in with ${providerName}!`, 'success');
    };

    const loginWithGoogle = async () => {
        try {
            const provider = new GoogleAuthProvider();
            provider.setCustomParameters({
                prompt: 'select_account'
            });
            const result = await signInWithPopup(auth, provider);
            const idToken = await result.user.getIdToken();
            const data = await api.googleLogin(idToken);
            await handleSocialLoginSuccess(data, 'Google');
        }
        catch (error: any) {
            if (error.code === 'auth/popup-closed-by-user') return;
            addNotification(error.message || 'Google login failed.');
            throw error;
        }
    };

    const verifyEmail = async (token: string) => {
        try {
            const data = await api.verifyEmail(token);
            setUserToken(data.token);
            setCurrentUser({
                _id: data._id,
                name: data.name,
                email: data.email,
                avatar: data.avatar,
                xp: data.xp,
                level: data.level,
                currentStreak: data.currentStreak,
                todos: data.todos || []
            });
            api.setAuthToken(data.token);
            addNotification('Email verified successfully! Logging you in...', 'success');
        } 
        catch (error: any) {
            addNotification(error.message || 'Email verification failed.');
            throw error;
        }
    };

    const requestPasswordReset = async (email: string) => {
        try {
            await api.forgotPassword(email);
            addNotification('If an account exists, a reset email has been sent.', 'success');
        } catch (error: any) {
            addNotification(error.message || 'Failed to request password reset.');
            throw error;
        }
    };

    const resetPassword = async (token: string, newPassword: string) => {
        try {
            await api.resetPassword(token, newPassword);
            addNotification('Password reset successfully! Please log in.', 'success');
        } catch (error: any) {
            addNotification(error.message || 'Password reset failed.');
            throw error;
        }
    };

    const value = {
        isAuthenticated,
        currentUser,
        loading,
        login,
        loginWithGoogle,
        signup,
        logout,
        verifyEmail,
        requestPasswordReset,
        resetPassword,
        updateUserAvatar,
        updateUserName,
        notifications,
        addNotification,
        removeNotification,
        theme,
        toggleTheme,
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useAppContext must be used within an AppProvider');
    }
    return context;
};