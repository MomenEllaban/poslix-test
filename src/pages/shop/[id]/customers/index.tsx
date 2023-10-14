import { faPlus } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminLayout } from '@layout';
import { ILocation } from '@models/auth.types';
import { ICustomer } from '@models/pos.types';
import { DataGrid } from '@mui/x-data-grid';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useMemo, useState } from 'react';
import Spinner from 'react-bootstrap/Spinner';
import { ToastContainer } from 'react-toastify';
import withAuth from 'src/HOCs/withAuth';
import AlertDialog from 'src/components/utils/AlertDialog';
import { useUser } from 'src/context/UserContext';
import { Toastify } from 'src/libs/allToasts';
import customersColumns from 'src/modules/customers/customers-columns';
import CustomToolbar from 'src/modules/reports/_components/CustomToolbar';
import { findAllData } from 'src/services/crud.api';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';
import Customermodal from '../../../../components/pos/modals/CustomerModal';
import { useProducts } from '../../../../context/ProductContext';
import { PosProvider } from 'src/modules/pos/_context/PosContext';

interface ISelectionCustomer extends Partial<ICustomer> {
  value: string;
  label: string;
  isNew: boolean;
}

const initialCustomer = {
  value: '1',
  label: 'walk-in customer',
  isNew: false,
};

const Customers: NextPage = ({ id }: any) => {
  const router = useRouter();

  const { customers } = useProducts();
  const { locationSettings, setLocationSettings } = useUser();

  const [show, setShow] = useState(false);
  const [selectId, setSelectId] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [customersList, setCustomers] = useState<ICustomer[]>([]);
  const [permissions, setPermissions] = useState<any>();
  const [showType, setShowType] = useState(String);
  const [customer, setCustomer] = useState<ISelectionCustomer>(initialCustomer);
  const [customerIsModal, setCustomerIsModal] = useState<boolean>(false);

  const shopId = router.query.id ?? '';

  const customerModalHandler = (status: any) => {
    setCustomerIsModal(false);
    initDataPage();
  };

  async function initDataPage() {
    if (router.query.id) {
      const res = await findAllData(`customers/${router.query.id}`);
      if (res.data.status !== 200) {
        Toastify('error', 'Somthing wrong!!, try agian');
        return;
      }
      setCustomers(res.data.result);
    }
    setIsLoading(false);
  }

  const handleDeleteFuc = (result: boolean, msg: string, section: string) => {
    if (msg.length > 0) Toastify(result ? 'success' : 'error', msg);
    initDataPage();
    setShow(false);
  };
  const onRowsSelectionHandler = (ids: any) => {};
  const columns = useMemo(
    () =>
      customersColumns({
        id,
        permissions,
        setCustomer,
        setShowType,
        setShow,
        setSelectId,
        router,
        setCustomerIsModal,
      }),
    [id, permissions, router]
  );

  /*********************************************/
  useEffect(() => {
    initDataPage();

    const perms = JSON.parse(localStorage.getItem('permissions')).filter(
      (loc) => loc.id == router.query.id
    );

    const getPermissions = { hasView: false, hasInsert: false, hasEdit: false, hasDelete: false };
    perms[0]?.permissions?.map((perm) =>
      perm.name.includes('customers/show')
        ? (getPermissions.hasView = true)
        : perm.name.includes('customers/add')
        ? (getPermissions.hasInsert = true)
        : perm.name.includes('customers/update')
        ? (getPermissions.hasEdit = true)
        : perm.name.includes('customers/delete')
        ? (getPermissions.hasDelete = true)
        : null
    );

    setPermissions(getPermissions);
  }, [router.asPath]);

  useEffect(() => {
    if (!shopId) return;

    const locations: ILocation[] = getLocalStorage(ELocalStorageKeys.LOCATIONS);
    const currentLocation = locations?.find((location) => +location.location_id === +shopId);
    setLocationSettings(currentLocation ?? locationSettings);

    initDataPage();
  }, [shopId]);

  return (
    <PosProvider>
      <AdminLayout shopId={id}>
        <ToastContainer />
        <AlertDialog
          alertShow={show}
          alertFun={handleDeleteFuc}
          shopId={id}
          id={selectId}
          url={'customers'}>
          Are you Sure You Want Delete This Customer ?
        </AlertDialog>
        {/* start */}
        {/* router.push('/shop/' + shopId + '/customers/add') */}
        {!isLoading && permissions?.hasInsert && (
          <div className="mb-2">
            <button
              className="btn btn-primary p-3"
              onClick={() => {
                setShowType('add');
                setCustomerIsModal(true);
              }}>
              <FontAwesomeIcon icon={faPlus} /> Add New Customer{' '}
            </button>
          </div>
        )}
        {!isLoading ? (
          <div className="page-content-style card">
            <h5>Customer List</h5>
            <DataGrid
              className="datagrid-style"
              sx={{
                '.MuiDataGrid-columnSeparator': {
                  display: 'none',
                },
                '&.MuiDataGrid-root': {
                  border: 'none',
                },
              }}
              rows={customersList}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              onSelectionModelChange={(ids: any) => onRowsSelectionHandler(ids)}
              components={{ Toolbar: CustomToolbar }}
            />
          </div>
        ) : (
          <div className="d-flex justify-content-around">
            <Spinner animation="grow" />
          </div>
        )}
      </AdminLayout>
      <Customermodal
        shopId={id}
        showType={showType}
        userdata={customer}
        customers={customers}
        statusDialog={customerIsModal}
        openDialog={customerModalHandler}
      />
    </PosProvider>
  );
};

export default withAuth(Customers);

export async function getServerSideProps({ params }) {
  const { id } = params;
  return {
    props: { id },
  };
}
