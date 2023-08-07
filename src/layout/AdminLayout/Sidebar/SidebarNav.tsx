import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { IconDefinition } from '@fortawesome/free-regular-svg-icons';
import { FiHome } from 'react-icons/fi';
import {
  MdOutlineLocalGroceryStore,
  MdOutlineCrisisAlert,
  MdOutlinePointOfSale,
} from 'react-icons/md';
import { TbReportSearch } from 'react-icons/tb';
import { IoSettingsSharp } from 'react-icons/io5';
import { BsPeopleFill, BsDash, BsMenuButtonWideFill } from 'react-icons/bs';
import { BiStore } from 'react-icons/bi';
import { GiPriceTag } from 'react-icons/gi';
import {
  faChartPie,
  faChevronUp,
  faGauge,
  faLayerGroup,
  faGear,
  faUser,
  faDesktop,
  faCartFlatbed,
  faChartLine,
  faOilWell,
  faCalendar,
  faCalendarDay,
} from '@fortawesome/free-solid-svg-icons';
import React, { PropsWithChildren, useContext, useEffect, useState } from 'react';
import { Accordion, AccordionContext, Button, Nav, useAccordionButton } from 'react-bootstrap';
import classNames from 'classnames';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { apiFetch } from 'src/libs/dbUtils';
import { faWeebly } from '@fortawesome/free-brands-svg-icons';
import styles from './sideBarNav.module.css';

type SidebarNavItemProps = {
  href: string;
  icon?: IconDefinition;
  sub?: boolean;
} & PropsWithChildren;

const SidebarNavItem = (props: SidebarNavItemProps) => {
  const { icon, children, href } = props;

  // let subClass = '';
  // if (props.sub) subClass = 'ms-5';
  return (
    <Nav.Item>
      <Link href={href} passHref legacyBehavior>
        <Nav.Link
          className={classNames(
            'px-3 py-2 d-flex align-items-center fs-6 text-secondary',
            styles.navLink,
            styles.hoverColor
          )}>
          {/* {icon ? (
            <FontAwesomeIcon className="nav-icon ms-n3" icon={icon} />
          ) : (
            <span className="nav-icon ms-n3" />
          )} */}
          {props.sub && <BsDash className="nav-icon ms-n3" />}
          {children}
        </Nav.Link>
      </Link>
    </Nav.Item>
  );
};

type SidebarNavGroupToggleProps = {
  eventKey: string;
  icon: IconDefinition | string;
  setIsShow: (isShow: boolean) => void;
  isShow: boolean;
} & PropsWithChildren;

const SidebarNavGroupToggle = (props: SidebarNavGroupToggleProps) => {
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
};

type SidebarNavGroupProps = {
  toggleIcon: IconDefinition | string;
  toggleText: string;
} & PropsWithChildren;

