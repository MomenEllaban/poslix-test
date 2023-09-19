import { faEye, faPenToSquare, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminLayout } from '@layout';
import { ILocation } from '@models/auth.types';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import { ToastContainer } from 'react-toastify';
import AlertDialog from 'src/components/utils/AlertDialog';
import { useUser } from 'src/context/UserContext';
import { Toast, Toastify } from 'src/libs/allToasts';
import CustomToolbar from 'src/modules/reports/_components/CustomToolbar';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';
import Suppliermodal from '../../../../components/pos/modals/Suppliermodal';
import { apiFetchCtr } from '../../../../libs/dbUtils';
import { useSuppliersList } from 'src/services/suppliers.service';
import { ISupplier } from '@models/suppliers.types';
import ConfirmationModal from 'src/components/modals/confirmation-modal/ConfirmationModal';
import api from 'src/utils/app-api';

type TProduct = { id: number; name: string; sku: string; type: string; qty: number };

const Product: NextPage = () => {
  const router = useRouter();
  const { locationSettings, setLocationSettings } = useUser();
  const shopId = (router.query.id as string) ?? '';

  const { isLoading: isSuppliersLoading, suppliersList, error, refetch } = useSuppliersList(shopId);

  const [type, setType] = useState('');
  const [selectId, setSelectId] = useState(0);
  const [products, setProducts] = useState<TProduct[]>([]);

  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerIsModal, setCustomerIsModal] = useState(false);
  const [isOpenPriceDialog, setIsOpenPriceDialog] = useState(false);

  useEffect(() => {
    if (!shopId) return;

    const locations: ILocation[] = getLocalStorage(ELocalStorageKeys.LOCATIONS);
    const currentLocation = locations.find((location) => +location.location_id === +shopId);
    setLocationSettings(currentLocation ?? locationSettings);
  }, [shopId]);

  const customerModalHandler = (status: any) => {
    setCustomerIsModal(false);
    refetch();
  };

  const handleDeleteSupplier = (id: string | number) => {
    api.delete(`/suppliers/${id}`).then(() => {
      Toastify('success', 'Supplier removed successfully!');
      refetch();
    });
  };

  const columns: GridColDef<ISupplier>[] = [
    { field: 'id', headerName: '#', width: 60 },
    { field: 'name', headerName: 'Name', flex: 1 },
    { field: 'facility_name', headerName: 'Facility Name', flex: 1 },
    {
      field: 'invoice_address',
      headerName: 'Address',
      flex: 3,
      renderCell({ row }) {
        return `${row.invoice_address}, ${row.invoice_City}, ${row.invoice_Country}`;
      },
    },
    { field: 'postal_code', headerName: 'Postal Code', flex: 1 },
    {
      field: 'action',
      headerName: 'Action ',
      sortable: false,
      disableExport: true,
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <ButtonGroup className="mb-2 m-buttons-style">
            <Button
              onClick={(event) => {
                // router.push('/shop/' + shopId + '/customers/edit/' + row.id)
                event.stopPropagation();
              }}>
              <FontAwesomeIcon icon={faPenToSquare} />
            </Button>

            <Button
              onClick={(event) => {
                event.stopPropagation();
                setSelectId(row.id);
                setShowDeleteModal(true);
              }}>
              <FontAwesomeIcon icon={faTrash} />
            </Button>
            <ConfirmationModal
              show={showDeleteModal}
              onConfirm={() => handleDeleteSupplier(row.id)}
              onClose={() => setShowDeleteModal(false)}
              message="Are you sure you want to delete this supplier?"
            />

            <Button
              onClick={() => {
                router.push('/shop/' + shopId + '/customers/' + row.id);
              }}>
              <FontAwesomeIcon icon={faEye} />
            </Button>
          </ButtonGroup>
        </>
      ),
    },
  ];

  return (
    <>
      <AdminLayout shopId={shopId}>
        <ToastContainer />

        <div className="mb-2">
          <button
            className="btn btn-primary p-3"
            onClick={() => {
              setCustomerIsModal(true);
            }}>
            <FontAwesomeIcon icon={faPlus} /> Add New Supplier{' '}
          </button>
        </div>

        <div className="page-content-style card">
          <h5>Suppliers List</h5>
          <DataGrid
            loading={isSuppliersLoading}
            className="datagrid-style"
            sx={{
              '.MuiDataGrid-columnSeparator': {
                display: 'none',
              },
              '&.MuiDataGrid-root': {
                border: 'none',
              },
            }}
            rows={suppliersList}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            components={{ Toolbar: CustomToolbar }}
          />
        </div>
      </AdminLayout>
      <Suppliermodal
        shopId={shopId}
        showType={'add'}
        userdata={{}}
        customers={{}}
        statusDialog={customerIsModal}
        openDialog={customerModalHandler}
      />
    </>
  );
};
export default Product;
