import { IconDefinition } from '@fortawesome/free-regular-svg-icons';
import classNames from 'classnames';
import { PropsWithChildren, useState } from 'react';
import { Accordion } from 'react-bootstrap';
import SidebarNavGroupToggle from './SidebarNavGroupToggle';

type SidebarNavGroupProps = {
  toggleIcon: IconDefinition | string;
  toggleText: string;
} & PropsWithChildren;

export default function SidebarNavGroup(props: SidebarNavGroupProps) {
  const { toggleIcon, toggleText, children } = props;

  const [isShow, setIsShow] = useState(false);

  return (
    <Accordion as="li" bsPrefix="nav-group" className={classNames({ show: isShow })}>
      <SidebarNavGroupToggle icon={toggleIcon} eventKey="0" setIsShow={setIsShow} isShow={isShow}>
        {toggleText}
      </SidebarNavGroupToggle>
      <Accordion.Collapse eventKey="0">
        <ul className="nav-group-items list-unstyled">{children}</ul>
      </Accordion.Collapse>
    </Accordion>
  );
}
