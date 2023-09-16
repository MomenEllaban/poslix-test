import { IconDefinition } from '@fortawesome/free-regular-svg-icons';
import {
  faChevronUp
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import classNames from 'classnames';
import { PropsWithChildren, useContext, useEffect } from 'react';
import { AccordionContext, Button, useAccordionButton } from 'react-bootstrap';
import { IoSettingsSharp } from 'react-icons/io5';
import {
  MdOutlineCrisisAlert,
  MdOutlineLocalGroceryStore
} from 'react-icons/md';
import { TbReportSearch } from 'react-icons/tb';
import styles from '../sideBarNav.module.css';

type SidebarNavGroupToggleProps = {
  eventKey: string;
  icon: IconDefinition | string;
  setIsShow: (isShow: boolean) => void;
  isShow: boolean;
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
  // https://react-bootstrap.github.io/components/accordion/#custom-toggle-with-expansion-awareness
  const { activeEventKey } = useContext(AccordionContext);
  const { eventKey, icon, children, setIsShow, isShow } = props;

  const decoratedOnClick = useAccordionButton(eventKey);

  const isCurrentEventKey = activeEventKey === eventKey;

  useEffect(() => {
    setIsShow(activeEventKey === eventKey);
  }, [activeEventKey, eventKey, setIsShow]);

  return (
    <Button
      variant="link"
      type="button"
      className={classNames(
        'rounded-0 nav-link px-3 py-2 d-flex align-items-center flex-fill w-100 shadow-none fs-6 text-secondary ',
        styles.hoverColor,
        styles.btnLink,
        isShow && styles.selected,
        {
          collapsed: !isCurrentEventKey,
        }
      )}
      onClick={decoratedOnClick}>
      {/* <FontAwesomeIcon className="nav-icon ms-n3" icon={icon} /> */}
      {iconMapping[icon as keyof typeof iconMapping]}
      {children}
      <div className="nav-chevron ms-auto text-end">
        <FontAwesomeIcon size="xs" icon={faChevronUp} />
      </div>
    </Button>
  );
}
