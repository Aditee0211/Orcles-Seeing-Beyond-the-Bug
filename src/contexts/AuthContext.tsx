import React, { createContext, useContext, useEffect, useState } from 'react';
import { authService, sessionManager, type User, type LoginResponse } from '../lib/appsScriptService';

interface AuthContextType {
  currentUser: { id: string; email: string; displayName: string } | null;
  userProfile: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<{ id: string; email: string; displayName: string } | null>(null);
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const login = async (email: string, password: string) => {
    try {
      const response = await authService.login(email, password);
      sessionManager.saveSession(response);
      setCurrentUser({
        id: response.userId,
        email: response.email,
        displayName: response.displayName
      });
      setUserProfile({
        id: response.userId,
        email: response.email,
        displayName: response.displayName,
        points: response.points,
        joinedAt: new Date().toISOString(),
        isAdmin: response.role === 'admin'
      });
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const register = async (email: string, password: string, displayName: string) => {
    try {
      const response = await authService.register(email, password, displayName);
      sessionManager.saveSession(response);
      setCurrentUser({
        id: response.userId,
        email: response.email,
        displayName: response.displayName
      });
      setUserProfile({
        id: response.userId,
        email: response.email,
        displayName: response.displayName,
        points: response.points,
        joinedAt: new Date().toISOString(),
        isAdmin: response.role === 'admin'
      });
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const session = sessionManager.getSession();
      if (session) {
        await authService.logout(session.sessionToken);
      }
      sessionManager.clearSession();
      setCurrentUser(null);
      setUserProfile(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Clear session even if logout fails
      sessionManager.clearSession();
      setCurrentUser(null);
      setUserProfile(null);
    }
  };

  useEffect(() => {
    const checkSession = async () => {
      try {
        const session = sessionManager.getSession();
        if (session && session.sessionToken) {
          // Verify session is still valid by getting user profile
          const profile = await authService.getUserProfile(session.sessionToken);
          setCurrentUser({
            id: session.userId,
            email: session.email,
            displayName: session.displayName
          });
          setUserProfile(profile.user);
        }
      } catch (error) {
        console.error('Session validation error:', error);
        sessionManager.clearSession();
      } finally {
        setLoading(false);
      }
    };

    checkSession();
  }, []);

  const value = {
    currentUser,
    userProfile,
    login,
    register,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};