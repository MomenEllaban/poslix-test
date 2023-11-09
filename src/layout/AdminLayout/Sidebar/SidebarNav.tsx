import { faCalendarDay, faDesktop, faListSquares, faUser } from '@fortawesome/free-solid-svg-icons';
import Money from '@mui/icons-material/Money';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { BiStore } from 'react-icons/bi';
import { BsMenuButtonWideFill, BsPeopleFill } from 'react-icons/bs';
import { FiHome } from 'react-icons/fi';
import { MdOutlinePointOfSale } from 'react-icons/md';
import SidebarNavGroup from './_components/SidebarNavGroup';
import SidebarNavItem from './_components/SidebarNavItem';
import styles from './sideBarNav.module.css';
import AddBoxTwoToneIcon from '@mui/icons-material/AddBoxTwoTone';
// import TransferModal from 'src/components/pos/modals/TransferModal';
// import { findAllData } from 'src/services/crud.api';
// import { Toastify } from 'src/libs/allToasts';
import SupplierModal from 'src/components/pos/modals/SupplierModal';
import CustomerModal from 'src/components/pos/modals/CustomerModal';
import { PosProvider } from 'src/modules/pos/_context/PosContext';

const Soon = () => (
  <span className="soon-badge">
    <style jsx>{`
      .soon-badge {
        margin-left: 1rem;
        background-color: #9ee8f176;
        border-radius: 0.4rem;
        padding-inline: 0.42rem;
        padding-block: 0.1rem;
        color: #616060;
        font-size: 0.75rem;
        outline: 1px solid #61606081;
      }
    `}</style>
    soon
  </span>
);

// const initialPermissions = {
//   hasProducts: false,
//   hasTailoring: false,
//   hasCats: false,
//   hasTaxes: false,
//   hasPurchases: false,
//   hasSalesList: false,
//   hasPOS: false,
//   hasDiscount: false,
//   hasExpenses: false,
//   hasOrders: false,
//   hasTransfer: false,
//   hasSupplier: false,
//   hasCustomers: false,
//   hasAppearance: false,
//   hasAppStore: false,
//   hasItemSales: false,
//   hasCategorySales: false,
//   hasCurrentStock: false,
//   hasSupplierSales: false,
//   hasRegister: false,
//   hasQuotations: false,
// };

// const initialTruePermissions = Object.keys(initialPermissions).reduce((acc, key) => {
//   acc[key] = true;
//   return acc;
// }, {} as any);