const SidebarNavGroup = (props: SidebarNavGroupProps) => {
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
};
export function SidebarNav(probs: any): any {
  const { shopId } = probs;
  const [loading, setLoading] = useState(true);
  const [btype, setBtype] = useState('');
  const [permiss, setPermiss] = useState({
    hasProducts: false,
    hasTailoring: false,
    hasCats: false,
    hasTaxes: false,
    hasPurchases: false,
    hasSalesList: false,
    hasPOS: false,
    hasDiscount: false,
    hasExpenses: false,
    hasOrders: false,
    hasTransfer: false,
    hasSupplier: false,
    hasCustomers: false,
    hasAppearance: false,
    hasAppStore: false,
    hasItemSales: false,
    hasCategorySales: false,
    hasCurrentStock: false,
    hasSupplierSales: false,
    hasRegister: false,
    hasQuotations: false,
  });
  async function intData() {
    let { success, newdata } = await apiFetch({ fetch: 'checkwt' });
    if (newdata.types == undefined || newdata.types.length == 0) success = false;
    else {
      const item = newdata.types.find((tp: any) => tp.id == shopId);
      if (item !== undefined) setBtype(item.type);
      else success = false;
    }
    if (
      success &&
      newdata.rules[-2] != undefined &&
      newdata.rules[-2][0].stuff != undefined &&
      newdata.rules[-2][0].stuff == 'owner'
    ) {
      setPermiss({
        ...permiss,
        hasProducts: true,
        hasCats: true,
        hasTaxes: true,
        hasPurchases: true,
        hasSalesList: true,
        hasPOS: true,
        hasDiscount: true,
        hasExpenses: true,
        hasTailoring: true,
        hasOrders: true,
        hasTransfer: true,
        hasSupplier: true,
        hasCustomers: true,
        hasAppearance: true,
        hasAppStore: true,
        hasItemSales: true,
        hasCategorySales: true,
        hasCurrentStock: true,
        hasSupplierSales: true,
        hasQuotations: true,
        hasRegister: true,
      });
      setLoading(false);
    } else if (success && newdata.rules[shopId] != undefined) {
      var _stuf = '';
      newdata.rules[shopId].forEach((dd: any) => (_stuf += dd.stuff));

      setPermiss({
        ...permiss,
        hasProducts: _stuf.includes('products/'),
        hasCats: _stuf.includes('category/'),
        hasTaxes: _stuf.includes('taxes/'),
        hasPurchases: _stuf.includes('purchases/'),
        hasSalesList: _stuf.includes('sales/'),
        hasPOS: _stuf.includes('pos/'),
        hasDiscount: _stuf.includes('discounts/'),
        hasExpenses: _stuf.includes('expanses/'),
        hasTailoring: _stuf.includes('tailoring/'),
        hasOrders: _stuf.includes('orders/'),
      });
      setLoading(false);
    } else {
      alert('error');
    }
  }
  useEffect(() => {
    intData();
  }, [shopId]);
  return (
    !loading && (
      <ul className="list-unstyled">
        <SidebarNavItem icon={faGauge} href={'/shop/' + shopId}>
          <FiHome className="nav-icon ms-n3" />
          Dashboard
          <small className="ms-auto"></small>
        </SidebarNavItem>

        {(permiss.hasProducts ||
          permiss.hasPurchases ||
          permiss.hasTransfer ||
          permiss.hasSupplier ||
          permiss.hasExpenses ||
          permiss.hasTailoring) && (
          <SidebarNavGroup toggleIcon="MdOutlineLocalGroceryStore" toggleText="Inventory">
            {permiss.hasProducts && (
              <SidebarNavItem href={'/shop/' + shopId + '/products'} sub={true}>
                Products
              </SidebarNavItem>
            )}
            {permiss.hasPurchases && (
              <SidebarNavItem href={'/shop/' + shopId + '/purchases'} sub={true}>
                Purchases
              </SidebarNavItem>
            )}
            {permiss.hasTransfer && (
              <SidebarNavItem href={'/shop/' + shopId + '/transfers'} sub={true}>
                Transfers
              </SidebarNavItem>
            )}
            {permiss.hasSupplier && (
              <SidebarNavItem href={'/shop/' + shopId + '/suppliers'} sub={true}>
                Suppliers
              </SidebarNavItem>
            )}
            {permiss.hasExpenses && (
              <SidebarNavItem href={'/shop/' + shopId + '/expenses'} sub={true}>
                Expenses
              </SidebarNavItem>
            )}
            {permiss.hasTailoring && btype == 'Kianvqyqndr' && (
              <SidebarNavItem href={'/shop/' + shopId + '/tailoring'} sub={true}>
                Tailoring
              </SidebarNavItem>
            )}
          </SidebarNavGroup>
        )}

        {permiss.hasCustomers && (
          <SidebarNavItem icon={faUser} href={'/shop/' + shopId + '/pricing'}>
            <GiPriceTag className="nav-icon ms-n3" />
            Pricing Groups
            <small className="ms-auto"></small>
          </SidebarNavItem>
        )}

        {(permiss.hasSalesList || permiss.hasPurchases || permiss.hasCats) && (
          <SidebarNavGroup toggleIcon="MdOutlineCrisisAlert" toggleText="Sales">
            {permiss.hasQuotations && (
              <SidebarNavItem href={'/shop/' + shopId + '/quotations'} sub={true}>
                Quotations List
              </SidebarNavItem>
            )}
            {permiss.hasSalesList && (
              <SidebarNavItem href={'/shop/' + shopId + '/sales'} sub={true}>
                {' '}
                Sales List
              </SidebarNavItem>
            )}
            {permiss.hasOrders && btype == 'Kianvqyqndr' && (
              <>
                {localStorage.setItem('orders', 'true')}
                <SidebarNavItem href={'/shop/' + shopId + '/orders'}>Orders</SidebarNavItem>
              </>
            )}
          </SidebarNavGroup>
        )}
        {permiss.hasCustomers && (
          <SidebarNavItem icon={faUser} href={'/shop/' + shopId + '/customers'}>
            <BsPeopleFill className="nav-icon ms-n3" />
            Customers
            <small className="ms-auto"></small>
          </SidebarNavItem>
        )}
        {(permiss.hasTaxes || permiss.hasDiscount || permiss.hasExpenses) && (
          <SidebarNavGroup toggleIcon="TbReportSearch" toggleText="Report">
            {permiss.hasRegister && (
              <SidebarNavItem href={'/shop/' + shopId + '/reports/register'} sub={true}>
                Open Close Register
              </SidebarNavItem>
            )}
            {permiss.hasItemSales && (
              <SidebarNavItem href={'/shop/' + shopId + '/reports/SalesReport'} sub={true}>
                Sales Report
              </SidebarNavItem>
            )}
            {/* Eslam 20  */}
            {permiss.hasItemSales && (
              <SidebarNavItem href={'/shop/' + shopId + '/reports/ItemsReport'} sub={true}>
                Items Report{' '}
              </SidebarNavItem>
            )}
            {permiss.hasItemSales && (
              <SidebarNavItem href={'/shop/' + shopId + '/reports/StockReport'} sub={true}>
                Stock Report{' '}
              </SidebarNavItem>
            )}
            {permiss.hasCategorySales && (
              <SidebarNavItem href={'/shop/' + shopId + '/cates'} sub={true}>
                Category Sales
              </SidebarNavItem>
            )}
            {permiss.hasSupplierSales && (
              <SidebarNavItem href={'/shop/' + shopId + '/supplier'} sub={true}>
                Supplier Sales
              </SidebarNavItem>
            )}
            {permiss.hasCurrentStock && (
              <SidebarNavItem href={'/shop/' + shopId + '/currentstock'} sub={true}>
                Current Stock
              </SidebarNavItem>
            )}
          </SidebarNavGroup>
        )}
        {permiss.hasAppStore && (
          <SidebarNavItem icon={faCalendarDay} href={'/shop/' + shopId + '/appstore'}>
            <BiStore className="nav-icon ms-n3" />
            App Store
            <small className="ms-auto"></small>
          </SidebarNavItem>
        )}
        {(permiss.hasTaxes || permiss.hasAppearance || permiss.hasCats) && (
          <SidebarNavGroup toggleIcon="IoSettingsSharp" toggleText="Settings">
            {permiss.hasTaxes && (
              <SidebarNavItem href={'/shop/' + shopId + '/taxes'} sub={true}>
                Taxes
              </SidebarNavItem>
            )}
            {permiss.hasAppearance && (
              <SidebarNavItem href={'/shop/' + shopId + '/appearance'} sub={true}>
                Appearance
              </SidebarNavItem>
            )}
            {permiss.hasCats && (
              <SidebarNavItem href={'/shop/' + shopId + '/category'} sub={true}>
                Category & Brands
              </SidebarNavItem>
            )}
            {permiss.hasTaxes && (
              <SidebarNavItem href={'/shop/' + shopId + '/payment'} sub={true}>
                Payment Methods
              </SidebarNavItem>
            )}
          </SidebarNavGroup>
        )}
        {permiss.hasPOS && (
          <SidebarNavItem icon={faDesktop} href={'/pos/' + shopId}>
            <MdOutlinePointOfSale className="nav-icon ms-n3" />
            POS
            <small className="ms-auto"></small>
          </SidebarNavItem>
        )}
        {permiss.hasAppStore && (
          <SidebarNavItem icon={faCalendarDay} href={'/menu/' + shopId}>
            <BsMenuButtonWideFill className="nav-icon ms-n3" />
            Digital Menu
            <small className="ms-auto"></small>
          </SidebarNavItem>
        )}
      </ul>
    )
  );
}
export function OwnerSidebarNav({ username2 }: any) {
  const router = useRouter();
  const [username, setUsername] = useState('');
  useEffect(() => {
    var _username: any = router.query.username;
    if (typeof _username != undefined) setUsername(_username);
  }, [router]);
  return (
    <ul className="list-unstyled">
      {/* <SidebarNavItem icon={faGauge} href="/">
        Dashboard
        <small className="ms-auto"></small>
      </SidebarNavItem> */}
      <SidebarNavItem icon={faChartPie} href={username ? '/' + username + '/business' : ''}>
        My Businesses
      </SidebarNavItem>
      <SidebarNavItem icon={faUser} href={username ? '/' + username + '/rules' : ''}>
        Rules<small className="ms-auto"></small>
      </SidebarNavItem>
      <SidebarNavItem icon={faUser} href={username ? '/' + username + '/users' : ''}>
        Users<small className="ms-auto"></small>
      </SidebarNavItem>
    </ul>
  );
}
