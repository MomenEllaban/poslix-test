import ar from 'ar.json';
import en from 'en.json';
import styles from './digital.module.css';
import { findAllData } from 'src/services/crud.api';
import { Toastify } from 'src/libs/allToasts';
import { useEffect, useLayoutEffect, useState } from 'react';
import LanguageIcon from '@mui/icons-material/Language';
import LightModeIcon from '@mui/icons-material/LightMode';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import PersonIcon from '@mui/icons-material/Person';
import { useDigitalContext } from 'src/modules/digital/_context/DigitalContext';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';

export const DigitalNavbar = ({ shopId }) => {
  const [appearance, setAppearance] = useState<any>();
  const { lang, setLang } = useDigitalContext();
  const fetchApperance = async () => {
    try {
      const res = await findAllData(`appearance/${shopId}`);
      setAppearance(res.data.result);
    } catch (err) {
      Toastify('error', 'Something went wrong with getting Apperance, please try again later!');
    }
  };
  useEffect(() => {
    fetchApperance();
  }, []);

  useLayoutEffect(() => {
    const defaultLang = getLocalStorage(ELocalStorageKeys.LANGUAGE) || 'en';
    if (defaultLang === 'en') {
      setLang(en);
    } else {
      setLang(ar);
    }
  }, []);

  return (
    <div className={`${styles.navbar_wrapper} ${lang == ar ? styles.ar : ""}`}>
      {/* right part */}
      <div style={{ padding: '.5rem' }}>
        <img alt="" src={appearance?.en?.logo} className={styles.logo} />
      </div>
      {/* middle part */}
      <div className="d-none d-md-flex align-items-center">
        <LightModeIcon sx={{ cursor: 'pointer' }} />
        <span className="mx-2 d-flex align-items-center" 
        style={{ cursor: 'pointer' }}
        onClick={()=>{
          if (lang == en) {
            localStorage.setItem(ELocalStorageKeys.LANGUAGE, 'ar');
            setLang(ar);
          } else {
            localStorage.setItem(ELocalStorageKeys.LANGUAGE, 'en');
            setLang(en);
          }
        }}
        >
          {lang == ar ? 'EN' : 'العربية'}
          <LanguageIcon sx={{ marginX: '.5rem' }} />
        </span>
      </div>
      {/* left part */}
      <div>
        <PersonIcon sx={{ cursor: 'pointer' }} className="mx-4" />
        <SettingsOutlinedIcon sx={{ cursor: 'pointer' }} />
      </div>
    </div>
  );
};
