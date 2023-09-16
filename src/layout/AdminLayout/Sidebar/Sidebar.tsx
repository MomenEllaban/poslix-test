import { faAngleLeft } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { useEffect, useState } from 'react';
import { Button } from 'react-bootstrap';
import { useDarkMode } from '../../../context/DarkModeContext';
import OwnerSidebarNav from './OwnerSidebarNav';
import { SidebarNav } from './SidebarNav';

interface ISidebarProps {
  isShow: boolean;
  isShowMd: boolean;
  isOwner: boolean;
  shopId: number;
}
export default function Sidebar({ isShow, isShowMd, isOwner, shopId }: ISidebarProps) {
  const { darkMode } = useDarkMode();
  const [isNarrow, setIsNarrow] = useState(false);

  const toggleIsNarrow = () => {
    const newValue = !isNarrow;
    localStorage.setItem('isNarrow', newValue ? 'true' : 'false');
    setIsNarrow(newValue);
  };

  // On first time load only
  useEffect(() => {
    if (localStorage.getItem('isNarrow')) {
      setIsNarrow(localStorage.getItem('isNarrow') === 'true');
    }
  }, [setIsNarrow]);

  return (
    <div
      id="sidebar"
      className={classNames(`sidebar d-flex flex-column position-fixed h-100`, {
        show: isShow,
        'dark-mode-body': darkMode,
        'light-mode-body': !darkMode,
        'sidebar-narrow': isNarrow,
        'md-hide': !isShowMd,
      })}
      style={{ boxShadow: '0 0 10px 0 rgba(0, 0, 0, 0.1)' }}>
      <div className="sidebar-brand w-100 d-none d-md-flex align-items-center justify-content-center border-bottom bg-light mb-4 h-75 text-center mb-3 m-auto">
        <div className="d-flex flex-row w-50 justify-content-center align-items-center">
          <img src={'/images/poslix-sm.png'} className={'logo-css-small'} />
          <img src={'/images/logo1.png'} className={'logo-css-big'} />
        </div>
      </div>

      <div className="sidebar-nav flex-fill">
        {isOwner ? <OwnerSidebarNav /> : <SidebarNav shopId={shopId} />}
      </div>

      <Button
        variant="link"
        className="sidebar-toggler d-none d-md-inline-block rounded-0 text-end pe-4 fw-bold shadow-none"
        onClick={toggleIsNarrow}
        type="button"
        aria-label="sidebar toggler">
        <FontAwesomeIcon className="sidebar-toggler-chevron" icon={faAngleLeft} fontSize={24} />
      </Button>
    </div>
  );
}
