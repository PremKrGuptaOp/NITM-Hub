import React, { createContext, useContext, useState, useEffect } from 'react';
import { AuthState, User } from '../types';
import { mockUsers, currentUserId } from '../data/mockData';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  signup: (userData: Partial<User>) => Promise<boolean>;
  logout: () => void;
  verifyOTP: (otp: string) => Promise<boolean>;
  updateProfile: (updates: Partial<User>) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true
  });

  useEffect(() => {
    // Simulate checking for stored auth token
    const stored = localStorage.getItem('nitm-auth');
    if (stored) {
      const user = mockUsers.find(u => u.id === currentUserId);
      setAuthState({
        isAuthenticated: true,
        user: user || null,
        loading: false
      });
    } else {
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const user = mockUsers.find(u => u.email === email);
    if (user) {
      localStorage.setItem('nitm-auth', 'true');
      setAuthState({
        isAuthenticated: true,
        user,
        loading: false
      });
      return true;
    }
    
    setAuthState(prev => ({ ...prev, loading: false }));
    return false;
  };

  const signup = async (userData: Partial<User>): Promise<boolean> => {
    setAuthState(prev => ({ ...prev, loading: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock successful signup
    setAuthState(prev => ({ ...prev, loading: false }));
    return true;
  };

  const logout = () => {
    localStorage.removeItem('nitm-auth');
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false
    });
  };

  const verifyOTP = async (otp: string): Promise<boolean> => {
    // Mock OTP verification (accepts any 6-digit number)
    await new Promise(resolve => setTimeout(resolve, 1000));
    return otp.length === 6 && /^\d+$/.test(otp);
  };

  const updateProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!authState.user) return false;
    
    setAuthState(prev => ({
      ...prev,
      user: prev.user ? { ...prev.user, ...updates } : null
    }));
    
    return true;
  };

  return (
    <AuthContext.Provider value={{
      ...authState,
      login,
      signup,
      logout,
      verifyOTP,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};