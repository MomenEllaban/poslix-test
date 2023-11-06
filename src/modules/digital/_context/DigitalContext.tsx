import { createContext, useContext, useState } from 'react';
import ar from 'ar.json';
import en from 'en.json';

interface IDigitalContextProps {
  lang: typeof en | typeof ar;
  setLang: React.Dispatch<React.SetStateAction<any>>;
  isRtl?: boolean;

  isLoading?: boolean;
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;

}

const DigitalContext = createContext<IDigitalContextProps | undefined>(undefined);

export function useDigitalContext() {
  const context = useContext(DigitalContext);

  if (!context) {
    throw new Error('usDigitalContext must be used within a PosProvider');
  }

  return context;
}

export function DigitalProvider({ children }) {
  const [lang, setLang] = useState(en);
  const [isLoading, setIsLoading] = useState(false);

  const value = {
    lang,
    setLang,
    isLoading,
    setIsLoading,
    isRtl: lang == ar,
  };

  return <DigitalContext.Provider value={value}>{children}</DigitalContext.Provider>;
}
