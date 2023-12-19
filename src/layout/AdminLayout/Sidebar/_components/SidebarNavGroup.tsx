import { IconDefinition } from '@fortawesome/free-regular-svg-icons';
import classNames from 'classnames';
import { PropsWithChildren } from 'react';
import { Accordion } from 'react-bootstrap';
import SidebarNavGroupToggle from './SidebarNavGroupToggle';

type SidebarNavGroupProps = {
  toggleIcon: IconDefinition | string;
  toggleText: string;

  eventKey: string;
  setActiveEventKey: (key: string | null) => void;
  activeEventKey: string;
} & PropsWithChildren;

export default function SidebarNavGroup(props: SidebarNavGroupProps) {
  const { toggleIcon, toggleText, children, eventKey, setActiveEventKey, activeEventKey } = props;

  return (
    <Accordion
      as="li"
      bsPrefix="nav-group"
      className={`sidebar-nav-group ${classNames({ show: activeEventKey === eventKey })}`}>
      <SidebarNavGroupToggle
        icon={toggleIcon}
        eventKey={eventKey}
        setActiveEventKey={setActiveEventKey}
        activeEventKey={activeEventKey}>
        {toggleText}
      </SidebarNavGroupToggle>
      <Accordion.Collapse eventKey={eventKey}>
        <ul className="nav-group-items list-unstyled">{children}</ul>
      </Accordion.Collapse>
    </Accordion>
  );
}
