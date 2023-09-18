import { faBars, faLanguage } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import HeaderFeaturedNav from '@layout/AdminLayout/Header/HeaderFeaturedNav';
import HeaderProfileNav from '@layout/AdminLayout/Header/HeaderProfileNav';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button, Container, Dropdown } from 'react-bootstrap';
import { GiArabicDoor } from 'react-icons/gi';
import { RiEnglishInput } from 'react-icons/ri';

/*MOHAMMED MAHER */
import classNames from 'classnames';
import { useDarkMode } from '../../../context/DarkModeContext';
import DarkModeToggle from '../DarkModeToggle';

type HeaderProps = {
  toggleSidebar: () => void;
  toggleSidebarMd: () => void;
};

export default function Header(props: HeaderProps) {
  const { toggleSidebar, toggleSidebarMd } = props;
  const [fullname, setFullname] = useState('');

  const { toggleDarkMode, darkMode, setDarkMode } = useDarkMode();

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
const ToggleLanguage = () => (
  <>
    <Dropdown className="header-nav ms-auto">
      <Dropdown.Toggle variant="success" id="dropdown-basic">
        <FontAwesomeIcon icon={faLanguage} />
      </Dropdown.Toggle>

      <Dropdown.Menu>
        <Dropdown.Item className="d-flex align-items-center" /*href="/action-1"*/>
          <GiArabicDoor className="me-2" />
          Arabic
        </Dropdown.Item>

        <Dropdown.Item className="d-flex align-items-center" /*href="/action-2"*/>
          <RiEnglishInput className="me-2" />
          English
        </Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown>
    <div className="ms-2">
      {/* <FontAwesomeIcon icon={faMoon} /> */}
      <DarkModeToggle />
    </div>
  </>
);
