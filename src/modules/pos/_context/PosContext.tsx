import { createContext, useContext, useState } from 'react';
import ar from 'ar.json';
import en from 'en.json';

interface IPosContextProps {
  lang: typeof en | typeof ar;
  setLang: React.Dispatch<React.SetStateAction<any>>;
  isRtl?: boolean;

  isOpenRegister?: boolean;
  setIsOpenRegister?: React.Dispatch<React.SetStateAction<boolean>>;

  isCloseRegister?: boolean;
  setIsCloseRegister?: React.Dispatch<React.SetStateAction<boolean>>;

  isLoading?: boolean;
  setIsLoading?: React.Dispatch<React.SetStateAction<boolean>>;

  cashHand: number;
  setCashHand: React.Dispatch<React.SetStateAction<number>>;
}

const PosContext = createContext<IPosContextProps | undefined>(undefined);

export function usePosContext() {
  const context = useContext(PosContext);

  if (!context) {
    throw new Error('usePosContext must be used within a PosProvider');
  }

  return context;
}

export function PosProvider({ children }) {
  const [lang, setLang] = useState(en);
  const [isOpenRegister, setIsOpenRegister] = useState(false);
  const [isCloseRegister, setIsCloseRegister] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cashHand, setCashHand] = useState(0);

  const value = {
    lang,
    setLang,

    isOpenRegister,
    setIsOpenRegister,
    isCloseRegister,
    setIsCloseRegister,

    isLoading,
    setIsLoading,

    cashHand,
    setCashHand,

    isRtl: lang == ar,
  };

  return <PosContext.Provider value={value}>{children}</PosContext.Provider>;
}
