import React, { createContext, useContext, useState } from 'react';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(() => {
    return sessionStorage.getItem('adminAuth') === 'true';
  });

  const login = () => {
    setIsAdminAuthenticated(true);
    sessionStorage.setItem('adminAuth', 'true');
  };

  const logout = () => {
    setIsAdminAuthenticated(false);
    sessionStorage.removeItem('adminAuth');
  };

  return (
    <AdminAuthContext.Provider value={{ isAdminAuthenticated, login, logout }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export const useAdminAuth = () => useContext(AdminAuthContext);
