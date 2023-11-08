import { IconDefinition } from '@fortawesome/free-regular-svg-icons';
import { faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { PropsWithChildren, useContext, useEffect } from 'react';
import { AccordionContext, Button, useAccordionButton } from 'react-bootstrap';
import { IoSettingsSharp } from 'react-icons/io5';
import { MdOutlineCrisisAlert, MdOutlineLocalGroceryStore } from 'react-icons/md';
import { TbReportSearch } from 'react-icons/tb';
import styles from '../sideBarNav.module.css';

type SidebarNavGroupToggleProps = {
  eventKey: string;
  icon: IconDefinition | string;
  setActiveEventKey: (key: string | null) => void;
  activeEventKey: string;
} & PropsWithChildren;

export default function SidebarNavGroupToggle(props: SidebarNavGroupToggleProps) {
  const iconMapping = {
    MdOutlineLocalGroceryStore: (
      <MdOutlineLocalGroceryStore className={`nav-icon ms-n3 ${styles.customIconHeight}`} />
    ),
    MdOutlineCrisisAlert: (
      <MdOutlineCrisisAlert className={`nav-icon ms-n3 ${styles.customIconHeight}`} />
    ),
    TbReportSearch: <TbReportSearch className={`nav-icon ms-n3 ${styles.customIconHeight}`} />,
    IoSettingsSharp: <IoSettingsSharp className={`nav-icon ms-n3 ${styles.customIconHeight}`} />,
  };

  // const { activeEventKey } = useContext(AccordionContext);
  const { eventKey, icon, children, setActiveEventKey, activeEventKey } = props;

  const decoratedOnClick = useAccordionButton(eventKey, (e) => handleEvent(e));

  const handleEvent = (e) => {
    const button = e.currentTarget;
    const sidebars = document.querySelectorAll('.sidebar-nav-group');
    const attr = button.getAttribute('data-index');
    const SHOW = 'show';
    const COLLAPSED = 'collapsed';
    const SELECTED = 'selected';
    const SELECTED_NAV = 'sideBarNav_selected__amlDX';

    setActiveEventKey(attr);

    sidebars.forEach((ele) => {
      const element_btn = ele.children[0];
      const element_li = ele.children[1];

      const element_btn_attr_index = element_btn.getAttribute('data-index');

      if (element_btn_attr_index !== attr) {
        element_li.classList.remove(SHOW);
        ele.classList.remove(SHOW);
        element_btn.classList.remove(SELECTED_NAV);
        element_btn.classList.add(COLLAPSED);
        element_btn.classList.remove(SELECTED);
      }
    });
  };

  const isCurrentEventKey = activeEventKey === eventKey;

  return (
    <Button
      variant="link"
      type="button"
      className={classNames(
        'rounded-0 nav-link px-3 py-2 d-flex align-items-center flex-fill w-100 shadow-none fs-6 text-secondary',
        styles.hoverColor,
        styles.btnLink,
        isCurrentEventKey && styles.selected,
        {
          collapsed: !isCurrentEventKey,
        }
      )}
      onClick={decoratedOnClick}
      data-index={eventKey}>
      {/* <FontAwesomeIcon className="nav-icon ms-n3" icon={icon} /> */}
      {iconMapping[icon as keyof typeof iconMapping]}
      {children}
      <div className="nav-chevron ms-auto text-end">
        <FontAwesomeIcon size="xs" icon={faChevronUp} />
      </div>
    </Button>
  );
}
