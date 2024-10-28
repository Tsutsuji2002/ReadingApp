import React, { createContext, useContext } from 'react';
import { useResponsive } from '../hooks/useResponsive';

const ResponsiveContext = createContext({});

export const ResponsiveProvider = ({ children }) => {
  const responsive = useResponsive();
  
  return (
    <ResponsiveContext.Provider value={responsive}>
      {children}
    </ResponsiveContext.Provider>
  );
};

export const useResponsiveContext = () => useContext(ResponsiveContext);