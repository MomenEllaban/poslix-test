import { faEye, faPenToSquare, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { AdminLayout } from '@layout';
import { ILocationSettings, ITransferItem } from '@models/common-model';
import { DataGrid, GridColDef, GridRowParams } from '@mui/x-data-grid';
import type { NextPage } from 'next';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { Button, ButtonGroup } from 'react-bootstrap';
import Spinner from 'react-bootstrap/Spinner';
import { ToastContainer } from 'react-toastify';
import withAuth from 'src/HOCs/withAuth';
import TransferModal from 'src/components/pos/modals/TransferModal';
import AlertDialog from 'src/components/utils/AlertDialog';
import { Toastify } from 'src/libs/allToasts';
import CustomToolbar from 'src/modules/reports/_components/CustomToolbar';
import { findAllData } from 'src/services/crud.api';

const Transfer: NextPage = (props: any) => {
  const { shopId, id } = props;
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
    if (router.isReady) {
      const res = await findAllData(`transfer/${router.query.id}`);
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
    const perms = JSON.parse(localStorage.getItem('permissions')).filter(
      (loc) => loc.id == router.query.id
    );
    const getPermissions = { hasView: false, hasInsert: false, hasEdit: false, hasDelete: false };
    perms[0]?.permissions.map((perm) =>
      perm.name.includes('transfers/show')
        ? (getPermissions.hasView = true)
        : perm.name.includes('transfers/add')
        ? (getPermissions.hasInsert = true)
        : perm.name.includes('transfers/update')
        ? (getPermissions.hasEdit = true)
        : perm.name.includes('transfers/delete')
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
        params.row.products.map((prod) => {
          name += prod.name + ', ';
        });
        return name;
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
  // function CustomToolbar() {
  //   return (
  //     <GridToolbarContainer>
  //       <GridToolbarExport />
  //       <GridToolbarColumnsButton />
  //     </GridToolbarContainer>
  //   );
  // }
  return (
    <>
      <AdminLayout shopId={id}>
        <ToastContainer />
        <AlertDialog
          alertShow={show}
          alertFun={handleDeleteFuc}
          shopId={id}
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
      <TransferModal
        shopId={shopId}
        showType={'add'}
        userdata={{}}
        customers={{}}
        statusDialog={customerIsModal}
        openDialog={customerModalHandler}
        initData={initDataPage}
      />
    </>
  );
};
export default withAuth(Transfer);
export async function getServerSideProps({ params }) {
  const { id } = params;
  return {
    props: { id },
  };
}
