import { createContext, useContext, useState, useEffect } from 'react';

export const darkModeContext = createContext();

export const DarkModeProvider = (props) => {
  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    const isDark = !darkMode;
    setDarkMode(isDark);
    localStorage.setItem('dark', isDark);
    handleElement(isDark);
  };

  const handleElement = (isDark) => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  };

  useEffect(() => {
    const localDark = JSON.parse(localStorage.getItem('dark'));
    setDarkMode(localDark);
    handleElement(localDark);
  }, []);

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
