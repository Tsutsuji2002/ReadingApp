import React, { createContext, useState, useContext, useEffect } from 'react';
import { auth } from '../../firebaseConfig';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState('');
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [headerKey, setHeaderKey] = useState(0);
  const [user, setUser] = useState(null);

  const forceHeaderUpdate = () => {
    setHeaderKey(prev => prev + 1);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(firebaseUser => {
      if (firebaseUser) {
        setIsLoggedIn(true);
        setUsername(firebaseUser.displayName || firebaseUser.email.split('@')[0]);
        setUser(firebaseUser);
      } else {
        setIsLoggedIn(false);
        setUsername('');
        setUserRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ 
      user,
      isLoggedIn, 
      username, 
      loading, 
      headerKey,
      userRole,
      setUserRole,
      forceHeaderUpdate 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);