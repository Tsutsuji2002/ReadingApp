import React, { createContext, useState } from 'react';
import colorScheme from '../themes/colorScheme';

export const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(colorScheme.light);

  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === colorScheme.light ? colorScheme.dark : colorScheme.light));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