export function SidebarNav({ shopId }: any): React.JSX.Element {
  const [btype, setBType] = useState('');
  const [loading, setLoading] = useState(true);

  const [activeEventKey, setActiveEventKey] = useState('');

  // const [permiss, setPermiss] = useState(initialPermissions);
  // ----------------------------------transefere modal----------------------------------------------
  // const [isAddTranseferModalOpen, setIsAddTranseferModalOpen] = useState(false);

  // const handleTranseferModalCLose = () => {
  //   setIsAddTranseferModalOpen(false);
  // };
  // async function initDataPageTransefer() {
  //   if (router.isReady) {
  //     const res = await findAllData(`transfer/${router.query.id}`);
  //     if (!res.data.success || res.data.status === 201) {
  //       Toastify('error', 'Somthing wrong!!, try agian');
  //       return;
  //     }
  //     router.push('/shop/' + shopId + '/transfers');
  //   }
  // }
  // ----------------------------------------------------------------------------------------------
  // ----------------------------------Supplier modal----------------------------------------------
  const [isAddSupplierModalOpen, setIsAddSupplierModalOpen] = useState(false);

  const handleSupplierModalClose = () => {
    setIsAddSupplierModalOpen(false);
  };

  // ----------------------------------------------------------------------------------------------
  // ----------------------------------customer modal----------------------------------------------
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);

  const handleCustomerModalClose = () => {
    setIsAddCustomerModalOpen(false);
  };

  // ----------------------------------------------------------------------------------------------

  const router = useRouter();
  const [permissions, setPermissions] = useState<any>();

  useEffect(() => {
    const localPermissions = localStorage.getItem('permissions');
    if (!localPermissions) return;

    const permsArr = JSON.parse(localStorage.getItem('permissions'));
    if (!permsArr) return;

    const perms =
      JSON.parse(localStorage.getItem('userdata')).user_type === 'owner'
        ? permsArr
        : permsArr?.filter((loc) => loc.id == shopId);

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
      hasPayment: false,
      hasPrint: false,
      hasRegisterReport: false,
      hasSalesReport: false,
      hasItemsReport: false,
      hasStockReport: false,
      hasPurchaseReport: false,
      hasAppStore: true,
    };

    perms[0]?.permissions?.map((perm) =>
      perm.name === 'products/view'
        ? (getPermissions.hasProducts = true)
        : perm.name === 'purchases/view'
        ? (getPermissions.hasPurchases = true)
        : perm.name === 'transfers/view'
        ? (getPermissions.hasTransfers = true)
        : perm.name === 'expenses/view'
        ? (getPermissions.hasExpenses = true)
        : perm.name === 'customers/view'
        ? (getPermissions.hasCustomers = true)
        : perm.name === 'suppliers/view'
        ? (getPermissions.hasSuppliers = true)
        : perm.name === 'open/register'
        ? (getPermissions.hasPos = true)
        : perm.name === 'categories/view'
        ? (getPermissions.hasCategories = true)
        : perm.name === 'brands/view'
        ? (getPermissions.hasBrands = true)
        : perm.name === 'taxes/view'
        ? (getPermissions.hasTaxes = true)
        : perm.name === 'appearance/view'
        ? (getPermissions.hasAppearance = true)
        : perm.name === 'payment/view'
        ? (getPermissions.hasPayment = true)
        : perm.name === 'appearance/viewall'
        ? (getPermissions.hasPrint = true)
        : perm.name === 'pricinggroup/view'
        ? (getPermissions.hasPricingGroups = true)
        : perm.name === 'sales-list/view'
        ? (getPermissions.hasSalesList = true)
        : perm.name === 'quotations-list/view'
        ? (getPermissions.hasQuotations = true)
        : perm.name === 'open-close'
        ? (getPermissions.hasRegisterReport = true)
        : perm.name === 'sales'
        ? (getPermissions.hasSalesReport = true)
        : perm.name === 'item-sales'
        ? (getPermissions.hasItemsReport = true)
        : perm.name === 'stock'
        ? (getPermissions.hasStockReport = true)
        : perm.name === 'purchase'
        ? (getPermissions.hasPurchaseReport = true)
        : null
    );

    setPermissions(getPermissions);
    setLoading(false);
  }, [shopId]);

  if (loading)
    return (
      <ul className="list-unstyled">
        <SidebarNavItem href={'#'}>Loading...</SidebarNavItem>
      </ul>
    );
  return (
    <ul className="list-unstyled">
      {/* <TransferModal
        shopId={shopId}
        showType={'add'}
        userdata={{}}
        customers={{}}
        statusDialog={isAddTranseferModalOpen}
        openDialog={handleTranseferModalCLose}
        initData={initDataPageTransefer}
      /> */}
      <SupplierModal
        shopId={shopId}
        showType={'add'}
        supplierId={undefined}
        customers={{}}
        statusDialog={isAddSupplierModalOpen}
        openDialog={handleSupplierModalClose}
      />
      <PosProvider>
        <CustomerModal
          shopId={shopId}
          showType={'add'}
          userdata={{}}
          statusDialog={isAddCustomerModalOpen}
          openDialog={handleCustomerModalClose}
        />
      </PosProvider>
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
        <SidebarNavGroup
          eventKey={'0'}
          toggleIcon="MdOutlineLocalGroceryStore"
          setActiveEventKey={setActiveEventKey}
          activeEventKey={activeEventKey}
          toggleText="Inventory">
          {permissions.hasProducts && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/products'}
              sub={true}
              isShown={!!router.query.id}>
              Products
              <div className={styles.drawer_plus_icon_wrapper}>
                <AddBoxTwoToneIcon
                  onClick={(e) => {
                    e.preventDefault();

                    router.push('/shop/' + shopId + '/products/add');
                  }}
                  sx={{ color: '#25a0e2' }}
                />
              </div>
            </SidebarNavItem>
          )}
          {permissions.hasPurchases && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/purchases'}
              sub={true}
              isShown={!!router.query.id}>
              Purchases
              <div className={styles.drawer_plus_icon_wrapper}>
                <AddBoxTwoToneIcon
                  onClick={(e) => {
                    e.preventDefault();
                    router.push('/shop/' + shopId + '/purchases/add');
                  }}
                  sx={{ color: '#25a0e2' }}
                />
              </div>
            </SidebarNavItem>
          )}
          {permissions.hasTransfers && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/transfers'}
              sub={true}
              isShown={!!router.query.id}>
              Transfers <Soon />
              <div className={styles.drawer_plus_icon_wrapper}>
                <AddBoxTwoToneIcon
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(`/shop/${router.query.id}/transfers/add`);
                  }}
                  sx={{ color: '#25a0e2' }}
                />
              </div>
            </SidebarNavItem>
          )}
          {permissions.hasSuppliers && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/suppliers'}
              sub={true}
              isShown={!!router.query.id}>
              Suppliers
              <div className={styles.drawer_plus_icon_wrapper}>
                <AddBoxTwoToneIcon
                  onClick={(e) => {
                    e.preventDefault();
                    setIsAddSupplierModalOpen(true);
                  }}
                  sx={{ color: '#25a0e2' }}
                />
              </div>
            </SidebarNavItem>
          )}
          {permissions.hasExpenses && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/expenses'}
              sub={true}
              isShown={!!router.query.id}>
              Expenses
              <div className={styles.drawer_plus_icon_wrapper}>
                <AddBoxTwoToneIcon
                  onClick={(e) => {
                    e.preventDefault();
                    router.push({
                      pathname: '/shop/' + shopId + '/expenses',
                      query: { add: 'true' },
                    });
                  }}
                  sx={{ color: '#25a0e2' }}
                />
              </div>
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
          <Soon />
          <small className="ms-auto"></small>
        </SidebarNavItem>
      )}

      {(permissions.hasSalesList || permissions.hasQuotations) && (
        <SidebarNavGroup
          toggleIcon="MdOutlineCrisisAlert"
          eventKey={'1'}
          setActiveEventKey={setActiveEventKey}
          activeEventKey={activeEventKey}
          toggleText="Sales">
          {permissions.hasQuotations && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/quotations'}
              sub={true}
              isShown={!!router.query.id}>
              Quotations
            </SidebarNavItem>
          )}
          {permissions.hasSalesList && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/invoices'}
              sub={true}
              isShown={!!router.query.id}>
              {' '}
              Invoices
            </SidebarNavItem>
          )}

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
          {/* <small className="ms-auto"></small> */}
          <div className={styles.drawer_plus_icon_wrapper}>
            <AddBoxTwoToneIcon
              onClick={(e) => {
                e.preventDefault();
                setIsAddCustomerModalOpen(true);
              }}
              sx={{ color: '#25a0e2' }}
            />
          </div>
        </SidebarNavItem>
      )}

      {(permissions.hasRegisterReport ||
        permissions.hasSalesReport ||
        permissions.hasItemsReport ||
        permissions.hasStockReport) && (
        <SidebarNavGroup
          toggleIcon="TbReportSearch"
          eventKey={'2'}
          setActiveEventKey={setActiveEventKey}
          activeEventKey={activeEventKey}
          toggleText="Report">
          {permissions.hasRegisterReport && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/reports/register'}
              sub={true}
              isShown={!!router.query.id}>
              Open Close Register
            </SidebarNavItem>
          )}

          {permissions.hasSalesReport && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/reports/SalesReport'}
              sub={true}
              isShown={!!router.query.id}>
              Sales Report
            </SidebarNavItem>
          )}
          {/* Eslam 20  */}
          {permissions.hasItemsReport && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/reports/ItemsReport'}
              sub={true}
              isShown={!!router.query.id}>
              Items Report{' '}
            </SidebarNavItem>
          )}
          {permissions.hasStockReport && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/reports/StockReport'}
              sub={true}
              isShown={!!router.query.id}>
              Stock Report{' '}
            </SidebarNavItem>
          )}
          {permissions.hasStockReport && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/reports/PurchaseReport'}
              sub={true}
              isShown={!!router.query.id}>
              Purchase Report{' '}
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
          App Store <Soon />
          <small className="ms-auto"></small>
        </SidebarNavItem>
      )}

      {(permissions.hasTaxes ||
        permissions.hasAppearance ||
        permissions.Categories ||
        permissions.hasPayment ||
        permissions.hasPrint) && (
        <SidebarNavGroup
          eventKey={'3'}
          toggleIcon="IoSettingsSharp"
          setActiveEventKey={setActiveEventKey}
          activeEventKey={activeEventKey}
          toggleText="Settings">
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
          {permissions.hasCategories && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/category'}
              sub={true}
              isShown={!!router.query.id}>
              Category & Brands
            </SidebarNavItem>
          )}
          {permissions.hasPayment && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/payment'}
              sub={true}
              isShown={!!router.query.id}>
              Payment Methods
            </SidebarNavItem>
          )}
          {permissions.hasPrint && (
            <SidebarNavItem
              href={'/shop/' + shopId + '/Printsetting'}
              sub={true}
              isShown={!!router.query.id}>
              Print setting
            </SidebarNavItem>
          )}
        </SidebarNavGroup>
      )}
      {permissions.hasPos && (
        <SidebarNavItem icon={faDesktop} href={'/pos/' + shopId} isShown={!!router.query.id}>
          <MdOutlinePointOfSale className="nav-icon ms-n3" />
          POS
          <small className="ms-auto"></small>
        </SidebarNavItem>
      )}
      {permissions.hasAppStore && (
        <SidebarNavItem
          icon={faCalendarDay}
          href={`/shop/${shopId}/digital/`}
          isShown={!!router.query.id}>
          <BsMenuButtonWideFill className="nav-icon ms-n3" />
          Digital Menu <Soon />
          <small className="ms-auto"></small>
        </SidebarNavItem>
      )}
    </ul>
  );
}
