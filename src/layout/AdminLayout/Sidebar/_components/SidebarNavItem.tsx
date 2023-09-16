import { IconDefinition } from '@fortawesome/free-regular-svg-icons';
import classNames from 'classnames';
import Link from 'next/link';
import { PropsWithChildren } from 'react';
import { Nav } from 'react-bootstrap';
import { BsDash } from 'react-icons/bs';
import styles from '../sideBarNav.module.css';

type SidebarNavItemProps = {
  href: string;
  icon?: IconDefinition;
  sub?: boolean;
  isShown?: boolean;
} & PropsWithChildren;

export default function SidebarNavItem({
  children,
  href,
  sub,
  isShown = true,
  ...props
}: SidebarNavItemProps) {
  return (
    <Nav.Item
      style={{
        display: isShown ? 'block' : 'none',
      }}>
      <Link href={href} passHref legacyBehavior>
        <Nav.Link
          className={classNames(
            'px-3 py-2 d-flex align-items-center fs-6 text-secondary',
            styles.navLink,
            styles.hoverColor
          )}>
          {sub && <BsDash className="nav-icon ms-n3" />}
          {children}
        </Nav.Link>
      </Link>
    </Nav.Item>
  );
}
