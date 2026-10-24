import React, { createContext, useState, useContext, useEffect } from 'react';

type AuthContextType = {
  isLoggedIn: boolean;
  isAuthor: boolean;
  username: string;
  bio: string;
  login: () => void;
  logout: () => void;
  updateProfile: (username: string, bio: string) => void;
  registerAsAuthor: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAuthor, setIsAuthor] = useState(false);
  const [username, setUsername] = useState('Pembaca');
  const [bio, setBio] = useState('');

  useEffect(() => {
    if (localStorage.getItem('evertale_isLoggedIn') === 'true') setIsLoggedIn(true);
    if (localStorage.getItem('evertale_isAuthor') === 'true') setIsAuthor(true);
    const storedName = localStorage.getItem('evertale_username');
    if (storedName) setUsername(storedName);
    const storedBio = localStorage.getItem('evertale_bio');
    if (storedBio) setBio(storedBio);
  }, []);

  const login = () => {
    setIsLoggedIn(true);
    localStorage.setItem('evertale_isLoggedIn', 'true');
  };

  const logout = () => {
    setIsLoggedIn(false);
    localStorage.setItem('evertale_isLoggedIn', 'false');
  };

  const updateProfile = (newUsername: string, newBio: string) => {
    setUsername(newUsername);
    setBio(newBio);
    localStorage.setItem('evertale_username', newUsername);
    localStorage.setItem('evertale_bio', newBio);
  };

  const registerAsAuthor = () => {
    setIsAuthor(true);
    localStorage.setItem('evertale_isAuthor', 'true');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isAuthor, username, bio, login, logout, updateProfile, registerAsAuthor }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
