import { createContext, useContext, useState } from 'react';

export const darkModeContext = createContext();

export const DarkModeProvider = (props) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    localStorage.setItem('dark', isDark);
    const root = document.documentElement;
    root.classList.toggle('dark');
  };

  return (
    <darkModeContext.Provider value={{ toggleDarkMode, darkMode, setDarkMode }}>
      {props.children}
    </darkModeContext.Provider>
  );
};

export const useDarkMode = () => {
  const context = useContext(darkModeContext);
  if (context === undefined) {
    throw new Error('useDarkMode must be used within a DarkModeProvider');
  }
  return context;
};
