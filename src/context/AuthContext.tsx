import React, { createContext, useState, useContext, useEffect } from 'react';

type AuthContextType = {
  isLoggedIn: boolean;
  login: () => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('evertale_isLoggedIn');
    if (stored === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem('evertale_isLoggedIn', 'true');
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('evertale_isLoggedIn', 'false');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
