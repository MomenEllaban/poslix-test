import { faBars } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import HeaderFeaturedNav from '@layout/AdminLayout/Header/HeaderFeaturedNav';
import HeaderProfileNav from '@layout/AdminLayout/Header/HeaderProfileNav';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Container, Dropdown } from 'react-bootstrap';
import { setCookie } from 'cookies-next';

import { GrLanguage } from 'react-icons/gr';

/*MOHAMMED MAHER */
import classNames from 'classnames';
import { useDarkMode } from '../../../context/DarkModeContext';
import { ELocalStorageKeys } from 'src/utils/local-storage';

type HeaderProps = {
  toggleSidebar: () => void;
  toggleSidebarMd: () => void;
};

export default function Header(props: HeaderProps) {
  const { toggleSidebar, toggleSidebarMd } = props;
  const [fullname, setFullname] = useState('');

  const { darkMode } = useDarkMode();

  const pathname = usePathname();

  const handleSetLangToCookie = (name: string) => {
    const KEY_LANG = 'lang';
    localStorage.setItem(ELocalStorageKeys.LANGUAGE,name)
    setCookie(KEY_LANG, name);
  };

  useEffect(() => {
    setFullname(localStorage.getItem('userfullname') || '');
  }, []);
  return (
    <header
      style={{ zIndex: 999 }}
      className={classNames('header bg-white shadow-sm position-sticky top-0 sticky-top2 p-2', {
        'dark-mode-body': darkMode,
        'light-mode-body': !darkMode,
      })}>
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
        <Link href="/" className="header-brand d-md-none">
          sidebar-brand-full
        </Link>
        <div className="header-nav d-none d-md-flex">
          <HeaderFeaturedNav />
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
        {/* <div className="ms-2">
          <DarkModeToggle />
        </div> */}
        <div className="header-nav ms-auto">
          <div>Hi {fullname}</div>
        </div>
        <div className="header-nav ms-2">
          <HeaderProfileNav />
        </div>
      </Container>
    </header>
  );
}
