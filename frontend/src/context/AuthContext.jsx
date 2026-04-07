import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const profile = localStorage.getItem('profile');
    if (profile) {
      setUser(JSON.parse(profile).user);
    }
  }, []);

  const login = (data) => {
    localStorage.setItem('profile', JSON.stringify(data));
    setUser(data.user);
  };

  const logout = () => {
    localStorage.removeItem('profile');
    setUser(null);
  };

  const updateUser = (updatedUser) => {
    const profile = JSON.parse(localStorage.getItem('profile'));
    const newData = { ...profile, user: updatedUser };
    localStorage.setItem('profile', JSON.stringify(newData));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
