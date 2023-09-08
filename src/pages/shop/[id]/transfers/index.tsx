import type { NextPage } from 'next';
import Image from 'next/image';
import Table from 'react-bootstrap/Table';
import { AdminLayout } from '@layout';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Spinner from 'react-bootstrap/Spinner';
import { faTrash, faPenToSquare, faPlus, faEye } from '@fortawesome/free-solid-svg-icons';
import {
  DataGrid,
  GridColDef,
  GridRowParams,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarExport,
} from '@mui/x-data-grid';
import { Button, ButtonGroup, Card } from 'react-bootstrap';
import React, { useState, useEffect } from 'react';
import { apiFetchCtr } from '../../../../libs/dbUtils';
import { useRouter } from 'next/router';
import AlertDialog from 'src/components/utils/AlertDialog';
import { redirectToLogin } from '../../../../libs/loginlib';
import { ILocationSettings, IPageRules, ITokenVerfy, ITransferItem } from '@models/common-model';
import { hasPermissions, keyValueRules, verifayTokens } from 'src/pages/api/checkUtils';
import * as cookie from 'cookie';
import ShowPriceListModal from 'src/components/dashboard/modal/ShowPriceListModal';
import { Toastify } from 'src/libs/allToasts';
import { ToastContainer } from 'react-toastify';
import Transfermodal from '../../../../components/pos/modals/Transfermodal';
import { findAllData } from 'src/services/crud.api';
const Transfer: NextPage = (props: any) => {
  const { shopId, rules } = props;
  const myLoader = (img: any) => img.src;
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
  const router = useRouter();
  const [products, setProducts] = useState<
    { id: number; name: string; sku: string; type: string; qty: number }[]
  >([]);
  const [show, setShow] = useState(false);
  const [selectId, setSelectId] = useState(0);
  const [type, setType] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isOpenPriceDialog, setIsOpenPriceDialog] = useState(false);

  async function initDataPage() {
    if(router.isReady) {
      const res = await findAllData(`transfer/${router.query.id}`)
      if (!res.data.success || res.data.status === 201) {
        Toastify('error', 'Somthing wrong!!, try agian');
        return;
      }
      setProducts(res.data.result);
      setIsLoading(false);
    }
  }

  useEffect(() => {
    var _locs = JSON.parse(localStorage.getItem('locations') || '[]');
    if (_locs.toString().length > 10)
      setLocationSettings(
        _locs[
          _locs.findIndex((loc: any) => {
            return loc.value == shopId;
          })
        ]
      );
    else alert('errorr location settings');
    initDataPage();
  }, [router.asPath]);

  const [permissions, setPermissions] = useState<any>();
  useEffect(() => {
    const perms = JSON.parse(localStorage.getItem('permissions'));
    const getPermissions = { hasView: false, hasInsert: false, hasEdit: false, hasDelete: false };
    perms.inventory.map((perm) =>
        perm.name.includes('inventory transfers GET')
        ? (getPermissions.hasView = true)
        : perm.name.includes('inventory transfers POST')
        ? (getPermissions.hasInsert = true)
        : perm.name.includes('inventory transfers PUT')
        ? (getPermissions.hasEdit = true)
        : perm.name.includes('inventory transfers DELETE')
        ? (getPermissions.hasDelete = true)
        : null
    );

    setPermissions(getPermissions);
  }, []);

  const [customerIsModal, setCustomerIsModal] = useState<boolean>(false);
  const customerModalHandler = (trans: ITransferItem) => {
    setCustomerIsModal(false);
    setTransferList((prev) => prev.concat(trans));

    // initDataPage();
  };

  const handleClick = (index: number) => {
    if (products[index].type != 'package' && products[index].qty > 0) {
      setSelectId(products[index].id);
      setType(products[index].type);
      setIsOpenPriceDialog(true);
    }
  };
  const handleDeleteFuc = (result: boolean, msg: string, section: string) => {
    if (result) {
      const _data = [...products];
      const idx = _data.findIndex((itm: any) => itm.id == selectId);

      if (idx != -1) {
        _data.splice(idx, 1);
        setProducts(_data);
      }
    }
    if (msg.length > 0) Toastify(result ? 'success' : 'error', msg);
    setShow(false);
  };

  const [transferList, setTransferList] = useState<ITransferItem[]>([]);

  const columns: GridColDef[] = [
    { field: 'id', headerName: '#', minWidth: 50 },
    { field: 'date', headerName: 'Date', flex: 1 },
    { field: 'refNo', headerName: 'Refrence No', flex: 1 },
    { field: 'status', headerName: 'Status', flex: 1 },
    { field: 'location_id', headerName: 'Location From', flex: 1 },
    { field: 'transferred_location_id', headerName: 'Location To', flex: 1 },
    {
      field: 'name',
      headerName: 'Product',
      flex: 1,
      valueGetter: (params) => {
        let name = '';
        params.row.products.map(prod => {name += prod.name + ', '})
        return name
      },
    },
    // {
    //   field: 'qty',
    //   headerName: 'Quantity',
    //   flex: 1,
    //   valueGetter: (params) => params.row.product.qty,
    // },
    // {
    //   field: 'totalPrice',
    //   headerName: 'Total Price',
    //   flex: 1,
    //   valueGetter: (params) => params.row.product.totalPrice,
    // },

    {
      field: 'action',
      headerName: 'Action ',
      sortable: false,
      disableExport: true,
      flex: 1,
      renderCell: ({ row }: Partial<GridRowParams>) => (
        <>
          <ButtonGroup className="mb-2 m-buttons-style">
            {permissions.hasEdit && (
              <Button
                onClick={(event) => {
                  // router.push('/shop/' + shopId + '/customers/edit/' + row.id)
                  event.stopPropagation();
                }}>
                <FontAwesomeIcon icon={faPenToSquare} />
              </Button>
            )}
            {permissions.hasDelete && (
              <Button
                onClick={(event) => {
                  event.stopPropagation();
                  setSelectId(row.id);
                  setShow(true);
                }}>
                <FontAwesomeIcon icon={faTrash} />
              </Button>
            )}
            <Button
              onClick={() => {
                //   router.push("/shop/" + shopId + "/customers/" + row.id);
              }}>
              <FontAwesomeIcon icon={faEye} />
            </Button>
          </ButtonGroup>
        </>
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
  return (
    <>
      <AdminLayout shopId={shopId}>
        <ToastContainer />
        <AlertDialog
          alertShow={show}
          alertFun={handleDeleteFuc}
          shopId={shopId}
          id={selectId}
          url={'transfer'}>
          Are you Sure You Want Delete This Item ?
        </AlertDialog>
        {!isLoading && permissions.hasInsert && (
          <div className="mb-2">
            <button
              className="btn btn-primary p-3"
              onClick={() => {
                setCustomerIsModal(true);
              }}>
              <FontAwesomeIcon icon={faPlus} /> Add New Transfer{' '}
            </button>
          </div>
        )}
        {!isLoading ? (
          <div className="page-content-style card">
            <h5>Transfers List</h5>
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
              rows={products}
              columns={columns}
              pageSize={10}
              rowsPerPageOptions={[10]}
              components={{ Toolbar: CustomToolbar }}
            />
          </div>
        ) : (
          <div className="d-flex justify-content-around">
            <Spinner animation="grow" />
          </div>
        )}
      </AdminLayout>
      <Transfermodal
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
export default Transfer;