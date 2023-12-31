import { faEye, faPenToSquare, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminLayout } from '@layout';
import { ILocation } from '@models/auth.types';
import { ISupplier } from '@models/suppliers.types';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import type { NextPage } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import { ToastContainer } from 'react-toastify';
import ConfirmationModal from 'src/components/modals/confirmation-modal/ConfirmationModal';
import SupplierModal from 'src/components/pos/modals/SupplierModal';
import { useUser } from 'src/context/UserContext';
import { Toastify } from 'src/libs/allToasts';
import CustomToolbar from 'src/modules/reports/_components/CustomToolbar';
import { useSuppliersList } from 'src/services/suppliers.service';
import api from 'src/utils/app-api';
import { ELocalStorageKeys, getLocalStorage } from 'src/utils/local-storage';
import { useTranslation } from 'next-i18next';

type TProduct = { id: number; name: string; sku: string; type: string; qty: number };

const Suppliers: NextPage = (props: any) => {
  const router = useRouter();
  const { locationSettings, setLocationSettings } = useUser();
  const { id } = props;
  const { t } = useTranslation();
  const shopId = id;

  const { isLoading: isSuppliersLoading, suppliersList, error, refetch } = useSuppliersList(shopId);

  const [type, setType] = useState<'add' | 'edit' | 'show'>('show');
  const [selectId, setSelectId] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [supplierModal, setSupplierModal] = useState(false);

  const customerModalHandler = (status: any) => {
    setSupplierModal(false);
    refetch();
  };

  const handleDeleteSupplier = (id: string | number) => {
    setIsLoading(true);
    api
      .delete(`/suppliers/${id}`)
      .then(() => {
        Toastify('success', 'Supplier removed successfully!');
        refetch();
      })
      .catch(() => {
        Toastify('error', 'Something went wrong!');
      })
      .finally(() => {
        setIsLoading(false);
        setShowDeleteModal(false);
      });
  };

  const columns: GridColDef<ISupplier>[] = [
    { field: 'id', headerName: '#', width: 60 },
    { field: 'name', headerName: t('supplier.name'), flex: 1 },
    { field: 'facility_name', headerName: t('supplier.facility_name'), flex: 1 },
    {
      field: 'invoice_address',
      headerName: t('supplier.address'),
      flex: 3,
      renderCell({ row }) {
        return `${row.invoice_address == null ? '' : row.invoice_address} ${
          row.invoice_City == null ? '' : row.invoice_City
        }  ${row.invoice_Country == null ? '' : row.invoice_Country} `;
      },
    },
    { field: 'postal_code', headerName: t('supplier.postal_code'), flex: 1 },
    {
      field: 'action',
      headerName: t('supplier.action'),
      sortable: false,
      disableExport: true,
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <ButtonGroup className="mb-2 m-buttons-style">
          <Button
            onClick={(event) => {
              event.stopPropagation();
              setType('edit');
              setSelectId(row.id);
              setSupplierModal(true);
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
            onConfirm={() => {
              handleDeleteSupplier(selectId), console.log(selectId);
            }}
            onClose={() => setShowDeleteModal(false)}
            message={t('alert_dialog.delete_supplier')}
          />

          <Button
            onClick={() => {
              setType('show');
              setSelectId(row.id);
              setSupplierModal(true);
              // router.push('/shop/' + shopId + '/customers/' + row.id);
            }}>
            <FontAwesomeIcon icon={faEye} />
          </Button>
        </ButtonGroup>
      ),
    },
  ];

  useEffect(() => {
    if (!shopId) return;

    const locations: ILocation[] = getLocalStorage(ELocalStorageKeys.LOCATIONS);
    const currentLocation = locations.find((location) => +location.location_id === +shopId);
    setLocationSettings(currentLocation ?? locationSettings);
  }, [shopId]);

  return (
    <>
      <AdminLayout shopId={shopId}>
        <ToastContainer />

        <div className="mb-2">
          <button
            className="btn btn-primary p-3"
            onClick={() => {
              setType('add');
              setSupplierModal(true);
            }}>
            <FontAwesomeIcon icon={faPlus} /> {t('supplier.add_new_supplier')}{' '}
          </button>
        </div>

        <div className="page-content-style card">
          <h5>{t('supplier.supplier_list')}</h5>
          <DataGrid
            loading={isSuppliersLoading}
            className="datagrid-style"
            sx={{
              '.MuiDataGrid-columnSeparator': { display: 'none' },
              '&.MuiDataGrid-root': { border: 'none' },
            }}
            rows={suppliersList}
            columns={columns}
            pageSize={10}
            rowsPerPageOptions={[10]}
            components={{ Toolbar: CustomToolbar }}
          />
        </div>
      </AdminLayout>
      <SupplierModal
        shopId={shopId}
        showType={type}
        supplierId={selectId}
        customers={{}}
        statusDialog={supplierModal}
        openDialog={customerModalHandler}
      />
    </>
  );
};
export default Suppliers;
export async function getServerSideProps({ params, locale }) {
  const { id } = params;
  return {
    props: { id, ...(await serverSideTranslations(locale)) },
  };
}
