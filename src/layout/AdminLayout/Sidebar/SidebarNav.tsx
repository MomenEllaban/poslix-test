import { faCalendarDay, faDesktop, faUser } from '@fortawesome/free-solid-svg-icons';
import Money from '@mui/icons-material/Money';
import { useEffect, useState } from 'react';
import { BiStore } from 'react-icons/bi';
import { BsMenuButtonWideFill, BsPeopleFill } from 'react-icons/bs';
import { FiHome } from 'react-icons/fi';
import { MdOutlinePointOfSale } from 'react-icons/md';
import { findAllData } from 'src/services/crud.api';
import SidebarNavGroup from './_components/SidebarNavGroup';
import SidebarNavItem from './_components/SidebarNavItem';
import { useRouter } from 'next/router';

const initialPermissions = {
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
};

const initialTruePermissions = Object.keys(initialPermissions).reduce((acc, key) => {
  acc[key] = true;
  return acc;
}, {} as any);

export function SidebarNav({ shopId }: any): React.JSX.Element {
  const [btype, setBType] = useState('');
  const [loading, setLoading] = useState(true);
  const [permiss, setPermiss] = useState(initialPermissions);
  const router = useRouter();
  const [permissions, setPermissions] = useState<any>();

  async function intData() {
    const res = await findAllData('permissions/13');
    if (!res) return;

    // let { success, newdata } = await apiFetch({ fetch: 'checkwt' });
    // if (newdata.types == undefined || newdata.types.length == 0) success = false;
    if (
      res.data.result.name == 'owner' ||
      true //! this is a turn around
    ) {
      const newPermissions = {
        ...permiss,
        ...initialTruePermissions,
      };
      setPermiss({ ...newPermissions });
      // localStorage.setItem('roles', JSON.stringify(newPermissions))

      setLoading(false);
    } else {
      let _stuf = '';
      // newdata.rules[shopId].forEach((dd: any) => (_stuf += dd.stuff));
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
    }
  }
  useEffect(() => {
    intData();
  }, [shopId]);

  useEffect(() => {
    const localPermissions = localStorage.getItem('permissions');
    if (!localPermissions) return;

    const permsArr = JSON.parse(localStorage.getItem('permissions'));
    if (!permsArr) return;
    
    const perms =
      JSON.parse(localStorage.getItem('userdata')).user_type === 'owner' ?
      permsArr : permsArr?.filter((loc) => loc.id == shopId);

    const getPermissions = { hasPos: false, hasProducts: false, hasPurchases: false, hasTransfers: false,
      hasSuppliers: true, hasExpenses: false, hasPricingGroups: false, hasCustomers: false, hasSalesList: false,
      hasQuotations: false, hasCategories: false, hasBrands: false, hasTaxes: false, hasAppearance: false};
    
    perms[0]?.permissions?.map((perm) =>
      perm.name === 'products/view' ? (getPermissions.hasProducts = true)
      : perm.name === 'purchases/view' ? (getPermissions.hasPurchases = true)
      : perm.name === 'transfers/view' ? (getPermissions.hasTransfers = true)
      : perm.name === 'expenses/view' ? (getPermissions.hasExpenses = true)
      : perm.name === 'customers/view' ? (getPermissions.hasCustomers = true)
      : perm.name === 'open/register' ? (getPermissions.hasPos = true)
      : perm.name === 'categories/view' ? (getPermissions.hasCategories = true)
      : perm.name === 'brands/view' ? (getPermissions.hasBrands = true)
      : perm.name === 'taxes/view' ? (getPermissions.hasTaxes = true)
      : perm.name === 'appearance/view' ? (getPermissions.hasAppearance = true)
      : perm.name === 'pricinggroup/view' ? (getPermissions.hasPricingGroups = true)
      : perm.name === 'sales-list/view' ? (getPermissions.hasSalesList = true)
      : perm.name === 'quotations-list/view' ? (getPermissions.hasQuotations = true)
      : null
    );
    
    setPermissions(getPermissions);
  }, [shopId]);

  if (loading)
    return (
      <ul className="list-unstyled">
        <SidebarNavItem href={'#'}>Loading...</SidebarNavItem>
      </ul>
    );
  return (
    <ul className="list-unstyled">
      <SidebarNavItem href={'/shop/' + shopId} isShown={!!router.query.id}>
        <FiHome className="nav-icon ms-n3" />
        Dashboard
        <small className="ms-auto"></small>
      </SidebarNavItem>

      {(permissions.hasProducts ||
        permissions.hasPurchases ||
        permissions.hasTransfers ||
        permissions.hasSuppliers ||
        permissions.hasExpenses) && (
        <SidebarNavGroup toggleIcon="MdOutlineLocalGroceryStore" toggleText="Inventory">
          {permissions.hasProducts && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/products'}
              sub={true}
              isShown={!!router.query.id}>
              Products
            </SidebarNavItem>
          )}
          {permissions.hasPurchases && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/purchases'}
              sub={true}
              isShown={!!router.query.id}>
              Purchases
            </SidebarNavItem>
          )}
          {permissions.hasTransfers && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/transfers'}
              sub={true}
              isShown={!!router.query.id}>
              Transfers
            </SidebarNavItem>
          )}
          {permissions.hasSuppliers && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/suppliers'}
              sub={true}
              isShown={!!router.query.id}>
              Suppliers
            </SidebarNavItem>
          )}
          {permissions.hasExpenses && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/expenses'}
              sub={true}
              isShown={!!router.query.id}>
              Expenses
            </SidebarNavItem>
          )}
          {permissions.hasTailoring && btype == 'Kianvqyqndr' && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/tailoring'}
              sub={true}
              isShown={!!router.query.id}>
              Tailoring
            </SidebarNavItem>
          )}
        </SidebarNavGroup>
      )}

      {permissions.hasCustomers && (
        <SidebarNavItem
          icon={faUser}
          href={'/shop/' + shopId + '/pricing'}
          isShown={!!router.query.id}>
          <Money className="nav-icon ms-n3" />
          Pricing Groups
          <small className="ms-auto"></small>
        </SidebarNavItem>
      )}

      {(permissions.hasSalesList || permissions.hasPurchases || permissions.hasCategories) && (
        <SidebarNavGroup toggleIcon="MdOutlineCrisisAlert" toggleText="Sales">
          {/* {permissions.hasQuotations && ( */}
          <SidebarNavItem
            href={'/shop/' + shopId + '/quotations'}
            sub={true}
            isShown={!!router.query.id}>
            Quotations List
          </SidebarNavItem>
          {/* )} */}
          {/* {permissions.hasSalesList && ( */}
          <SidebarNavItem
            href={'/shop/' + shopId + '/sales'}
            sub={true}
            isShown={!!router.query.id}>
            {' '}
            Sales List
          </SidebarNavItem>
          {/* )} */}

          {permissions.hasOrders &&
            btype == 'Kianvqyqndr' && ( //! why?
              <>
                {localStorage.setItem('orders', 'true')}
                <SidebarNavItem href={'/shop/' + shopId + '/orders'} isShown={!!router.query.id}>
                  Orders
                </SidebarNavItem>
                {localStorage.setItem('orders', 'true')}
                <SidebarNavItem href={'/shop/' + shopId + '/orders'} isShown={!!router.query.id}>
                  Orders
                </SidebarNavItem>
              </>
            )}
        </SidebarNavGroup>
      )}
      {permissions.hasCustomers && (
        <SidebarNavItem
          icon={faUser}
          href={'/shop/' + shopId + '/customers'}
          isShown={!!router.query.id}>
          <BsPeopleFill className="nav-icon ms-n3" />
          Customers
          <small className="ms-auto"></small>
        </SidebarNavItem>
      )}

      {(permissions.hasTaxes || permissions.hasDiscount || permissions.hasExpenses) && (
        <SidebarNavGroup toggleIcon="TbReportSearch" toggleText="Report">
          {permissions.hasRegister && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/reports/register'}
              sub={true}
              isShown={!!router.query.id}>
              Open Close Register
            </SidebarNavItem>
          )}

          {permissions.hasItemSales && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/reports/SalesReport'}
              sub={true}
              isShown={!!router.query.id}>
              Sales Report
            </SidebarNavItem>
          )}
          {/* Eslam 20  */}
          {permissions.hasItemSales && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/reports/ItemsReport'}
              sub={true}
              isShown={!!router.query.id}>
              Items Report{' '}
            </SidebarNavItem>
          )}
          {permissions.hasItemSales && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/reports/StockReport'}
              sub={true}
              isShown={!!router.query.id}>
              Stock Report{' '}
            </SidebarNavItem>
          )}
          {/* {permissions.hasCategorySales && (
            <SidebarNavItem href={'/shop/' + shopId + '/cates'} sub={true} isShown={!!router.query.id}>
              Category Sales
            </SidebarNavItem>
          )} */}
          {/* {permissions.hasSupplierSales && (
            <SidebarNavItem href={'/shop/' + shopId + '/supplier'} sub={true} isShown={!!router.query.id}>
              Supplier Sales
            </SidebarNavItem>
          )} */}
          {/* {permissions.hasCurrentStock && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/currentstock'}
              sub={true}
              isShown={!!router.query.id}>
              Current Stock
            </SidebarNavItem>
          )} */}
        </SidebarNavGroup>
      )}

      {permissions.hasAppStore && (
        <SidebarNavItem
          icon={faCalendarDay}
          href={'/shop/' + shopId + '/appstore'}
          isShown={!!router.query.id}>
          <BiStore className="nav-icon ms-n3" />
          App Store
          <small className="ms-auto"></small>
        </SidebarNavItem>
      )}

      {(permissions.hasTaxes || permissions.hasAppearance || permissions.hasCats) && (
        <SidebarNavGroup toggleIcon="IoSettingsSharp" toggleText="Settings">
          {permissions.hasTaxes && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/taxes'}
              sub={true}
              isShown={!!router.query.id}>
              Taxes
            </SidebarNavItem>
          )}
          {permissions.hasAppearance && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/appearance'}
              sub={true}
              isShown={!!router.query.id}>
              Appearance
            </SidebarNavItem>
          )}
          {permissions.hasCats && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/category'}
              sub={true}
              isShown={!!router.query.id}>
              Category & Brands
            </SidebarNavItem>
          )}
          {permissions.hasTaxes && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/payment'}
              sub={true}
              isShown={!!router.query.id}>
              Payment Methods
            </SidebarNavItem>
          )}
          {
            <SidebarNavItem
              href={'/shop/' + shopId + '/Printsetting'}
              sub={true}
              isShown={!!router.query.id}>
              Print setting
            </SidebarNavItem>
          }
        </SidebarNavGroup>
      )}
      {permissions.hasPOS && (
        <SidebarNavItem icon={faDesktop} href={'/pos/' + shopId} isShown={!!router.query.id}>
          <MdOutlinePointOfSale className="nav-icon ms-n3" />
          POS
          <small className="ms-auto"></small>
        </SidebarNavItem>
      )}
      {permissions.hasAppStore && (
        <SidebarNavItem
          icon={faCalendarDay}
          href={'/digital/' + shopId}
          isShown={!!router.query.id}>
          <BsMenuButtonWideFill className="nav-icon ms-n3" />
          Digital Menu
          <small className="ms-auto"></small>
        </SidebarNavItem>
      )}
    </ul>
  );
}
