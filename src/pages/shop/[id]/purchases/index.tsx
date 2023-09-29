import type { NextPage } from 'next';
import Table from 'react-bootstrap/Table';
import { AdminLayout } from '@layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Spinner from 'react-bootstrap/Spinner';
import {
  faTrash,
  faPenToSquare,
  faPlus,
  faDollarSign,
  faCheckDouble,
  faListCheck,
} from '@fortawesome/free-solid-svg-icons';
import { Button, ButtonGroup, Card } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { apiFetchCtr } from 'src/libs/dbUtils';
import { hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import { ILocationSettings, ITokenVerfy } from '@models/common-model';
import * as cookie from 'cookie';
import PurchasesQtyCheckList from 'src/components/dashboard/PurchasesQtyCheckList';
import PurchasePaymentsList from 'src/components/dashboard/PurchasePaymentsList';
import { ToastContainer } from 'react-toastify';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
} from '@mui/x-data-grid';
import withAuth from 'src/HOCs/withAuth';
import { findAllData } from 'src/services/crud.api';
import { Toastify } from 'src/libs/allToasts';
import AlertDialog from 'src/components/utils/AlertDialog';

const Purchases: NextPage = (props: any) => {
  const { shopId, id } = props;
  const [purchases, setPurchases] = useState<{ id: number; name: string; sku: string }[]>([]);
  const [isloading, setIsloading] = useState(true);
  const [locationSettings, setLocationSettings] = useState<ILocationSettings>({
    // @ts-ignore
    value: 0,
    label: '',
    currency_decimal_places: 0,
    currency_code: '',
    currency_id: 0,
    currency_rate: 1,
    currency_symbol: '',
  });
  const [isShowQtyManager, setIsShowQtyManager] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isShowPayments, setIsShowPayments] = useState(false);
  const [purchaseId, setPurchaseId] = useState(0);
  const [selectId, setSelectId] = useState(0);
  const [show, setShow] = useState(false);
  const router = useRouter();

  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', minWidth: 50 },
    {
      field: 'supplier',
      headerName: 'Supplier',
      renderCell: ({ row }: Partial<GridRowParams>) => row.supplier?.name || 'walk-in supplier',
      flex: 0.55,
    },
    {
      field: 'status',
      headerName: 'Stock Status',
      flex: 0.5,
      renderCell: ({ row }: Partial<GridRowParams>) => getStatusStyle(row.status),
    },
    {
      field: 'payment_status',
      headerName: 'Payment Status',
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => getStatusStyle(row.payment_status),
    },

    {
      field: 'total_price',
      headerName: 'Total Price',
      flex: 1,
      renderCell: (params) =>
        Number(params.value).toFixed(locationSettings?.location_decimal_places),
    },
    {
      field: 'action',
      headerName: 'Action ',
      sortable: false,
      disableExport: true,
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <ButtonGroup className="mb-2 m-buttons-style">
          <Button
            disabled={row.status == 'draft'}
            onClick={() => {
              setPurchaseId(row.id);
              setIsShowQtyManager(!isShowQtyManager);
            }}>
            <FontAwesomeIcon icon={faListCheck} />
          </Button>
          <Button
            disabled={
              row.status == 'draft' ||
              row.payment_status == 'partially_paid' ||
              row.payment_status == 'not_paid'
            }
            onClick={() => {
              if (
                row.status == 'draft' ||
                row.payment_status == 'partially_paid' ||
                row.payment_status == 'not_paid'
              )
                return;
              setPurchaseId(row.id);
              setIsShowPayments(!isShowPayments);
            }}>
            <FontAwesomeIcon icon={faDollarSign} />
          </Button>
          {permissions.hasEdit && (
            <Button onClick={() => router.push('/shop/' + id + '/purchases/edit/' + row.id)}>
              <FontAwesomeIcon icon={faPenToSquare} />
            </Button>
          )}
          {permissions.hasDelete && (
            <Button
              onClick={() => {
                setSelectId(row.id);
                setShow(true);
              }}>
              <FontAwesomeIcon icon={faTrash} />
            </Button>
          )}
        </ButtonGroup>
      ),
    },
  ];
  function CustomToolbar() {
    return (
      <GridToolbarContainer>
        <GridToolbarExport />
        <GridToolbarColumnsButton />
      </GridToolbarContainer>
    );
  }
  const handleDeleteFuc = (result: boolean, msg: string, section: string) => {
    initDataPage();
    if (msg.length > 0) Toastify(result ? 'success' : 'error', msg);
    setShow(false);
  };
  async function initDataPage() {
    setIsloading(true);
    if (router.query.id) {
      const res = await findAllData(`purchase/${router.query.id}`);
      if (res.data.success) {
        setPurchases(res.data.result);
      }
    }
    setIsloading(false);
  }
  useEffect(() => {
    var _locs = JSON.parse(localStorage.getItem('locations') || '[]');
    if (_locs.toString()?.length > 10)
      setLocationSettings(
        _locs[
          _locs.findIndex((loc: any) => {
            return loc.value == shopId;
          })
        ]
      );
    
    initDataPage();
  }, [router.asPath]);

  const [permissions, setPermissions] = useState<any>();
  useEffect(() => {
    const perms = JSON.parse(localStorage.getItem('permissions')).filter(
      (loc) => loc.id == router.query.id
    );
    const getPermissions = { hasView: false, hasInsert: false, hasEdit: false, hasDelete: false };
    perms[0]?.permissions.map((perm) =>
      perm.name.includes('purchases/add')
        ? (getPermissions.hasInsert = true)
        : perm.name.includes('purchases/update')
        ? (getPermissions.hasEdit = true)
        : perm.name.includes('purchases/delete')
        ? (getPermissions.hasDelete = true)
        : null
    );

    setPermissions(getPermissions);
  }, [router.asPath]);
  function getStatusStyle(status: string) {
    switch (status) {
      case 'paid':
      case 'received':
        return <span className="purchase-satus-style">{status}</span>;

      default:
        return <span className="purchase-satus-style paid-other">{status.split('_').join(' ')}</span>;
    }
  }

  return (
    <AdminLayout shopId={id}>
      <ToastContainer />
      <AlertDialog
        alertShow={show}
        alertFun={handleDeleteFuc}
        shopId={id}
        id={selectId}
        url={'purchase'}>
        Are you Sure You Want Delete This Item?
      </AlertDialog>
      {isShowQtyManager && (
        <PurchasesQtyCheckList
          selectedIndex={selectedIndex}
          purchases={purchases}
          locationSettings={locationSettings}
          shopId={shopId}
          purchaseId={purchaseId}
          setIsShowQtyManager={setIsShowQtyManager}
        />
      )}
      {isShowPayments && (
        <PurchasePaymentsList
          selectedIndex={selectedIndex}
          purchases={purchases}
          shopId={shopId}
          purchaseId={purchaseId}
          setIsShowPayments={setIsShowPayments}
        />
      )}
      {!isShowQtyManager && !isShowPayments && (
        <div className="row">
          <div className="col-md-12">
            {!isloading && permissions.hasInsert && (
              <div className="mb-4">
                <button
                  className="btn m-btn btn-primary p-3"
                  onClick={() => {
                    router.push('/shop/' + shopId + '/purchases/add');
                  }}>
                  <FontAwesomeIcon icon={faPlus} /> New Purchase{' '}
                </button>
              </div>
            )}
            {!isloading ? (
              <div>
                <div className="page-content-style card">
                  <h5>Product List</h5>
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
                    rows={purchases}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[10]}
                    components={{ Toolbar: CustomToolbar }}
                  />
                </div>
              </div>
            ) : (
              <div className="d-flex justify-content-around">
                <Spinner animation="grow" />
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
};
export default withAuth(Purchases);
export async function getServerSideProps({ params, query }) {
  const { id } = params;
  return {
    props: { id, shopId: query.id },
  };
}
