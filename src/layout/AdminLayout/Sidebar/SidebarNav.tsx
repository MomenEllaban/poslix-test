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

  const [permissions, setPermissions] = useState<any>();
  useEffect(() => {
    const perms = JSON.parse(localStorage.getItem('permissions'));
    const getPermissions = {
      hasPos: false,
      hasProducts: false,
      hasPurchases: false,
      hasTransfers: false,
      hasSuppliers: false,
      hasExpenses: false,
      hasPricingGroups: false,
      hasCustomers: false,
      hasSalesList: false,
      hasQuotations: false,
      hasCategories: false,
      hasBrands: false,
      hasTaxes: false,
      hasAppearance: false,
    };

    perms.inventory.products.map((perm) =>
      perm.name === 'products/view' ? (getPermissions.hasProducts = true) : null
    );
    perms.inventory.purchases.map((perm) =>
      perm.name === 'purchases/view' ? (getPermissions.hasPurchases = true) : null
    );
    perms.inventory.transfers.map((perm) =>
      perm.name === 'transfers/view' ? (getPermissions.hasTransfers = true) : null
    );
    perms.inventory.expenses.map((perm) =>
      perm.name === 'expenses/view' ? (getPermissions.hasExpenses = true) : null
    );
    perms.customers.map((perm) =>
      perm.name === 'customers/view' ? (getPermissions.hasCustomers = true) : null
    );
    perms.pos[0].name.includes('open/register') ? (getPermissions.hasPos = true) : null;
    perms.settings.categories.map((perm) =>
      perm.name === 'categories/view' ? (getPermissions.hasCategories = true) : null
    );
    perms.settings.brands.map((perm) =>
      perm.name === 'brands/view' ? (getPermissions.hasBrands = true) : null
    );
    perms.settings.taxes.map((perm) =>
      perm.name === 'taxes/view' ? (getPermissions.hasTaxes = true) : null
    );
    perms.settings.appearance.map((perm) =>
      perm.name === 'appearance/view' ? (getPermissions.hasAppearance = true) : null
    );
    perms.pos.pricinggroup.map((perm) =>
      perm.name === 'pricinggroup/view' ? (getPermissions.hasPricingGroups = true) : null
    );
    perms.sales['sales-list'].map((perm) =>
      perm.name === 'sales-list/view' ? (getPermissions.hasSalesList = true) : null
    );
    perms.sales['quotations-list'].map((perm) =>
      perm.name === 'quotations-list/view' ? (getPermissions.hasQuotations = true) : null
    );

    setPermissions(getPermissions);
  }, []);

  if (loading)
    return (
      <ul className="list-unstyled">
        <SidebarNavItem href={'#'}>Loading...</SidebarNavItem>
        <SidebarNavItem href={'#'}>Loading...</SidebarNavItem>
        <SidebarNavItem href={'#'}>Loading...</SidebarNavItem>
        <SidebarNavItem href={'#'}>Loading...</SidebarNavItem>
        <SidebarNavItem href={'#'}>Loading...</SidebarNavItem>
      </ul>
    );
  return (
    <ul className="list-unstyled">
      <SidebarNavItem href={'/shop/' + shopId} isShown={!!shopId}>
        <FiHome className="nav-icon ms-n3" />
        Dashboard
        <small className="ms-auto"></small>
      </SidebarNavItem>

      {(permissions.hasProducts ||
        permissions.hasPurchases ||
        permissions.hasTransfers ||
        // permissions.hasSupplier ||
        permissions.hasExpenses) && (
        <SidebarNavGroup toggleIcon="MdOutlineLocalGroceryStore" toggleText="Inventory">
          {permissions.hasProducts && (
            <SidebarNavItem href={'/shop/' + shopId + '/products'} sub={true} isShown={!!shopId}>
              Products
            </SidebarNavItem>
          )}
          {permissions.hasPurchases && (
            <SidebarNavItem href={'/shop/' + shopId + '/purchases'} sub={true} isShown={!!shopId}>
              Purchases
            </SidebarNavItem>
          )}
          {permissions.hasTransfers && (
            <SidebarNavItem href={'/shop/' + shopId + '/transfers'} sub={true} isShown={!!shopId}>
              Transfers
            </SidebarNavItem>
          )}
          {permissions.hasSupplier && (
            <SidebarNavItem href={'/shop/' + shopId + '/suppliers'} sub={true} isShown={!!shopId}>
              Suppliers
            </SidebarNavItem>
          )}
          {permissions.hasExpenses && (
            <SidebarNavItem href={'/shop/' + shopId + '/expenses'} sub={true} isShown={!!shopId}>
              Expenses
            </SidebarNavItem>
          )}
          {permissions.hasTailoring && btype == 'Kianvqyqndr' && (
            <SidebarNavItem href={'/shop/' + shopId + '/tailoring'} sub={true} isShown={!!shopId}>
              Tailoring
            </SidebarNavItem>
          )}
        </SidebarNavGroup>
      )}

      {permiss.hasCustomers && (
        <SidebarNavItem icon={faUser} href={'/shop/' + shopId + '/pricing'} isShown={!!shopId}>
          <Money className="nav-icon ms-n3" />
          Pricing Groups
          <small className="ms-auto"></small>
        </SidebarNavItem>
      )}

      {(permissions.hasSalesList || permissions.hasPurchases || permissions.hasCategories) && (
        <SidebarNavGroup toggleIcon="MdOutlineCrisisAlert" toggleText="Sales">
          {/* {permissions.hasQuotations && ( */}
          <SidebarNavItem href={'/shop/' + shopId + '/quotations'} sub={true} isShown={!!shopId}>
            Quotations List
          </SidebarNavItem>
          {/* )} */}
          {/* {permissions.hasSalesList && ( */}
          <SidebarNavItem href={'/shop/' + shopId + '/sales'} sub={true} isShown={!!shopId}>
            {' '}
            Sales List
          </SidebarNavItem>
          {/* )} */}

          {permiss.hasOrders &&
            btype == 'Kianvqyqndr' && ( //! why?
              <>
                {localStorage.setItem('orders', 'true')}
                <SidebarNavItem href={'/shop/' + shopId + '/orders'} isShown={!!shopId}>
                  Orders
                </SidebarNavItem>
                {localStorage.setItem('orders', 'true')}
                <SidebarNavItem href={'/shop/' + shopId + '/orders'} isShown={!!shopId}>
                  Orders
                </SidebarNavItem>
              </>
            )}
        </SidebarNavGroup>
      )}
      {permiss.hasCustomers && (
        <SidebarNavItem icon={faUser} href={'/shop/' + shopId + '/customers'} isShown={!!shopId}>
          <BsPeopleFill className="nav-icon ms-n3" />
          Customers
          <small className="ms-auto"></small>
        </SidebarNavItem>
      )}

      {(permiss.hasTaxes || permiss.hasDiscount || permiss.hasExpenses) && (
        <SidebarNavGroup toggleIcon="TbReportSearch" toggleText="Report">
          {permiss.hasRegister && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/reports/register'}
              sub={true}
              isShown={!!shopId}>
              Open Close Register
            </SidebarNavItem>
          )}

          {permiss.hasItemSales && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/reports/SalesReport'}
              sub={true}
              isShown={!!shopId}>
              Sales Report
            </SidebarNavItem>
          )}
          {/* Eslam 20  */}
          {permiss.hasItemSales && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/reports/ItemsReport'}
              sub={true}
              isShown={!!shopId}>
              Items Report{' '}
            </SidebarNavItem>
          )}
          {permiss.hasItemSales && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/reports/StockReport'}
              sub={true}
              isShown={!!shopId}>
              Stock Report{' '}
            </SidebarNavItem>
          )}
          {permiss.hasCategorySales && (
            <SidebarNavItem href={'/shop/' + shopId + '/cates'} sub={true} isShown={!!shopId}>
              Category Sales
            </SidebarNavItem>
          )}
          {permiss.hasSupplierSales && (
            <SidebarNavItem href={'/shop/' + shopId + '/supplier'} sub={true} isShown={!!shopId}>
              Supplier Sales
            </SidebarNavItem>
          )}
          {permiss.hasCurrentStock && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/currentstock'}
              sub={true}
              isShown={!!shopId}>
              Current Stock
            </SidebarNavItem>
          )}
        </SidebarNavGroup>
      )}

      {permiss.hasAppStore && (
        <SidebarNavItem
          icon={faCalendarDay}
          href={'/shop/' + shopId + '/appstore'}
          isShown={!!shopId}>
          <BiStore className="nav-icon ms-n3" />
          App Store
          <small className="ms-auto"></small>
        </SidebarNavItem>
      )}

      {(permiss.hasTaxes || permiss.hasAppearance || permiss.hasCats) && (
        <SidebarNavGroup toggleIcon="IoSettingsSharp" toggleText="Settings">
          {permiss.hasTaxes && (
            <SidebarNavItem href={'/shop/' + shopId + '/taxes'} sub={true} isShown={!!shopId}>
              Taxes
            </SidebarNavItem>
          )}
          {permiss.hasAppearance && (
            <SidebarNavItem href={'/shop/' + shopId + '/appearance'} sub={true} isShown={!!shopId}>
              Appearance
            </SidebarNavItem>
          )}
          {permiss.hasCats && (
            <SidebarNavItem href={'/shop/' + shopId + '/category'} sub={true} isShown={!!shopId}>
              Category & Brands
            </SidebarNavItem>
          )}
          {permiss.hasTaxes && (
            <SidebarNavItem href={'/shop/' + shopId + '/payment'} sub={true} isShown={!!shopId}>
              Payment Methods
            </SidebarNavItem>
          )}
          {
            <SidebarNavItem
              href={'/shop/' + shopId + '/Printsetting'}
              sub={true}
              isShown={!!shopId}>
              Print setting
            </SidebarNavItem>
          }
        </SidebarNavGroup>
      )}
      {permiss.hasPOS && (
        <SidebarNavItem icon={faDesktop} href={'/pos/' + shopId} isShown={!!shopId}>
          <MdOutlinePointOfSale className="nav-icon ms-n3" />
          POS
          <small className="ms-auto"></small>
        </SidebarNavItem>
      )}
      {permiss.hasAppStore && (
        <SidebarNavItem icon={faCalendarDay} href={'/digital/' + shopId} isShown={!!shopId}>
          <BsMenuButtonWideFill className="nav-icon ms-n3" />
          Digital Menu
          <small className="ms-auto"></small>
        </SidebarNavItem>
      )}
    </ul>
  );
}
