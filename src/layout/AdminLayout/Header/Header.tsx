import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import HeaderFeaturedNav from '@layout/AdminLayout/Header/HeaderFeaturedNav';
import HeaderProfileNav from '@layout/AdminLayout/Header/HeaderProfileNav';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState, useLayoutEffect } from 'react';
import { Button, Container, Dropdown } from 'react-bootstrap';
import { setCookie, getCookie } from 'cookies-next';

import { GrLanguage } from 'react-icons/gr';

/*MOHAMMED MAHER */
import classNames from 'classnames';
// import { useDarkMode } from '../../../context/DarkModeContext';
import { ELocalStorageKeys } from 'src/utils/local-storage';
import DarkModeToggle from '../DarkModeToggle';

import { useTranslation } from 'next-i18next';


type HeaderProps = {
  toggleSidebar: () => void;
  toggleSidebarMd: () => void;
};

export default function Header(props: HeaderProps) {
  const { toggleSidebar, toggleSidebarMd } = props;
  const [fullname, setFullname] = useState('');

  const pathname = usePathname();

  const { t } = useTranslation();


  const KEY_LANG = 'lang';
  const handleSetLangToCookie = (lang: string) => {
    localStorage.setItem(ELocalStorageKeys.LANGUAGE, lang);
    setCookie(KEY_LANG, lang);
    handleSetAttr(lang);
  };

  const handleSetAttr = (lang: string | boolean) => {
    const htmlElement = document.getElementsByTagName('html')[0];
    const isDir = lang === 'ar' ? 'rtl' : 'ltr';
    htmlElement.setAttribute('dir', isDir);
  };

  useEffect(() => {
    setFullname(localStorage.getItem('userfullname') || '');
  }, []);

  useLayoutEffect(() => {
    const lang = getCookie(KEY_LANG) ?? 'en';
    handleSetAttr(lang);
  }, []);

  return (
    <header
      style={{ zIndex: 999 }}
      className={classNames('header bg-white shadow-sm position-sticky top-0 sticky-top2 p-2')}>
      <Container fluid className="header-navbar d-flex align-items-center">
        <Button
          variant="link"
          className="header-toggler d-md-none px-md-0 me-md-3 rounded-0 shadow-none"
          type="button"
          onClick={toggleSidebar}>
          <FontAwesomeIcon icon={faBars} />
        </Button>
        <Button
          variant="link"
          className="header-toggler d-none d-md-inline-block px-md-0 me-md-3 rounded-0 shadow-none"
          type="button"
          onClick={toggleSidebarMd}>
          <FontAwesomeIcon icon={faBars} />
        </Button>
       
        <div className="header-nav d-none d-md-flex">
          <HeaderFeaturedNav />
        </div>
        <div className="dark-mode">
          <DarkModeToggle />
        </div>
        <Dropdown className="header-nav ms-auto">
          <Dropdown.Toggle
            variant="success"
            className="d-flex justify-content-center align-items-center header-language"
            id="dropdown-basic">
            <GrLanguage size={19} color="#4f5d73" />
          </Dropdown.Toggle>

          <Dropdown.Menu>
            <div className="d-flex flex-column">
              <Dropdown.ItemText>
                <Link
                  href={`/ar${pathname}`}
                  onClick={() => handleSetLangToCookie('ar')}
                  role="button"
                  tabIndex={0}
                  locale="ar"
                  className="link-language">
                  Arabic
                </Link>
              </Dropdown.ItemText>
              <Dropdown.ItemText>
                <Link
                  href={`/en${pathname}`}
                  onClick={() => handleSetLangToCookie('en')}
                  role="button"
                  tabIndex={0}
                  locale="en"
                  className="link-language">
                  English
                </Link>
              </Dropdown.ItemText>
            </div>
          </Dropdown.Menu>
        </Dropdown>
        <div className="header-nav ms-auto">
          <h4 className='header__user-name'>{t("g.Hi")} {fullname}</h4>
        </div>
        <div className="header-nav ms-2">
          <HeaderProfileNav />
        </div>
      </Container>
    </header>
  );
}
