import ar from 'ar.json';
import en from 'en.json';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import Router, { useRouter } from 'next/router';
import { useLayoutEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from 'src/hooks';
import { usePosContext } from 'src/modules/pos/_context/PosContext';
import { selectPos, setPosRegister } from 'src/redux/slices/pos.slice';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';
import CloseRegister from '../modals/CloseRegister';
import styles from './NavMenu.module.scss';
// import classNames from 'classnames';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCoffee, faCompress, faExpand } from '@fortawesome/free-solid-svg-icons';

const NavMenu: any = ({ shopId }: any) => {
  const [isFullScreen, setIsFullScreen] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();

  const pos = useAppSelector(selectPos);
  const { lang, setLang } = usePosContext();

  const [customerIsModal, setCustomerIsModal] = useState<boolean>(false);

  const customerModalHandler = (status: any) => {
    setCustomerIsModal(false);
  };

  const handleLogout = () => {
    signOut({ redirect: false }).then(() => {
      router.push('/'); // Redirect to the home page after signing out
    });
  };

  const handleSwitchRegister = () => {
    // if open ==> close ... if close ==> open
    if (pos.register.status === 'open') {
      setCustomerIsModal(true);
    } else {
      dispatch(
        setPosRegister({
          state: null,
          hand_cash: 0,
        })
      );
      const _posRegisterState = JSON.stringify({ status: 'close', hand_cash: 0 });
      // localStorage.setItem(ELocalStorageKeys.POS_REGISTER_STATE, _posRegisterState);
    }
  };

  useLayoutEffect(() => {
    const defaultLang = getLocalStorage(ELocalStorageKeys.LANGUAGE) || 'en';

    if (defaultLang === 'en') {
      setLang(en);
    } else {
      setLang(ar);
    }
  }, []);

  const toggleFullScreen = () => {
    console.log('ssss');

    if (!isFullScreen) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullScreen(!isFullScreen);
  };
  // ------------------------------------------------------------------------------------------------
  // const handleSetLangToCookie = (name: string) => {
  //   const KEY_LANG = 'lang';
  //   localStorage.setItem(ELocalStorageKeys.LANGUAGE,name)
  //   setCookie(KEY_LANG, name);
  //   if (name == 'en') {

  //     setLang(en);
  //   } else {
  //     setLang(ar);
  //   }
  // };
  // ------------------------------------------------------------------------------------------------
  return (
    <>
      <CloseRegister
        statusDialog={customerIsModal}
        openDialog={customerModalHandler}
        shopId={shopId}
      />
      <div className={styles.navbar__container}>
        <div className="logo-box">
          <img src="/images/poslix-sm.png" alt="" height={30} width={30} />
        </div>

        <div id="scrollbar">
          <Link className="nav-link menu-link" href={'/shop/' + shopId}>
            <i className="ri-dashboard-2-line"></i>
            <span data-key="t-dashboards">{lang.pos.navmenu.dashboard}</span>
          </Link>
          <button className="nav-link menu-link d-flex" onClick={toggleFullScreen}>
            <FontAwesomeIcon icon={isFullScreen ? faCompress : faExpand} />
            <span data-key="t-dashboards">
              {!isFullScreen ? lang.pos.navmenu.fullscreen : lang.pos.navmenu.minimize}
            </span>
          </button>
          <button className="nav-link menu-link d-flex" onClick={handleSwitchRegister}>
            <i className="ri-stack-line"></i>
            <span data-key="t-dashboards">
              {/* Open registeration will not appear */}
              {lang.pos.navmenu.close}
            </span>
          </button>
          <Link className="nav-link menu-link" href={'#'} onClick={() => Router.reload()}>
            <i className="ri-refresh-line"></i>
            <span data-key="t-dashboards">{lang.pos.navmenu.refresh}</span>
          </Link>
          <a
            style={{
              cursor: 'pointer',
            }}
            className="nav-link menu-link"
            onClick={() => {
              if (lang == en) {
                localStorage.setItem(ELocalStorageKeys.LANGUAGE, 'ar');
                setLang(ar);
              } else {
                localStorage.setItem(ELocalStorageKeys.LANGUAGE, 'en');
                setLang(en);
              }
            }}>
            <i className="ri-global-fill" /> <span>{lang == ar ? 'EN' : 'العربية'}</span>
          </a>
          <button className="nav-link menu-link" type="button" onClick={handleLogout}>
            <i className="ri-logout-circle-line"></i>
            <span data-key="t-dashboards">{lang.pos.navmenu.logout}</span>
          </button>
        </div>
      </div>
      <div className={styles.navbar__sizer} />
    </>
  );
};

export default NavMenu;
